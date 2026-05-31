import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: '상품 등록 (SELLER)' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: '상품 등록 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async create(
    @Body() dto: CreateProductDto,
    @GetUser('userId') userId: string,
  ) {
    return this.productService.create(dto, userId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '상품 검색 및 목록 (공개)' })
  @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (BEST, RATING, PRICE_ASC, PRICE_DESC, NEWEST)' })
  @ApiQuery({ name: 'categoryId', required: false, description: '카테고리 ID' })
  @ApiQuery({ name: 'page', required: false, description: '페이지' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수' })
  @ApiResponse({ status: 200, description: '상품 목록 반환' })
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('sort') sort?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findAll({
      keyword,
      sort,
      categoryId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('my')
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 상품 목록 (SELLER)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findMyProducts(
    @GetUser('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findMyProducts(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '상품 상세 (공개)' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '상품 상세 반환' })
  @ApiResponse({ status: 404, description: '상품 없음' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '상품 수정 (SELLER)' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @GetUser('userId') userId: string,
  ) {
    return this.productService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '상품 삭제 (SELLER)' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  async remove(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.productService.remove(id, userId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '상품 상태 변경 (ADMIN)' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiBody({ type: UpdateProductStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.productService.updateStatusByAdmin(id, dto);
  }
}
