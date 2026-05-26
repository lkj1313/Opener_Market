import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SellerApplicationService } from './seller-application.service';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto';
import { RejectSellerApplicationDto } from './dto/reject-seller-application.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('seller-applications')
export class SellerApplicationController {
  constructor(
    private readonly sellerApplicationService: SellerApplicationService,
  ) {}

  // POST /seller-applications
  // 구매자가 판매자 신청을 제출
  @Post()
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSellerApplicationDto,
    @GetUser('userId') userId: string,
  ) {
    return this.sellerApplicationService.create(dto, userId);
  }

  // GET /seller-applications/me
  // 내 판매자 신청 내역 조회
  @Get('me')
  @Roles(Role.BUYER, Role.SELLER)
  async findMyApplication(@GetUser('userId') userId: string) {
    return this.sellerApplicationService.findMyApplication(userId);
  }

  // GET /seller-applications
  // 전체 판매자 신청 목록 (관리자용)
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.sellerApplicationService.findAll();
  }

  // PATCH /seller-applications/:id/approve
  // 판매자 신청 승인 (관리자용)
  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  async approve(@Param('id') id: string) {
    return this.sellerApplicationService.approve(id);
  }

  // PATCH /seller-applications/:id/reject
  // 판매자 신청 거부 (관리자용)
  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectSellerApplicationDto,
  ) {
    return this.sellerApplicationService.reject(id, dto);
  }
}
