import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TokenTransaction } from '../entities/token-transaction.entity';
import { CreateTokenTransactionDto } from '../dto/create-token-transaction.dto';
import { UpdateTokenTransactionDto } from '../dto/update-token-transaction.dto';
import { ListTransactionsDto } from '../dto/list-transactions.dto';
import { TransactionStatus } from '../enum/transaction-status.enum'; // Assuming TransactionStatus is defined in transaction-status.enum

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TokenTransaction)
    private readonly tokenTransactionRepository: Repository<TokenTransaction>,
  ) {}

  async create(createTokenTransactionDto: CreateTokenTransactionDto) {
    const transaction = this.tokenTransactionRepository.create({
      ...createTokenTransactionDto,
      amount: createTokenTransactionDto.amount?.toString(),
      gasFee: '0', // Default gas fee
      status: TransactionStatus.PENDING,
    });
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

  async findUserTransactions(
    userId: string,
    filters: ListTransactionsDto,
  ) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = [
      { sender: { id: userId } },
      { receiver: { id: userId } },
    ];

    if (filters.tokenType) {
      where.forEach(clause => {
        clause.tokenType = filters.tokenType;
      });
    }

    if (filters.status) {
      where.forEach(clause => {
        clause.status = filters.status;
      });
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateRange = {};
      if (filters.dateFrom) {
        dateRange['$gte'] = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        dateRange['$lte'] = new Date(filters.dateTo);
      }
      where.forEach(clause => {
        clause.createdAt = Between(
          filters.dateFrom ? new Date(filters.dateFrom) : new Date(0),
          filters.dateTo ? new Date(filters.dateTo) : new Date(),
        );
      });
    }

    const [transactions, total] = await this.tokenTransactionRepository.findAndCount({
      where,
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
