import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { TokenTransaction } from '../token/entities/token-transaction.entity';
import { UserRepository } from './repositories/user.repository';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet, TokenTransaction, Notification]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
