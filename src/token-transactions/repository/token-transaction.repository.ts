import { EntityRepository, Repository } from 'typeorm';
import { TokenTransaction } from '../entities/token-transaction.entity';

@EntityRepository(TokenTransaction)
export class TokenTransactionRepository extends Repository<TokenTransaction> {}
