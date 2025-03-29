/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { DeviceToken, DevicePlatform } from './entities/device-token.entity';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as admin from 'firebase-admin';
import * as apn from 'apn';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  private fcmApp: admin.app.App | null = null;
  private apnProvider: apn.Provider | null = null;
  private isDevelopment: boolean;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    private readonly configService: ConfigService,
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
  ) {
    this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';

    // Only try to initialize Firebase in production
    if (!this.isDevelopment && !admin.apps.length) {
      try {
        const serviceAccountPath = path.join(process.cwd(), 'config', 'credentials', 'firebase-service-account.json');
        this.fcmApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
      } catch (error) {
        console.warn('Firebase initialization skipped in development mode');
      }
    } else if (admin.apps.length) {
      this.fcmApp = admin.apps[0];
    }

    // Only try to initialize APN in production
    if (!this.isDevelopment) {
      try {
        const apnKeyPath = path.join(process.cwd(), 'config', 'credentials', 'apns-key.p8');
        this.apnProvider = new apn.Provider({
          token: {
            key: apnKeyPath,
            keyId: this.configService.get('APNS_KEY_ID'),
            teamId: this.configService.get('APNS_TEAM_ID'),
          },
          production: true // Use development: false for sandbox
        });
      } catch (error) {
        console.warn('APN initialization skipped due to missing credentials');
      }
    }
  }

  async registerDeviceToken(
    userId: string,
    dto: RegisterDeviceTokenDto,
  ): Promise<DeviceToken> {
    // Deactivate existing tokens for this device
    await this.deviceTokenRepository.update(
      { token: dto.token },
      { isActive: false },
    );

    // Create new device token
    const deviceToken = this.deviceTokenRepository.create({
      userId,
      ...dto,
      isActive: true,
    });

    return this.deviceTokenRepository.save(deviceToken);
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({
      where: { id: createNotificationDto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({
        ...createNotificationDto,
        user,
      }),
    );

    // Queue push notifications
    await this.notificationsQueue.add('sendPushNotification', {
      notificationId: notification.id,
      userId: user.id,
      title: notification.type,
      body: notification.content,
    });

    return notification;
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { userId, isActive: true },
    });

    for (const device of deviceTokens) {
      try {
        if (device.platform === DevicePlatform.IOS) {
          await this.sendApnsNotification(device.token, title, body, data);
        } else if (
          device.platform === DevicePlatform.ANDROID ||
          device.platform === DevicePlatform.WEB
        ) {
          await this.sendFcmNotification(device.token, title, body, data);
        }
      } catch (error) {
        if (this.isInvalidTokenError(error)) {
          await this.deviceTokenRepository.update(device.id, {
            isActive: false,
          });
        }
        // Log error but continue with other devices
        console.error(
          `Failed to send notification to device ${device.id}:`,
          error,
        );
      }
    }
  }

  private async sendFcmNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.fcmApp) {
      console.log('Development Mode: FCM notification would have been sent:', {
        token,
        title,
        body,
        data,
      });
      return;
    }

    await this.fcmApp.messaging().send({
      token,
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
      },
    });
  }

  private async sendApnsNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.apnProvider) {
      console.log('APN notification would have been sent:', {
        token,
        title,
        body,
        data,
      });
      return;
    }

    const notification = new apn.Notification({
      alert: {
        title,
        body,
      },
      payload: data,
      topic: this.configService.get('APNS_BUNDLE_ID'),
    });

    await this.apnProvider.send(notification, token);
  }

  private isInvalidTokenError(error: any): boolean {
    return (
      error?.code === 'messaging/invalid-registration-token' || // FCM
      error?.status === '410' || // APNS
      error?.status === '400' // APNS
    );
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
    const notification = await this.findOne(id);
    return this.notificationRepository.save({
      ...notification,
      ...updateNotificationDto,
    });
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async delete(id: string): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}
