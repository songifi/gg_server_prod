import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenTransaction } from '../entities/token-transaction.entity';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { ConfigService } from '@nestjs/config';
import { WalletService } from '../../wallet/wallet.service';
import { TokenType } from '../enum/token-type.enum';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { TransactionErrorCode, RecoveryAction } from '../enum/transaction-error.enum';
import { RpcProvider, Contract, Abi } from 'starknet';
import { TransferTokenDto } from '../dto/transfer-token.dto';
import { WebhookService } from '../../webhook/webhook.service';
import { WebhookEvent } from '../../webhook/enum/webhook-event.enum';

@Injectable()
export class TokenService {
  private readonly provider: RpcProvider;

  constructor(
    @InjectRepository(TokenTransaction)
    private readonly tokenTransactionRepository: Repository<TokenTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly webhookService: WebhookService,
  ) {
    // Initialize Starknet provider
    this.provider = new RpcProvider({
      nodeUrl: this.configService.get<string>('STARKNET_RPC_URL'),
    });
  }

  async transferToken(senderId: string, dto: TransferTokenDto) {
    // Validate users exist
    const [sender, receiver] = await Promise.all([
      this.userRepository.findOne({ where: { id: senderId } }),
      this.userRepository.findOne({ where: { id: dto.receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    // Get user wallets
    const [senderWallet, receiverWallet] = await Promise.all([
      this.walletRepository.findOne({ where: { userId: senderId } }),
      this.walletRepository.findOne({ where: { userId: dto.receiverId } }),
    ]);

    if (!senderWallet || !receiverWallet) {
      throw new BadRequestException('Both users must have connected wallets');
    }

    // Validate token parameters
    if (dto.tokenType === TokenType.FUNGIBLE && !dto.amount) {
      throw new BadRequestException('Amount is required for fungible token transfers');
    }
    if (dto.tokenType === TokenType.NFT && !dto.tokenId) {
      throw new BadRequestException('Token ID is required for NFT transfers');
    }

    try {
      // Create transaction record
      const transaction = this.tokenTransactionRepository.create({
        senderId: sender.id,
        receiverId: receiver.id,
        tokenType: dto.tokenType,
        tokenId: dto.tokenId,
        amount: dto.amount?.toString(),
        status: TransactionStatus.PENDING,
        gasFee: '0',
      });

      await this.tokenTransactionRepository.save(transaction);
      await this.webhookService.dispatchEvent(WebhookEvent.TRANSACTION_CREATED, {
        transactionId: transaction.id,
        status: transaction.status,
      });

      // Execute transfer based on token type
      let txHash: string;
      try {
        if (dto.tokenType === TokenType.FUNGIBLE) {
          txHash = await this.transferFungibleToken(
            senderWallet.address,
            receiverWallet.address,
            dto.amount,
          );
        } else {
          txHash = await this.transferNFT(
            senderWallet.address,
            receiverWallet.address,
            dto.tokenId,
          );
        }

        // Update transaction with hash
        transaction.txHash = txHash;
        transaction.status = TransactionStatus.CONFIRMED;
        await this.tokenTransactionRepository.save(transaction);
        await this.webhookService.dispatchEvent(WebhookEvent.TRANSACTION_CONFIRMED, {
          transactionId: transaction.id,
          txHash,
          status: transaction.status,
        });

        return {
          txHash,
          status: TransactionStatus.CONFIRMED,
        };
      } catch (error) {
        transaction.status = TransactionStatus.FAILED;
        transaction.errorCode = TransactionErrorCode.CONTRACT_ERROR;
        transaction.errorMessage = error.message;
        transaction.recoveryOptions = [RecoveryAction.RETRY, RecoveryAction.INCREASE_FEE];
        await this.tokenTransactionRepository.save(transaction);
        await this.webhookService.dispatchEvent(WebhookEvent.TRANSACTION_FAILED, {
          transactionId: transaction.id,
          error: {
            code: transaction.errorCode,
            message: transaction.errorMessage,
          },
          status: transaction.status,
        });

        throw new InternalServerErrorException(
          'Failed to execute token transfer',
          error.message,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to transfer token: ${error.message}`,
      );
    }
  }

  private async transferFungibleToken(
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<string> {
    const tokenContract = new Contract(
      this.configService.get<Abi>('TOKEN_CONTRACT_ABI'),
      this.configService.get<string>('TOKEN_CONTRACT_ADDRESS'),
      this.provider,
    );

    const tx = await tokenContract.transfer(toAddress, amount);
    return tx.transaction_hash;
  }

  private async transferNFT(
    fromAddress: string,
    toAddress: string,
    tokenId: string,
  ): Promise<string> {
    const nftContract = new Contract(
      this.configService.get<Abi>('NFT_CONTRACT_ABI'),
      this.configService.get<string>('NFT_CONTRACT_ADDRESS'),
      this.provider,
    );

    const tx = await nftContract.transferFrom(fromAddress, toAddress, tokenId);
    return tx.transaction_hash;
  }
}
