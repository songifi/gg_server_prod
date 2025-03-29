import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenTransaction } from './entities/token-transaction.entity';
import { TokenService } from './services/token.service';
import { TokenController } from './controllers/token.controller';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { WalletModule } from '../wallet/wallet.module';
import { WebhookModule } from '../webhook/webhook.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenTransaction]),
    WalletModule,
    WebhookModule,
    UsersModule,
    ConfigModule,
  ],
  providers: [TokenService, TransactionService],
  controllers: [TokenController, TransactionController],
  exports: [TokenService, TransactionService],
})
export class TokenModule {}
