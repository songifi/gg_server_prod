import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { TokenTransaction } from 'src/token-transactions/entities/token-transaction.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, TokenTransaction, Notification])],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
