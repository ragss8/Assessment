import { IsUUID } from 'class-validator';

export class ClaimRestaurantDto {
  @IsUUID()
  ownerId: string;
}
