import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { RpcProvider, Contract, Abi } from 'starknet';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBalance } from '../entities/token-balance.entity';
import { User } from '../../users/entities/user.entity';
import { TokenType } from '../enum/token-type.enum';
import { WalletService } from '../../wallet/wallet.service';

@Injectable()
export class TokenBalanceService {
  private readonly logger = new Logger(TokenBalanceService.name);
  private readonly provider: RpcProvider;

  constructor(
    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.provider = new RpcProvider({
      nodeUrl: this.configService.get<string>('STARKNET_RPC_URL'),
    });
  }

  private getCacheKey(userId: string, tokenAddress: string): string {
    return `token-balance:${userId}:${tokenAddress}`;
  }

  async getBalance(userId: string, tokenAddress: string): Promise<TokenBalance> {
    const cacheKey = this.getCacheKey(userId, tokenAddress);
    
    // Try to get from cache first
    const cachedBalance = await this.cacheManager.get<TokenBalance>(cacheKey);
    if (cachedBalance) {
      return cachedBalance;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallets'],
    });

    if (!user || !user.wallets || user.wallets.length === 0) {
      throw new NotFoundException('User or wallet not found');
    }

    const primaryWallet = user.wallets[0]; // Use the first wallet as primary

    let balance = await this.tokenBalanceRepository.findOne({
      where: {
        user: { id: userId },
        tokenAddress,
      },
    });

    if (!balance || this.shouldUpdateBalance(balance)) {
      balance = await this.updateBalance(user, primaryWallet.address, tokenAddress);
      // Cache the new balance
      await this.cacheManager.set(cacheKey, balance);
    }

    return balance;
  }

  private shouldUpdateBalance(balance: TokenBalance): boolean {
    // Update if last update was more than 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return balance.updatedAt < fiveMinutesAgo;
  }

  private async updateBalance(
    user: User,
    walletAddress: string,
    tokenAddress: string,
  ): Promise<TokenBalance> {
    try {
      const contractAbi = this.configService.get('TOKEN_CONTRACT_ABI');
      if (!contractAbi) {
        throw new Error('TOKEN_CONTRACT_ABI not configured');
      }

      const contract = new Contract(
        contractAbi as Abi,
        tokenAddress,
        this.provider,
      );

      const tokenType = await this.determineTokenType(contract);
      const rawBalance = await contract.balanceOf(walletAddress);
      const currentBlockNumber = await this.provider.getBlockNumber();

      const balance = await this.tokenBalanceRepository.save({
        user,
        tokenAddress,
        tokenType,
        balance: rawBalance.toString(),
        lastBlockNumber: currentBlockNumber,
      });

      // Update cache with new balance
      const cacheKey = this.getCacheKey(user.id, tokenAddress);
      await this.cacheManager.set(cacheKey, balance);

      return balance;
    } catch (error) {
      this.logger.error(
        `Failed to update balance for user ${user.id} and token ${tokenAddress}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch current token balance',
      );
    }
  }

  private async determineTokenType(contract: Contract): Promise<TokenType> {
    try {
      // Try to call supportsInterface for ERC721
      const isNFT = await contract.supportsInterface('0x80ac58cd');
      return isNFT ? TokenType.NFT : TokenType.FUNGIBLE;
    } catch {
      // If supportsInterface fails, assume it's a fungible token
      return TokenType.FUNGIBLE;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateAllBalances(): Promise<void> {
    this.logger.log('Starting scheduled balance update for all users');

    const users = await this.userRepository.find({
      relations: ['wallets'],
      where: {
        wallets: {
          address: Not(IsNull()),
        },
      },
    });

    const tokenAddresses = [
      this.configService.get<string>('TOKEN_CONTRACT_ADDRESS'),
      this.configService.get<string>('NFT_CONTRACT_ADDRESS'),
    ].filter(Boolean); // Remove undefined values

    for (const user of users) {
      if (!user.wallets || user.wallets.length === 0) continue;
      const primaryWallet = user.wallets[0];

      for (const tokenAddress of tokenAddresses) {
        try {
          await this.updateBalance(user, primaryWallet.address, tokenAddress);
          this.logger.debug(
            `Updated balance for user ${user.id} and token ${tokenAddress}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to update balance for user ${user.id} and token ${tokenAddress}`,
            error.stack,
          );
          // Continue with next token/user even if one fails
          continue;
        }
      }
    }

    this.logger.log('Completed scheduled balance update for all users');
  }

  async invalidateCache(userId: string, tokenAddress: string): Promise<void> {
    const cacheKey = this.getCacheKey(userId, tokenAddress);
    await this.cacheManager.del(cacheKey);
  }
}
