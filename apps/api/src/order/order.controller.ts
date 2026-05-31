import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateSubOrderStatusDto } from './dto/update-sub-order-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderListResponseDto } from './dto/order-list-response.dto';
import { SubOrderResponseDto } from './dto/sub-order-response.dto';
import { SubOrderSellerResponseDto } from './dto/sub-order-seller-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '주문 생성 (BUYER)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: '주문 생성 성공', type: OrderResponseDto })
  async create(
    @Body() dto: CreateOrderDto,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.create(dto, userId);
  }

  @Get()
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 주문 목록 (BUYER)' })
  @ApiResponse({ status: 200, description: '주문 목록', type: OrderListResponseDto })
  async findMyOrders(@GetUser('userId') userId: string) {
    return this.orderService.findMyOrders(userId);
  }

  @Get(':id')
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '주문 상세 (BUYER)' })
  @ApiResponse({ status: 200, description: '주문 상세', type: OrderResponseDto })
  @ApiParam({ name: 'id', description: '주문 ID' })
  async findOne(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.findOne(id, userId);
  }

  @Delete(':id')
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '주문 취소 (BUYER)' })
  @ApiResponse({ status: 200, description: '취소된 주문', type: OrderResponseDto })
  @ApiParam({ name: 'id', description: '주문 ID' })
  async cancel(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.cancel(id, userId);
  }

  @Post(':id/pay')
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '주문 결제 (BUYER)' })
  @ApiResponse({ status: 200, description: '결제된 주문', type: OrderResponseDto })
  @ApiParam({ name: 'id', description: '주문 ID' })
  async pay(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.pay(id, userId);
  }

  @Get('seller/sub-orders')
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '판매자용 SubOrder 목록 (SELLER)' })
  @ApiResponse({ status: 200, description: 'SubOrder 목록', type: [SubOrderSellerResponseDto] })
  async findSellerSubOrders(@GetUser('userId') userId: string) {
    return this.orderService.findSellerSubOrders(userId);
  }

  @Patch('sub-orders/:id/status')
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SubOrder 상태 변경 (SELLER)' })
  @ApiResponse({ status: 200, description: '변경된 SubOrder', type: SubOrderResponseDto })
  @ApiParam({ name: 'id', description: 'SubOrder ID' })
  @ApiBody({ type: UpdateSubOrderStatusDto })
  async updateSubOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSubOrderStatusDto,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.updateSubOrderStatus(id, dto, userId);
  }

  @Post('sub-orders/:id/confirm')
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '구매 확정 (BUYER)' })
  @ApiResponse({ status: 200, description: '확정된 SubOrder', type: SubOrderResponseDto })
  @ApiParam({ name: 'id', description: 'SubOrder ID' })
  async confirm(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.orderService.confirm(id, userId);
  }
}
