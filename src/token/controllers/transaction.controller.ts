import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionService } from '../services/transaction.service';
import { CreateTokenTransactionDto } from '../dto/create-token-transaction.dto';
import { UpdateTokenTransactionDto } from '../dto/update-token-transaction.dto';
import { ListTransactionsDto } from '../dto/list-transactions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TokenType } from '../enum/token-type.enum';
import { TransactionStatus } from 'starknet';

@ApiTags('token-transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('token-transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new token transaction' })
  @ApiResponse({
    status: 201,
    description: 'Token transaction created successfully',
  })
  create(@Body() createTokenTransactionDto: CreateTokenTransactionDto) {
    return this.transactionService.create(createTokenTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all token transactions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of token transactions',
  })
  @ApiQuery({ name: 'tokenType', enum: TokenType, required: false })
  @ApiQuery({ name: 'status', enum: TransactionStatus, required: false })
  @ApiQuery({ name: 'dateFrom', type: String, required: false })
  @ApiQuery({ name: 'dateTo', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() filters: ListTransactionsDto,
  ) {
    return this.transactionService.findUserTransactions(userId, filters);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get transactions sent by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns sent transactions',
  })
  findSent(@CurrentUser('id') userId: string) {
    return this.transactionService.findBySender(userId);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get transactions received by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns received transactions',
  })
  findReceived(@CurrentUser('id') userId: string) {
    return this.transactionService.findByReceiver(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific token transaction' })
  @ApiResponse({
    status: 200,
    description: 'Returns the token transaction',
  })
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a token transaction' })
  @ApiResponse({
    status: 200,
    description: 'Token transaction updated successfully',
  })
  update(
    @Param('id') id: string,
    @Body() updateTokenTransactionDto: UpdateTokenTransactionDto,
  ) {
    return this.transactionService.update(id, updateTokenTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a token transaction' })
  @ApiResponse({
    status: 200,
    description: 'Token transaction deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
