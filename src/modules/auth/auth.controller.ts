import {
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  Body,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  @Post('authorize')
  @HttpCode(HttpStatus.OK)
  async execute(@Body() { email, password }: AuthDto) {
    const data = await this.authServices.signIn(email, password);
    return data;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user = req.user;
    return { user };
  }
}
