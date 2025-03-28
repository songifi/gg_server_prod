import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { UsersModule } from 'src/users/users.module';
import { UserRepository } from 'src/users/repositories/user.repository';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService, UserRepository],
  exports: [NotificationsService],
})
export class NotificationModule {}
