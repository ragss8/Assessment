import { TableFeature } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TABLE_FEATURES } from '../../common/table-features';

export class FindAvailabilityDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  partySize = 2;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsEnum(TABLE_FEATURES, { each: true })
  preferredViews?: TableFeature[];

  @IsOptional()
  @IsDateString()
  bookingTime?: string;
}
