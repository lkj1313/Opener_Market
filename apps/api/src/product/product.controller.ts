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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // POST /products
  // 상품 등록 (SELLER)
  @Post()
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateProductDto,
    @GetUser('userId') userId: string,
  ) {
    return this.productService.create(dto, userId);
  }

  // GET /products
  // 상품 검색 및 목록 (공개)
  @Get()
  @Public()
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

  // GET /products/my
  // 내 상품 목록 (SELLER)
  @Get('my')
  @Roles(Role.SELLER)
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

  // GET /products/:id
  // 상품 상세 (공개)
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  // PATCH /products/:id
  // 상품 수정 (SELLER)
  @Patch(':id')
  @Roles(Role.SELLER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @GetUser('userId') userId: string,
  ) {
    return this.productService.update(id, dto, userId);
  }

  // DELETE /products/:id
  // 상품 삭제 (소프트 딜리트, SELLER)
  @Delete(':id')
  @Roles(Role.SELLER)
  async remove(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.productService.remove(id, userId);
  }

  // PATCH /products/:id/status
  // 상품 상태 변경 (ADMIN)
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.productService.updateStatusByAdmin(id, dto);
  }
}
