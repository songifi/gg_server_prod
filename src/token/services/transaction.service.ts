import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenTransaction } from '../entities/token-transaction.entity';
import { CreateTokenTransactionDto } from '../dto/create-token-transaction.dto';
import { UpdateTokenTransactionDto } from '../dto/update-token-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TokenTransaction)
    private readonly tokenTransactionRepository: Repository<TokenTransaction>,
  ) {}

  async create(createTokenTransactionDto: CreateTokenTransactionDto) {
    const transaction = this.tokenTransactionRepository.create(createTokenTransactionDto);
    return this.tokenTransactionRepository.save(transaction);
  }

  async findAll() {
    return this.tokenTransactionRepository.find({
      relations: ['sender', 'receiver'],
    });
  }

  async findOne(id: string) {
    const transaction = await this.tokenTransactionRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }

    return transaction;
  }

  async findBySender(senderId: string) {
    return this.tokenTransactionRepository.find({
      where: { sender: { id: senderId } },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByReceiver(receiverId: string) {
    return this.tokenTransactionRepository.find({
      where: { receiver: { id: receiverId } },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTokenTransactionDto: UpdateTokenTransactionDto) {
    const transaction = await this.findOne(id);
    Object.assign(transaction, updateTokenTransactionDto);
    return this.tokenTransactionRepository.save(transaction);
  }

  async remove(id: string) {
    const transaction = await this.findOne(id);
    return this.tokenTransactionRepository.remove(transaction);
  }
}
