import { ClientProxy } from '@nestjs/microservices';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { RabbitMQService } from '../../lib//rabbit/rabbit-mq.service';
import { Request } from 'express';
import { AppException } from '../../AppException';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let clientProxy: ClientProxy;
  let rabbitMQService: RabbitMQService;
  let prismaService: PrismaService;
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(() => {
    rabbitMQService = new RabbitMQService(clientProxy);
    prismaService = new PrismaService();
    usersService = new UsersService(prismaService, rabbitMQService);
    usersController = new UsersController(usersService);
  });

  describe('findAll', () => {
    it('should be able to all users', async () => {
      const result = {
        data: [
          {
            id: '672eacf7-cf0e-4a1d-b063-fa7398cfa79e',
            email: 'joaouriel2015@gmail.com',
            name: 'João Uriel',
          },
          {
            id: 'f2c0897b-d767-4c69-98bd-dfed225553a6',
            email: 'joaouriel2016@outlook.com',
            name: 'João Uriel',
          },
          {
            id: '12c2c59b-34cb-416f-861f-e80cff0613e2',
            email: 'joaouriel2020@gmail.com',
            name: 'João Uriel',
          },
        ],
        limit: 10,
        total: 1,
        totalPage: 3,
        page: 1,
      };

      const requestMock: Request = {
        body: {},
        headers: {},
        user: {
          id: 'ea2d0f39-c98c-4a28-8c78-5f7bfc84f35d',
          email: 'joaouriel2015@gmail.com',
          name: 'João Uriel',
        },
      } as Request;

      jest
        .spyOn(usersService, 'findAll')
        .mockImplementation(async () => result);

      expect(
        await usersController.findAll(
          {
            name: '',
            email: '',
            page: 1,
            limit: 10,
            userId: 'ea2d0f39-c98c-4a28-8c78-5f7bfc84f35d',
          },
          requestMock,
        ),
      ).toBe(result);
    });
  });

  describe('findById', () => {
    it('should be able to return a user by id', async () => {
      const result = {
        user: {
          id: '29e8b4a8-e4a4-407f-88f7-f36a6f78cec2',
          name: 'Jhon Doe',
          email: 'jhonDoe@gmail.com',
          password: 'password-test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      jest
        .spyOn(usersService, 'findById')
        .mockImplementation(async () => result);

      expect(
        await usersController.findOne({
          id: '672eacf7-cf0e-4a1d-b063-fa7398cfa79e',
        }),
      ).toBe(result);
    });

    it('should not be able to return a user by non-existent id', async () => {
      jest.spyOn(usersService, 'findById').mockImplementation(async () => null);

      try {
        await usersController.findOne({
          id: 'id-non-existent',
        });
      } catch (error) {
        expect(error instanceof AppException).toBe(true);
        expect(error.message).toBe('User does not exist.');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('findById', () => {
    it('should be able to return a user by id', async () => {
      const result = {
        user: {
          id: '29e8b4a8-e4a4-407f-88f7-f36a6f78cec2',
          name: 'Jhon Doe',
          email: 'jhonDoe@gmail.com',
          password: 'password-test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      jest
        .spyOn(usersService, 'findById')
        .mockImplementation(async () => result);

      expect(
        await usersController.findOne({
          id: '672eacf7-cf0e-4a1d-b063-fa7398cfa79e',
        }),
      ).toBe(result);
    });

    it('should not be able to return a user by non-existent id', async () => {
      jest.spyOn(usersService, 'findById').mockImplementation(async () => null);

      try {
        await usersController.findOne({
          id: 'id-non-existent',
        });
      } catch (error) {
        expect(error instanceof AppException).toBe(true);
        expect(error.message).toBe('User does not exist.');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('crate', () => {
    it('should be able to create a user', async () => {
      jest.spyOn(usersService, 'create').mockImplementation(async () => null);

      expect(
        await usersController.create({
          name: 'Jhon Doe',
          email: 'jhonDoe@gmail.com',
          password: 'password-test',
        }),
      ).toBe(null);
    });
  });
});
