import * as bcrypt from 'bcrypt';
import { hash } from 'bcrypt';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { AppException } from '../../AppException'; // Corrigi o caminho importado do AppException
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from '@prisma/client';
import { QueryListDto } from './dtos/user-params.dto';
import { HttpStatus } from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should be able to create a user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password',
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
    await usersService.create(userData);

    userData.password = await hash(userData.password, 8);

    expect(prismaService.user.create).toHaveBeenCalled();
  });

  it('should not be able to create a user with email that already exists', async () => {
    const userData: CreateUserDto = {
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: 'uuid-test',
      name: userData.name,
      email: userData.email,
      password: await hash(userData.password, 8),
      created_at: new Date(),
      updated_at: new Date(),
    });

    await expect(usersService.create(userData)).rejects.toThrowError(
      AppException,
    );

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: userData.email },
    });

    expect(prismaService.user.create).not.toHaveBeenCalled();
  });

  it('should be able to return a user if email exists', async () => {
    const email = 'john@example.com';
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@test.com',
      password: 'hashedpassword',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

    const result = await usersService.findByEmail(email);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });
    expect(result).toEqual(user);
  });

  it('should be able ro return false if email does not exist', async () => {
    const email = 'nonexistent@test.com';

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    const result = await usersService.findByEmail(email);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });
    expect(result).toBe(false);
  });

  it('should be able to return paginated users', async () => {
    const query: QueryListDto = {
      name: 'John',
      email: 'john@example.com',
      limit: 10,
      page: 1,
    };

    const userCount = 15;
    const users: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Add more users if needed for testing
    ];

    jest.spyOn(prismaService.user, 'count').mockResolvedValue(userCount);
    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

    const result = await usersService.findAll(query);

    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        name: {
          contains: query.name,
        },
        email: {
          contains: query.email,
        },
      },
    });
    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
      },
      where: {
        name: {
          contains: query.name,
        },
        email: {
          contains: query.email,
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    expect(result).toEqual({
      data: users,
      limit: query.limit,
      total: userCount,
      totalPage: Math.ceil(userCount / query.limit),
      page: query.page,
    });
  });

  it('should be able to find a user by id', async () => {
    const userId = 'uuid-test';
    const user: User = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

    const result = await usersService.findById(userId);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });

    expect(result).toEqual({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  });

  it('should not be able find a user with non-existent id', async () => {
    const userId = 'uuid-test-non-existent';

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(usersService.findById(userId)).rejects.toThrowError(
      new AppException('User does not exist.', HttpStatus.NOT_FOUND),
    );

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it('should be able to update a user', async () => {
    const userId = '1';
    const updateData: UpdateUserDto = {
      email: 'updateEmail@example.com',
      name: 'Updated Name',
      password: 'newpassword',
    };

    const existingUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest
      .spyOn(usersService, 'findById')
      .mockResolvedValue({ user: existingUser });

    await usersService.update(userId, updateData);

    expect(usersService.findById).toHaveBeenCalledWith(userId);
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        ...updateData,
      },
    });
  });

  it('should be able to update a user with non-existent id', async () => {
    const userId = '1';
    const updateData: UpdateUserDto = {
      email: 'updateEmail@example.com',
      name: 'Updated Name',
      password: 'newpassword',
    };

    jest.spyOn(usersService, 'findById').mockImplementation(() => {
      throw new AppException('User does not exist.', HttpStatus.NOT_FOUND);
    });

    await expect(usersService.update(userId, updateData)).rejects.toThrowError(
      new AppException('User does not exist.', HttpStatus.NOT_FOUND),
    );

    expect(usersService.findById).toHaveBeenCalledWith(userId);
    expect(prismaService.user.update).not.toHaveBeenCalled();
  });

  it('should be able to delete a user', async () => {
    const userId = '1';
    const existingUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest
      .spyOn(usersService, 'findById')
      .mockResolvedValue({ user: existingUser });

    await usersService.remove(userId);

    expect(usersService.findById).toHaveBeenCalledWith(userId);
    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it('should not be able to delete a user with non-existent id', async () => {
    const userId = 'uuid-test-non-existent';

    jest.spyOn(usersService, 'findById').mockImplementation(() => {
      throw new AppException('User does not exist.', HttpStatus.NOT_FOUND);
    });

    await expect(usersService.remove(userId)).rejects.toThrowError(
      new AppException('User does not exist.', HttpStatus.NOT_FOUND),
    );

    expect(usersService.findById).toHaveBeenCalledWith(userId);
    expect(prismaService.user.delete).not.toHaveBeenCalled();
  });
});
