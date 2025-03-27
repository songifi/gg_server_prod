import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcProvider, Contract, hash, uint256 } from 'starknet';
import { ConfigService } from '@nestjs/config';
import { Wallet } from './entities/wallet.entity';
import { WalletActivity } from './entities/wallet-activity.entity';
import { WalletActivityType } from './entities/wallet-activity.entity';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { v4 as uuidv4 } from 'uuid';

// ERC20 ABI for the ETH token contract
const ERC20_ABI = [
  {
    members: [
      {
        name: "low",
        offset: 0,
        type: "felt"
      },
      {
        name: "high",
        offset: 1,
        type: "felt"
      }
    ],
    name: "Uint256",
    size: 2,
    type: "struct"
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

@Injectable()
export class WalletService {
  private readonly provider: RpcProvider;
  private readonly nonces: Map<string, { value: string; expires: Date }> = new Map();
  private readonly ETH_CONTRACT = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletActivity)
    private readonly activityRepository: Repository<WalletActivity>,
    private readonly configService: ConfigService,
  ) {
    // Initialize Starknet provider
    const nodeUrl = this.configService.get('STARKNET_PROVIDER_URL');
    this.provider = new RpcProvider({ nodeUrl });
  }

  async generateNonce(userId: string): Promise<string> {
    const nonce = uuidv4();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5); // 5 minutes expiration

    this.nonces.set(userId, { value: nonce, expires });
    return nonce;
  }

  private async verifySignature(address: string, signature: string, userId: string): Promise<boolean> {
    const nonceData = this.nonces.get(userId);
    if (!nonceData || nonceData.expires < new Date()) {
      throw new UnauthorizedException('Nonce expired or invalid');
    }

    const message = `Verify wallet for gg_server_prod: ${nonceData.value}`;
    
    try {
      // Calculate message hash using starknet.js
      const messageHash = hash.starknetKeccak(message).toString();

      // Parse signature
      const [r, s] = signature.split(',').map(part => part.trim());
      if (!r || !s) {
        throw new Error('Invalid signature format');
      }

      // Create contract instance for the wallet
      const contract = new Contract(
        ERC20_ABI,
        address,
        this.provider
      );

      // Verify signature using the contract
      const isValid = await contract.call('is_valid_signature', [
        messageHash,
        [r, s]
      ]);
      
      // Clean up the used nonce
      this.nonces.delete(userId);
      
      return isValid.toString() === '1';
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  async connectWallet(userId: string, connectWalletDto: ConnectWalletDto): Promise<Wallet> {
    const { address, signature } = connectWalletDto;

    // Check if wallet is already connected
    const existingWallet = await this.walletRepository.findOne({ where: { address } });
    if (existingWallet) {
      throw new ConflictException('Wallet already connected to a user');
    }

    // Verify signature
    const isValid = await this.verifySignature(address, signature, userId);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Create new wallet
    const wallet = this.walletRepository.create({
      address,
      userId,
      isVerified: true,
    });

    const savedWallet = await this.walletRepository.save(wallet);

    // Log activity
    await this.logActivity(savedWallet.id, WalletActivityType.CONNECT, {
      address,
      timestamp: new Date(),
    });

    return savedWallet;
  }

  async disconnectWallet(userId: string, address: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { address, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Log activity before deletion
    await this.logActivity(wallet.id, WalletActivityType.DISCONNECT, {
      address,
      timestamp: new Date(),
    });

    await this.walletRepository.remove(wallet);
  }

  async getBalance(userId: string, address: string): Promise<string> {
    const wallet = await this.walletRepository.findOne({
      where: { address, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    try {
      // Create contract instance for ETH token
      const ethContract = new Contract(
        ERC20_ABI,
        this.ETH_CONTRACT,
        this.provider
      );

      // Get balance using the contract's balanceOf method
      const result = await ethContract.call('balanceOf', [address]);
      const balanceAsString = uint256.uint256ToBN({
        low: result[0],
        high: result[1]
      }).toString();

      await this.logActivity(wallet.id, WalletActivityType.BALANCE_CHECK, {
        address,
        balance: balanceAsString,
        timestamp: new Date(),
      });

      return balanceAsString;
    } catch (error) {
      throw new Error('Failed to fetch wallet balance');
    }
  }

  async getWalletHistory(userId: string, address: string, limit = 10, offset = 0): Promise<WalletActivity[]> {
    const wallet = await this.walletRepository.findOne({
      where: { address, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.activityRepository.find({
      where: { walletId: wallet.id },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  private async logActivity(walletId: string, type: WalletActivityType, details: Record<string, any>): Promise<void> {
    const activity = this.activityRepository.create({
      walletId,
      type,
      details,
    });

    await this.activityRepository.save(activity);
  }
}
