import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './lib/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { RabbitMQModule } from './lib/rabbit/rabbit-mq.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RabbitMQModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
