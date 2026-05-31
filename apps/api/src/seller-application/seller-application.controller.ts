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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SellerApplicationService } from './seller-application.service';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto';
import { RejectSellerApplicationDto } from './dto/reject-seller-application.dto';
import { SellerApplicationResponseDto } from './dto/seller-application-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Seller Application')
@Controller('seller-applications')
export class SellerApplicationController {
  constructor(
    private readonly sellerApplicationService: SellerApplicationService,
  ) {}

  @Post()
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: '판매자 신청 제출 (BUYER)' })
  @ApiBody({ type: CreateSellerApplicationDto })
  @ApiResponse({ status: 201, description: '신청 성공', type: SellerApplicationResponseDto })
  async create(
    @Body() dto: CreateSellerApplicationDto,
    @GetUser('userId') userId: string,
  ) {
    return this.sellerApplicationService.create(dto, userId);
  }

  @Get('me')
  @Roles(Role.BUYER, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 판매자 신청 내역 조회' })
  @ApiResponse({ status: 200, description: '내 신청 내역', type: SellerApplicationResponseDto })
  async findMyApplication(@GetUser('userId') userId: string) {
    return this.sellerApplicationService.findMyApplication(userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '전체 판매자 신청 목록 (ADMIN)' })
  @ApiResponse({ status: 200, description: '신청 목록', type: [SellerApplicationResponseDto] })
  async findAll() {
    return this.sellerApplicationService.findAll();
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '판매자 신청 승인 (ADMIN)' })
  @ApiResponse({ status: 200, description: '승인된 신청', type: SellerApplicationResponseDto })
  @ApiParam({ name: 'id', description: '신청 ID' })
  async approve(@Param('id') id: string) {
    return this.sellerApplicationService.approve(id);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '판매자 신청 거부 (ADMIN)' })
  @ApiResponse({ status: 200, description: '거부된 신청', type: SellerApplicationResponseDto })
  @ApiParam({ name: 'id', description: '신청 ID' })
  @ApiBody({ type: RejectSellerApplicationDto })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectSellerApplicationDto,
  ) {
    return this.sellerApplicationService.reject(id, dto);
  }
}
