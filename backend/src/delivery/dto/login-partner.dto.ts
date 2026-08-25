import { IsEmail, IsString } from 'class-validator';

export class LoginPartnerDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
