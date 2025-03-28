import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TokenTransactionsService } from './token-transactions.service';
import { CreateTokenTransactionDto } from './dto/create-token-transaction.dto';
import { UpdateTokenTransactionDto } from './dto/update-token-transaction.dto';

@Controller('token-transactions')
export class TokenTransactionsController {
  constructor(
    private readonly tokenTransactionsService: TokenTransactionsService,
  ) {}

  @Post()
  create(@Body() createTokenTransactionDto: CreateTokenTransactionDto) {
    return this.tokenTransactionsService.create(createTokenTransactionDto);
  }

  @Get()
  findAll() {
    return this.tokenTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tokenTransactionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTokenTransactionDto: UpdateTokenTransactionDto,
  ) {
    return this.tokenTransactionsService.update(+id, updateTokenTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tokenTransactionsService.remove(+id);
  }
}
