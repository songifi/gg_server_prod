/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({
      where: { id: createNotificationDto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      user,
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: id as any },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    // First, check if the notification exists
    const existingNotification = await this.findOne(id);

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (updateNotificationDto.type !== undefined) {
      updateData.type = updateNotificationDto.type;
    }
    if (updateNotificationDto.content !== undefined) {
      updateData.content = updateNotificationDto.content;
    }
    if (updateNotificationDto.isRead !== undefined) {
      updateData.isRead = updateNotificationDto.isRead;
    }

    // If userId is provided, fetch the user
    if (updateNotificationDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateNotificationDto.userId },
      });
      if (!user) throw new NotFoundException('User not found');
      updateData.user = user;
    }

    // Perform the update
    await this.notificationRepository.update(id, updateData);

    // Return the updated notification
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}
