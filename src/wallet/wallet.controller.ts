import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('nonce')
  @ApiOperation({ summary: 'Get a nonce for wallet verification' })
  @ApiResponse({ status: 200, description: 'Returns a nonce for signing' })
  async getNonce(@CurrentUser() user: User): Promise<{ nonce: string }> {
    const nonce = await this.walletService.generateNonce(user.id);
    return { nonce };
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet connected successfully' })
  async connectWallet(
    @CurrentUser() user: User,
    @Body() connectWalletDto: ConnectWalletDto,
  ) {
    return this.walletService.connectWallet(user.id, connectWalletDto);
  }

  @Delete(':address')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect a wallet' })
  @ApiResponse({ status: 204, description: 'Wallet disconnected successfully' })
  async disconnectWallet(
    @CurrentUser() user: User,
    @Param('address') address: string,
  ): Promise<void> {
    await this.walletService.disconnectWallet(user.id, address);
  }

  @Get(':address/balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns the wallet balance' })
  async getBalance(
    @CurrentUser() user: User,
    @Param('address') address: string,
  ): Promise<{ balance: string }> {
    const balance = await this.walletService.getBalance(user.id, address);
    return { balance };
  }

  @Get(':address/history')
  @ApiOperation({ summary: 'Get wallet activity history' })
  @ApiResponse({ status: 200, description: 'Returns the wallet activity history' })
  async getWalletHistory(
    @CurrentUser() user: User,
    @Param('address') address: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.walletService.getWalletHistory(
      user.id,
      address,
      +limit,
      +offset,
    );
  }
}
