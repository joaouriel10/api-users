import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}
