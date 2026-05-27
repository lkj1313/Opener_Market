import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { ORDER_ERROR_CODES } from './error-codes/order.error-code';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateSubOrderStatusDto } from './dto/update-sub-order-status.dto';
import { OrderStatus } from '../generated/prisma/enums';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 주문 생성 (장바구니 → 주문)
  async create(dto: CreateOrderDto, userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: true,
                discounts: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BaseException(ORDER_ERROR_CODES.CART_EMPTY);
    }

    // 재고 확인
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new BaseException(ORDER_ERROR_CODES.STOCK_INSUFFICIENT);
      }
    }

    // 판매자별 그룹핑
    const itemsBySeller = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const sellerId = item.product.sellerId;
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId)!.push(item);
    }

    // 트랜잭션으로 주문 생성 + 재고 차감 + 장바구니 비우기
    return this.prisma.$transaction(async (tx) => {
      // Order 생성
      const order = await tx.order.create({
        data: {
          userId,
          address: dto.address,
        },
      });

      // 판매자별 SubOrder + OrderItem 생성
      for (const [sellerId, items] of itemsBySeller) {
        const subTotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );

        const shippingFee = 3000; // 기본 배송비 (TODO: Seller 설정에서 가져오기)

        const subOrder = await tx.subOrder.create({
          data: {
            orderId: order.id,
            sellerId,
            totalAmount: subTotal,
            shippingFee,
          },
        });

        // OrderItem 생성
        for (const item of items) {
          await tx.orderItem.create({
            data: {
              subOrderId: subOrder.id,
              productId: item.product.id,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            },
          });

          // 재고 차감
          await tx.product.update({
            where: { id: item.product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 장바구니 비우기
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              shippingFee: true,
              trackingNumber: true,
              shippingCompany: true,
              shippedAt: true,
              deliveredAt: true,
              confirmedAt: true,
              isSettled: true,
              isAutoConfirmed: true,
              createdAt: true,
              seller: {
                select: {
                  shopName: true,
                },
              },
              items: {
                select: {
                  id: true,
                  productName: true,
                  price: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });
    });
  }

  // 2. 내 주문 목록
  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            shippingFee: true,
            trackingNumber: true,
            shippingCompany: true,
            shippedAt: true,
            deliveredAt: true,
            confirmedAt: true,
            isSettled: true,
            isAutoConfirmed: true,
            createdAt: true,
            seller: {
              select: {
                shopName: true,
              },
            },
            items: {
              select: {
                id: true,
                productName: true,
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });
  }

  // 3. 주문 상세
  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            shippingFee: true,
            trackingNumber: true,
            shippingCompany: true,
            shippedAt: true,
            deliveredAt: true,
            confirmedAt: true,
            isSettled: true,
            isAutoConfirmed: true,
            createdAt: true,
            seller: {
              select: {
                shopName: true,
              },
            },
            items: {
              select: {
                id: true,
                productName: true,
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_NOT_FOUND);
    }

    if (order.userId !== userId) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN);
    }

    return order;
  }

  // 4. 주문 취소
  async cancel(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_NOT_FOUND);
    }

    if (order.userId !== userId) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN);
    }

    // 이미 취소되었거나 배송 완료된 주문은 취소 불가
    for (const subOrder of order.items) {
      if (subOrder.status === OrderStatus.CANCELLED) {
        throw new BaseException(ORDER_ERROR_CODES.CANNOT_CANCEL);
      }
      if (subOrder.status === OrderStatus.DELIVERED) {
        throw new BaseException(ORDER_ERROR_CODES.CANNOT_CANCEL);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // SubOrder 상태 변경 + 재고 복구
      for (const subOrder of order.items) {
        await tx.subOrder.update({
          where: { id: subOrder.id },
          data: { status: OrderStatus.CANCELLED },
        });

        for (const item of subOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              shippingFee: true,
              trackingNumber: true,
              shippingCompany: true,
              shippedAt: true,
              deliveredAt: true,
              confirmedAt: true,
              isSettled: true,
              isAutoConfirmed: true,
              createdAt: true,
              seller: {
                select: {
                  shopName: true,
                },
              },
              items: {
                select: {
                  id: true,
                  productName: true,
                  price: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });
    });
  }

  // 5. 판매자용: 내 SubOrder 목록
  async findSellerSubOrders(userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN);
    }

    return this.prisma.subOrder.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            address: true,
            createdAt: true,
          },
        },
        items: {
          select: {
            id: true,
            productName: true,
            price: true,
            quantity: true,
          },
        },
      },
    });
  }

  // 6. 판매자용: SubOrder 상태 변경
  async updateSubOrderStatus(
    subOrderId: string,
    dto: UpdateSubOrderStatusDto,
    userId: string,
  ) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN);
    }

    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: subOrderId },
    });

    if (!subOrder) {
      throw new BaseException(ORDER_ERROR_CODES.SUB_ORDER_NOT_FOUND);
    }

    if (subOrder.sellerId !== seller.id) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN);
    }

    const updateData: any = {
      status: dto.status,
    };

    if (dto.trackingNumber) {
      updateData.trackingNumber = dto.trackingNumber;
    }

    if (dto.shippingCompany) {
      updateData.shippingCompany = dto.shippingCompany;
    }

    if (dto.status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }

    if (dto.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    return this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: updateData,
    });
  }

  // 7. 주문 결제 (잔액 차감)
  async pay(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_NOT_FOUND);
    }

    if (order.userId !== userId) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN);
    }

    // 이미 결제되었거나 취소된 주문인지 확인
    for (const subOrder of order.items) {
      if (subOrder.status === OrderStatus.PAID) {
        throw new BaseException(ORDER_ERROR_CODES.ALREADY_PAID);
      }
      if (subOrder.status === OrderStatus.CANCELLED) {
        throw new BaseException(ORDER_ERROR_CODES.CANNOT_CANCEL);
      }
    }

    // 총 결제 금액 계산
    const finalAmount = order.items.reduce(
      (sum, sub) => sum + sub.totalAmount + sub.shippingFee,
      0,
    );

    // 잔액 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user || user.balance < finalAmount) {
      throw new BaseException(ORDER_ERROR_CODES.INSUFFICIENT_BALANCE);
    }

    // 트랜잭션: 잔액 차감 + 상태 변경 + 거래 기록
    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: finalAmount } },
      });

      for (const subOrder of order.items) {
        await tx.subOrder.update({
          where: { id: subOrder.id },
          data: { status: OrderStatus.PAID },
        });
      }

      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'USE',
          amount: finalAmount,
          balanceAfter: updatedUser.balance,
          orderId,
        },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              shippingFee: true,
              trackingNumber: true,
              shippingCompany: true,
              shippedAt: true,
              deliveredAt: true,
              confirmedAt: true,
              isSettled: true,
              isAutoConfirmed: true,
              createdAt: true,
              seller: {
                select: {
                  shopName: true,
                },
              },
              items: {
                select: {
                  id: true,
                  productName: true,
                  price: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });
    });
  }

  // 8. 구매자용: 구매 확정 (수동)
  async confirm(subOrderId: string, userId: string) {
    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: subOrderId },
      include: {
        order: { select: { userId: true } },
      },
    });

    if (!subOrder) {
      throw new BaseException(ORDER_ERROR_CODES.SUB_ORDER_NOT_FOUND);
    }

    if (subOrder.order.userId !== userId) {
      throw new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN);
    }

    if (subOrder.status !== OrderStatus.DELIVERED) {
      throw new BaseException(ORDER_ERROR_CODES.NOT_DELIVERED);
    }

    if (subOrder.isSettled || subOrder.confirmedAt) {
      throw new BaseException(ORDER_ERROR_CODES.ALREADY_CONFIRMED);
    }

    return this.processConfirmation(subOrder, false);
  }

  // 9. 자동 구매 확정 (매일 새벽 04:00)
  @Cron('0 4 * * *')
  async handleAutoConfirm() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const subOrders = await this.prisma.subOrder.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        isSettled: false,
        deliveredAt: { lte: sevenDaysAgo },
      },
      include: {
        order: { select: { userId: true } },
      },
    });

    for (const subOrder of subOrders) {
      try {
        await this.processConfirmation(subOrder, true);
      } catch (error) {
        console.error(`Auto confirm failed for SubOrder ${subOrder.id}:`, error);
      }
    }
  }

  // 공통 확정 처리 로직
  private async processConfirmation(
    subOrder: any,
    isAuto: boolean,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. SubOrder 확정 처리
      const updatedSubOrder = await tx.subOrder.update({
        where: { id: subOrder.id },
        data: {
          confirmedAt: new Date(),
          isSettled: true,
          isAutoConfirmed: isAuto,
        },
      });

      // 2. 판매자 정산 (95%)
      const settlementAmount = Math.floor(subOrder.totalAmount * 0.95);
      await tx.seller.update({
        where: { id: subOrder.sellerId },
        data: { balance: { increment: settlementAmount } },
      });

      // 3. 구매자 포인트 적립 (2.5%)
      const pointAmount = Math.floor(subOrder.totalAmount * 0.025);
      const updatedUser = await tx.user.update({
        where: { id: subOrder.order.userId },
        data: { point: { increment: pointAmount } },
      });

      // 4. 포인트 거래 내역 기록
      await tx.pointTransaction.create({
        data: {
          userId: subOrder.order.userId,
          type: 'EARN',
          amount: pointAmount,
          pointAfter: updatedUser.point,
          description: isAuto
            ? '자동 구매 확정 포인트 적립'
            : '구매 확정 포인트 적립',
          orderId: subOrder.orderId,
        },
      });

      return updatedSubOrder;
    });
  }
}
