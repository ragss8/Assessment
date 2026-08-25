import { IsIn } from 'class-validator';

export class UpdatePartnerStatusDto {
  @IsIn(['AVAILABLE', 'OFFLINE'])
  status: 'AVAILABLE' | 'OFFLINE';
}
