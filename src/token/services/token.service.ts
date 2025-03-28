import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcProvider, Contract, TransactionStatus, Abi } from 'starknet';
import { ConfigService } from '@nestjs/config';
import { TokenTransaction } from '../entities/token-transaction.entity';
import { User } from '../../users/entities/user.entity';
import { TransferTokenDto } from '../dto/transfer-token.dto';
import { TokenType } from '../enum/token-type.enum';
import { WalletService } from '../../wallet/wallet.service';
import { Wallet } from '../../wallet/entities/wallet.entity';

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
      const transaction = await this.tokenTransactionRepository.save({
        sender: Promise.resolve(sender),
        receiver: Promise.resolve(receiver),
        tokenType: dto.tokenType,
        tokenId: dto.tokenId,
        amount: dto.amount,
        status: TransactionStatus.RECEIVED,
      });

      // Execute transfer based on token type
      let txHash: string;
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
      await this.tokenTransactionRepository.save(transaction);

      return {
        txHash,
        status: TransactionStatus.RECEIVED,
      };
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
