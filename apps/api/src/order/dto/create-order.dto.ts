import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: '서울시 강남구...', description: '배송 주소' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
