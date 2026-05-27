import { Injectable } from '@nestjs/common';
import {
  calculateSkip,
  createPaginatedResult,
  normalizePagination,
} from '@opener/shared';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { REVIEW_ERROR_CODES } from './error-codes/review.error-code';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderStatus } from '../generated/prisma/enums';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // 리뷰 작성 (BUYER)
  async create(dto: CreateReviewDto, userId: string, productId: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: dto.orderItemId },
      include: {
        product: true,
        subOrder: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!orderItem) {
      throw new BaseException(REVIEW_ERROR_CODES.REVIEW_ORDER_ITEM_NOT_FOUND);
    }

    if (orderItem.productId !== productId) {
      throw new BaseException(REVIEW_ERROR_CODES.REVIEW_NOT_PURCHASED);
    }

    if (orderItem.subOrder.order.userId !== userId) {
      throw new BaseException(REVIEW_ERROR_CODES.REVIEW_FORBIDDEN);
    }

    if (
      orderItem.subOrder.status !== OrderStatus.DELIVERED ||
      !orderItem.subOrder.confirmedAt
    ) {
      throw new BaseException(REVIEW_ERROR_CODES.REVIEW_NOT_PURCHASED);
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { orderItemId: dto.orderItemId },
    });

    if (existingReview) {
      throw new BaseException(REVIEW_ERROR_CODES.REVIEW_ALREADY_EXISTS);
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          productId,
          userId,
          orderItemId: dto.orderItemId,
          rating: dto.rating,
          content: dto.content,
        },
      });

      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { reviewCount: true, rating: true },
      });

      if (!product) {
        throw new BaseException(REVIEW_ERROR_CODES.REVIEW_ORDER_ITEM_NOT_FOUND);
      }

      const newReviewCount = product.reviewCount + 1;
      const newRating = product.rating
        ? (product.rating * product.reviewCount + dto.rating) / newReviewCount
        : dto.rating;

      await tx.product.update({
        where: { id: productId },
        data: {
          reviewCount: newReviewCount,
          rating: newRating,
        },
      });

      return review;
    });
  }

  // 상품별 리뷰 목록 (공개)
  async findByProduct(productId: string, page?: number, limit?: number) {
    const { page: p, limit: l } = normalizePagination(page, limit);
    const skip = calculateSkip(p, l);

    const where = {
      productId,
      isHidden: false,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        include: {
          user: {
            select: {
              nickname: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return createPaginatedResult(reviews, total, p, l);
  }

  // 어드민: 전체 리뷰 목록
  async findAllForAdmin(page?: number, limit?: number) {
    const { page: p, limit: l } = normalizePagination(page, limit);
    const skip = calculateSkip(p, l);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        include: {
          product: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              nickname: true,
            },
          },
        },
      }),
      this.prisma.review.count(),
    ]);

    return createPaginatedResult(reviews, total, p, l);
  }

  // 어드민: 리뷰 숨김 처리
  async hideByAdmin(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new BaseException(REVIEW_ERROR_CODES.REVIEW_NOT_FOUND);
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isHidden: true },
    });
  }
}
