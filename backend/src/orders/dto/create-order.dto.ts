import { Type } from 'class-transformer';
import { IsArray, IsInt, IsPhoneNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class CreateOrderItemDto {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  restaurantId: string;

  @IsString()
  customerName: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsString()
  address: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
