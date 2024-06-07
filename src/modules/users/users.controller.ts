import {
  Controller,
  Post,
  Body,
  HttpCode,
  Query,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { ParamDto, QueryListDto } from './dtos/user-params.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateUserDto) {
    return await this.usersService.create(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async findAll(
    @Query() { name = '', email = '', page = 1, limit = 10 }: QueryListDto,
  ) {
    return await this.usersService.findAll({
      name,
      email,
      limit: Number(limit),
      page: Number(page),
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async findOne(@Param() data: ParamDto) {
    return await this.usersService.findById(String(data.id));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async update(@Param() data: ParamDto, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(String(data.id), updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async remove(@Param() data: ParamDto) {
    return await this.usersService.remove(String(data.id));
  }
}
