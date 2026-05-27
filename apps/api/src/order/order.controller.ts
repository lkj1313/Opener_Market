import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateSubOrderStatusDto } from './dto/update-sub-order-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // POST /orders
  // 주문 생성 (BUYER)
  @Post()
  @Roles(Role.BUYER)
  async create(
    @Body() dto: CreateOrderDto,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.create(dto, userId);
  }

  // GET /orders
  // 내 주문 목록 (BUYER)
  @Get()
  @Roles(Role.BUYER)
  async findMyOrders(@GetUser('userId') userId: string) {
    return this.orderService.findMyOrders(userId);
  }

  // GET /orders/:id
  // 주문 상세 (BUYER)
  @Get(':id')
  @Roles(Role.BUYER)
  async findOne(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.findOne(id, userId);
  }

  // DELETE /orders/:id
  // 주문 취소 (BUYER)
  @Delete(':id')
  @Roles(Role.BUYER)
  async cancel(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.cancel(id, userId);
  }

  // POST /orders/:id/pay
  // 주문 결제 (BUYER)
  @Post(':id/pay')
  @Roles(Role.BUYER)
  async pay(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.pay(id, userId);
  }

  // GET /orders/seller/sub-orders
  // 판매자용 SubOrder 목록 (SELLER)
  @Get('seller/sub-orders')
  @Roles(Role.SELLER)
  async findSellerSubOrders(@GetUser('userId') userId: string) {
    return this.orderService.findSellerSubOrders(userId);
  }

  // PATCH /orders/sub-orders/:id/status
  // 판매자용 SubOrder 상태 변경 (SELLER)
  @Patch('sub-orders/:id/status')
  @Roles(Role.SELLER)
  async updateSubOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSubOrderStatusDto,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.updateSubOrderStatus(id, dto, userId);
  }

  // POST /orders/sub-orders/:id/confirm
  // 구매 확정 (BUYER)
  @Post('sub-orders/:id/confirm')
  @Roles(Role.BUYER)
  async confirm(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.confirm(id, userId);
  }
}
