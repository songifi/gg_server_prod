import { Module } from '@nestjs/common';
import { TokenTransactionsService } from './token-transactions.service';
import { TokenTransactionsController } from './token-transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenTransaction } from './entities/token-transaction.entity';
import { TokenTransactionRepository } from './repository/token-transaction.repository';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TokenTransaction, User])],
  controllers: [TokenTransactionsController],
  providers: [TokenTransactionsService, TokenTransactionRepository],
  exports: [TokenTransactionsService],
})
export class TokenTransactionsModule {}
