import { IsNotEmpty, IsEmail } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}
