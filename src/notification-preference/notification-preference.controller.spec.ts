/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferenceController } from './notification-preference.controller';
import { NotificationPreferenceService } from './notification-preference.service';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotFoundException } from '@nestjs/common';

describe('NotificationPreferenceController', () => {
  let controller: NotificationPreferenceController;
  let service: NotificationPreferenceService;

  const mockNotificationPreferenceService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockCreateDto: CreateNotificationPreferenceDto = {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
  };

  const mockUpdateDto: UpdateNotificationPreferenceDto = {
    emailEnabled: false,
  };

  const mockUserId = '9b5cbfe2-6f83-4ec3-bfc1-0f0e6b2b2d90'; // Example user ID
  const mockNotificationPreference: NotificationPreference = {
    id: 'some-uuid',
    userId: mockUserId,
    ...mockCreateDto,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPreferenceController],
      providers: [
        {
          provide: NotificationPreferenceService,
          useValue: mockNotificationPreferenceService,
        },
      ],
    }).compile();

    controller = module.get<NotificationPreferenceController>(
      NotificationPreferenceController,
    );
    service = module.get<NotificationPreferenceService>(
      NotificationPreferenceService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the service to create notification preferences', async () => {
      mockNotificationPreferenceService.create.mockResolvedValue(
        mockNotificationPreference,
      );
      const result = await controller.create(mockCreateDto);
      expect(result).toEqual(mockNotificationPreference);
      expect(mockNotificationPreferenceService.create).toHaveBeenCalledWith(
        mockCreateDto,
      );
    });
  });

  describe('update', () => {
    it('should call the service to update notification preferences for an existing user', async () => {
      mockNotificationPreferenceService.update.mockResolvedValue({
        ...mockNotificationPreference,
        ...mockUpdateDto,
      });

      const result = await controller.update(mockUserId, mockUpdateDto);
      expect(result.emailEnabled).toBe(false);
      expect(mockNotificationPreferenceService.update).toHaveBeenCalledWith(
        mockUserId,
        mockUpdateDto,
      );
    });

    it('should throw NotFoundException if the user notification preferences are not found', async () => {
      mockNotificationPreferenceService.update.mockRejectedValue(
        new NotFoundException('Notification preferences not found'),
      );
      await expect(
        controller.update(mockUserId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
