import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TokenService } from '../services/token.service';
import { TransferTokenDto } from '../dto/transfer-token.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('tokens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer tokens to another user' })
  @ApiResponse({
    status: 201,
    description: 'Token transfer initiated successfully',
    schema: {
      properties: {
        txHash: {
          type: 'string',
          description: 'Transaction hash from the blockchain',
          example: '0x123...',
        },
        status: {
          type: 'string',
          description: 'Current status of the transaction',
          example: 'RECEIVED',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (e.g., missing required fields)',
  })
  @ApiResponse({
    status: 404,
    description: 'Sender or receiver not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Blockchain transaction failed',
  })
  async transferToken(
    @CurrentUser('id') userId: string,
    @Body() transferTokenDto: TransferTokenDto,
  ) {
    return this.tokenService.transferToken(userId, transferTokenDto);
  }
}
