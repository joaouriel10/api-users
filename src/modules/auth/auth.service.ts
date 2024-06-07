import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { UsersService } from '../users/users.service';
import { AppException } from '../../AppException';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    try {
      const findUser = await this.usersService.findByEmail(email);

      if (!findUser) {
        throw new AppException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
      }

      const doesPasswordMatches = await compare(password, findUser.password);

      if (!doesPasswordMatches) {
        throw new AppException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
      }

      delete findUser.password;

      const payload = {
        sub: findUser,
      };

      const token = await this.jwtService.signAsync(payload);

      return { token };
    } catch (error) {
      throw new AppException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
    }
  }

  async me(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = payload.sub;

      return { user };
    } catch (error) {
      throw new AppException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
    }
  }
}
