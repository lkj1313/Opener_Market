import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  content: string;
}
