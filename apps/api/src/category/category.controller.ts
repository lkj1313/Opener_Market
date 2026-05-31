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
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryTreeResponseDto } from './dto/category-tree-response.dto';
import { CategoryProductListResponseDto } from './dto/category-product-list-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 등록 (ADMIN)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: '등록 성공', type: CategoryResponseDto })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '전체 카테고리 트리 (공개)' })
  @ApiResponse({ status: 200, description: '카테고리 목록 반환', type: [CategoryTreeResponseDto] })
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':slug/products')
  @ApiOperation({ summary: '카테고리별 상품 목록 (공개)' })
  @ApiResponse({ status: 200, description: '상품 목록', type: CategoryProductListResponseDto })
  @ApiParam({ name: 'slug', description: '카테고리 슬러그' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findProductsBySlug(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.categoryService.findProductsBySlug(slug, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 수정 (ADMIN)' })
  @ApiResponse({ status: 200, description: '수정된 카테고리', type: CategoryResponseDto })
  @ApiParam({ name: 'id', description: '카테고리 ID' })
  @ApiBody({ type: UpdateCategoryDto })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 삭제 (ADMIN)' })
  @ApiResponse({ status: 200, description: '삭제된 카테고리', type: CategoryResponseDto })
  @ApiParam({ name: 'id', description: '카테고리 ID' })
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
