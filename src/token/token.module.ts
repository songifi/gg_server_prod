import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './services/token.service';
import { TransactionService } from './services/transaction.service';
import { TokenController } from './controllers/token.controller';
import { TransactionController } from './controllers/transaction.controller';
import { TokenTransaction } from './entities/token-transaction.entity';
import { User } from '../users/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { Wallet } from '../wallet/entities/wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenTransaction, User, Wallet]),
    WalletModule,
  ],
  controllers: [TokenController, TransactionController],
  providers: [TokenService, TransactionService],
  exports: [TokenService, TransactionService],
})
export class TokenModule {}
