import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  cuisine: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating = 0;

  @IsInt()
  @Min(0)
  priceForTwo: number;

  @IsInt()
  @Min(1)
  deliveryTimeMin: number;

  @IsOptional()
  @IsString()
  heroImageUrl?: string;
}
