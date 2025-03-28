import { Injectable } from '@nestjs/common';
import { CreateTokenTransactionDto } from './dto/create-token-transaction.dto';
import { UpdateTokenTransactionDto } from './dto/update-token-transaction.dto';

@Injectable()
export class TokenTransactionsService {
  create(createTokenTransactionDto: CreateTokenTransactionDto) {
    return 'This action adds a new tokenTransaction';
  }

  findAll() {
    return `This action returns all tokenTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tokenTransaction`;
  }

  update(id: number, updateTokenTransactionDto: UpdateTokenTransactionDto) {
    return `This action updates a #${id} tokenTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} tokenTransaction`;
  }
}
