import { PartialType } from '@nestjs/swagger';
import { CreateReadReceiptDto } from './create-read-receipt.dto';

export class UpdateReadReceiptDto extends PartialType(CreateReadReceiptDto) {}
