import {
  Controller,
  Get,
  Post,
  Delete,
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
import { ShopDiscountService } from './shop-discount.service';
import { CreateShopDiscountDto } from './dto/create-shop-discount.dto';
import { ShopDiscountResponseDto } from './dto/shop-discount-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Shop Discount')
@Controller('shop-discounts')
export class ShopDiscountController {
  constructor(private readonly shopDiscountService: ShopDiscountService) {}

  @Post()
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: '상점 할인 등록 (SELLER)' })
  @ApiBody({ type: CreateShopDiscountDto })
  @ApiResponse({ status: 201, description: '등록 성공', type: ShopDiscountResponseDto })
  async create(
    @Body() dto: CreateShopDiscountDto,
    @GetUser('userId') userId: string,
  ) {
    return this.shopDiscountService.create(dto, userId);
  }

  @Get('my')
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 상점 할인 목록 (SELLER)' })
  @ApiResponse({ status: 200, description: '할인 목록', type: [ShopDiscountResponseDto] })
  async findMyShopDiscounts(@GetUser('userId') userId: string) {
    return this.shopDiscountService.findMyShopDiscounts(userId);
  }

  @Delete(':id')
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '상점 할인 삭제 (SELLER)' })
  @ApiResponse({ status: 200, description: '삭제된 할인', type: ShopDiscountResponseDto })
  @ApiParam({ name: 'id', description: '할인 ID' })
  async remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.shopDiscountService.remove(id, userId);
  }
}
