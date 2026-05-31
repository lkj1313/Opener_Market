import { ApiProperty } from '@nestjs/swagger';

export class ReviewUserDto {
  @ApiProperty({ description: '닉네임' })
  nickname: string;
}
