import { ApiProperty } from '@nestjs/swagger';
import { SignupResponseDto } from './signup-response.dto';

export class LoginResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '사용자 정보', type: SignupResponseDto })
  user: SignupResponseDto;
}
