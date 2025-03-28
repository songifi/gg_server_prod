import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from 'starknet';

export class UpdateTokenTransactionDto {
  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  @ApiProperty({
    enum: TransactionStatus,
    description: 'Updated transaction status',
  })
  status: TransactionStatus;
}
