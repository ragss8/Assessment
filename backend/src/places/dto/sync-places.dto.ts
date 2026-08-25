import { IsArray, IsOptional, IsString } from 'class-validator';

export class SyncPlacesDto {
  @IsArray()
  @IsString({ each: true })
  queries: string[];

  @IsOptional()
  @IsString()
  city?: string;
}
