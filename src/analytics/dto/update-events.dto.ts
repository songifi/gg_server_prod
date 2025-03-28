import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-events.dto';

export class UpdateAnalyticsDto extends PartialType(CreateEventDto) {}
