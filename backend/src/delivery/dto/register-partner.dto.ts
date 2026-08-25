import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterPartnerDto {
  @IsString()
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  vehicleType: string;
}
