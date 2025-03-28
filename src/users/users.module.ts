import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { TokenTransaction } from '../token/entities/token-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet, TokenTransaction])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
