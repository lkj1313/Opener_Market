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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewListResponseDto } from './dto/review-list-response.dto';
import { AdminReviewListResponseDto } from './dto/admin-review-list-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Review')
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('products/:id/reviews')
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰 작성 (BUYER)' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201, description: '리뷰 작성 성공', type: ReviewResponseDto })
  async create(
    @Param('id') productId: string,
    @Body() dto: CreateReviewDto,
    @GetUser('userId') userId: string,
  ) {
    return this.reviewService.create(dto, userId, productId);
  }

  @Get('products/:id/reviews')
  @Public()
  @ApiOperation({ summary: '상품별 리뷰 목록 (공개)' })
  @ApiResponse({ status: 200, description: '리뷰 목록', type: ReviewListResponseDto })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
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

  @Get('admin/reviews')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '전체 리뷰 목록 (ADMIN)' })
  @ApiResponse({ status: 200, description: '리뷰 목록', type: AdminReviewListResponseDto })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAllForAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewService.findAllForAdmin(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Patch('admin/reviews/:id/hide')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰 숨김 처리 (ADMIN)' })
  @ApiResponse({ status: 200, description: '숨김 처리된 리뷰', type: ReviewResponseDto })
  @ApiParam({ name: 'id', description: '리뷰 ID' })
  async hideByAdmin(@Param('id') reviewId: string) {
    return this.reviewService.hideByAdmin(reviewId);
  }
}
