import { Module } from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationPreferenceController } from './notification-preference.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreference])],
  controllers: [NotificationPreferenceController],
  providers: [NotificationPreferenceService],
  exports: [NotificationPreferenceService],
})
export class NotificationPreferenceModule {}
