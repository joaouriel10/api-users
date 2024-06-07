import { hash } from 'bcrypt';
import { User } from '@prisma/client';
import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '../../AppException';
import { QueryListDto } from './dtos/user-params.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | false> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) return false;

    return user;
  }

  async create({ name, email, password }: CreateUserDto) {
    const userWithSameEmail = await this.findByEmail(email);

    if (userWithSameEmail) {
      throw new AppException('E-mail already exists.');
    }

    const password_hash = await hash(password, 8);

    await this.prismaService.user.create({
      data: {
        name,
        email,
        password: password_hash,
      },
    });
  }

  async findAll({ email, name, limit, page }: QueryListDto) {
    const count = await this.prismaService.user.count({
      where: {
        name: {
          contains: name,
        },
        email: {
          contains: email,
        },
      },
    });

    const max_page = Math.ceil(count / limit);

    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
      },
      where: {
        name: {
          contains: name,
        },
        email: {
          contains: email,
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: users,
      limit: limit,
      total: count,
      totalPage: max_page,
      page,
    };
  }

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new AppException('User does not exist.', HttpStatus.NOT_FOUND);
    }

    delete user.password;

    return { user };
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findById(id);

    if (data?.password) {
      const password_hash = await hash(data.password, 8);
      data.password = password_hash;
    }

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
