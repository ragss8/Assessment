import { TableFeature } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { TABLE_FEATURES } from '../../common/table-features';

export class CreateBookingDto {
  @IsUUID()
  restaurantId: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsString()
  customerName: string;

  @IsPhoneNumber('IN')
  customerPhone: string;

  @IsInt()
  @Min(1)
  @Max(30)
  partySize: number;

  @IsDateString()
  bookingTime: string;

  @IsOptional()
  @IsArray()
  @IsEnum(TABLE_FEATURES, { each: true })
  preferredViews?: TableFeature[];

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
