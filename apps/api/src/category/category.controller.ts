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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // POST /categories
  // 카테고리 등록 (ADMIN)
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  // GET /categories
  // 전체 카테고리 트리 (공개)
  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  // GET /categories/:slug/products
  // 해당 카테고리 상품 목록 (공개)
  @Get(':slug/products')
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

  // PATCH /categories/:id
  // 카테고리 수정 (ADMIN)
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  // DELETE /categories/:id
  // 카테고리 삭제 (ADMIN)
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
