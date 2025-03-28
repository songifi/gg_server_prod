import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './services/token.service';
import { TransactionService } from './services/transaction.service';
import { TokenBalanceService } from './services/token-balance.service';
import { TokenController } from './controllers/token.controller';
import { TransactionController } from './controllers/transaction.controller';
import { TokenBalanceController } from './controllers/token-balance.controller';
import { TokenTransaction } from './entities/token-transaction.entity';
import { TokenBalance } from './entities/token-balance.entity';
import { User } from '../users/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { Wallet } from '../wallet/entities/wallet.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenTransaction, TokenBalance, User, Wallet]),
    WalletModule,
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [TokenController, TransactionController, TokenBalanceController],
  providers: [TokenService, TransactionService, TokenBalanceService],
  exports: [TokenService, TransactionService, TokenBalanceService],
})
export class TokenModule {}
