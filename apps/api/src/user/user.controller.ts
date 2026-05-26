import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, UserStatus } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users/me
  // 내 정보 조회
  @Get('me')
  async findMe(@GetUser('userId') userId: string) {
    return this.userService.findMe(userId);
  }

  // PATCH /users/me
  // 내 정보 수정
  @Patch('me')
  async updateProfile(
    @GetUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  // GET /users
  // 전체 사용자 목록 (관리자용)
  @Get()
  @Roles(Role.ADMIN)
  async findAll(
    @Query('role') role?: Role,
    @Query('status') status?: UserStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.findAll({
      role,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // PATCH /users/:id/status
  // 계정 정지/활성화 (관리자용)
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    return this.userService.updateStatus(id, status);
  }

  // PATCH /users/:id/role
  // 역할 변경 (관리자용)
  @Patch(':id/role')
  @Roles(Role.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: Role,
  ) {
    return this.userService.updateRole(id, role);
  }
}
