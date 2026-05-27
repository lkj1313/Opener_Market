import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // POST /products/:id/reviews
  // 리뷰 작성 (BUYER)
  @Post('products/:id/reviews')
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') productId: string,
    @Body() dto: CreateReviewDto,
    @GetUser('userId') userId: string,
  ) {
    return this.reviewService.create(dto, userId, productId);
  }

  // GET /products/:id/reviews
  // 상품별 리뷰 목록 (공개)
  @Get('products/:id/reviews')
  @Public()
  async findByProduct(
    @Param('id') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewService.findByProduct(
      productId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // GET /admin/reviews
  // 어드민: 전체 리뷰 목록
  @Get('admin/reviews')
  @Roles(Role.ADMIN)
  async findAllForAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewService.findAllForAdmin(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // PATCH /admin/reviews/:id/hide
  // 어드민: 리뷰 숨김 처리
  @Patch('admin/reviews/:id/hide')
  @Roles(Role.ADMIN)
  async hideByAdmin(@Param('id') reviewId: string) {
    return this.reviewService.hideByAdmin(reviewId);
  }
}
