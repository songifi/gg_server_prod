import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TokenBalanceService } from '../services/token-balance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('token-balances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('token-balances')
export class TokenBalanceController {
  constructor(private readonly tokenBalanceService: TokenBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get token balance for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the token balance',
  })
  @ApiResponse({
    status: 404,
    description: 'User or wallet not found',
  })
  async getBalance(
    @CurrentUser('id') userId: string,
    @Query('tokenAddress') tokenAddress: string,
  ) {
    return this.tokenBalanceService.getBalance(userId, tokenAddress);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get token balance for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the token balance',
  })
  @ApiResponse({
    status: 404,
    description: 'User or wallet not found',
  })
  async getUserBalance(
    @Param('userId') userId: string,
    @Query('tokenAddress') tokenAddress: string,
  ) {
    return this.tokenBalanceService.getBalance(userId, tokenAddress);
  }
}
