import { EntityRepository, Repository } from 'typeorm';
import { ReadReceipt } from '../entities/read-receipt.entity';

@EntityRepository(ReadReceipt)
export class ReadReceiptRepository extends Repository<ReadReceipt> {}
