/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationPreference } from './entities/notification-preference.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let repository: Repository<NotificationPreference>;

  const mockNotificationPreferenceRepository = {
    create: jest.fn().mockReturnThis(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserId = '9b5cbfe2-6f83-4ec3-bfc1-0f0e6b2b2d90'; // Example user ID
  const mockCreateDto = {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
  };
  const mockUpdateDto = { emailEnabled: false };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferenceService,
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: mockNotificationPreferenceRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationPreferenceService>(
      NotificationPreferenceService,
    );
    repository = module.get<Repository<NotificationPreference>>(
      getRepositoryToken(NotificationPreference),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new notification preference', async () => {
      mockNotificationPreferenceRepository.save.mockResolvedValue(
        mockCreateDto as any,
      );
      const result = await service.create(mockCreateDto);
      expect(result).toEqual(mockCreateDto);
      expect(mockNotificationPreferenceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(mockCreateDto),
      );
    });
  });

  describe('update', () => {
    it('should update the notification preferences for an existing user', async () => {
      mockNotificationPreferenceRepository.findOne.mockResolvedValue({
        ...mockCreateDto,
        userId: mockUserId,
      } as any);
      mockNotificationPreferenceRepository.save.mockResolvedValue({
        ...mockCreateDto,
        ...mockUpdateDto,
      });

      const result = await service.update(mockUserId, mockUpdateDto);
      expect(result.emailEnabled).toBe(false);
      expect(mockNotificationPreferenceRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if the preferences are not found', async () => {
      mockNotificationPreferenceRepository.findOne.mockResolvedValue(null);
      await expect(service.update(mockUserId, mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPreferences', () => {
    it('should return the notification preferences for a given user', async () => {
      mockNotificationPreferenceRepository.findOne.mockResolvedValue({
        ...mockCreateDto,
        userId: mockUserId,
      } as any);

      const result = await service.getPreferences(mockUserId);
      expect(result).toEqual(mockCreateDto);
    });

    it('should throw NotFoundException if the preferences are not found', async () => {
      mockNotificationPreferenceRepository.findOne.mockResolvedValue(null);
      await expect(service.getPreferences(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('filterNotifications', () => {
    it('should filter notifications based on user preferences', async () => {
      const mockNotifications = [
        { type: 'email', content: 'Email notification' },
        { type: 'sms', content: 'SMS notification' },
        { type: 'push', content: 'Push notification' },
        { type: 'inApp', content: 'In-App notification' },
      ];

      mockNotificationPreferenceRepository.findOne.mockResolvedValue({
        ...mockCreateDto,
        userId: mockUserId,
      } as any);

      const result = await service.filterNotifications(
        mockUserId,
        mockNotifications,
      );
      expect(result).toHaveLength(4); // All notifications should be returned if preferences allow them
    });

    it('should return filtered notifications based on disabled preferences', async () => {
      const mockNotifications = [
        { type: 'email', content: 'Email notification' },
        { type: 'sms', content: 'SMS notification' },
        { type: 'push', content: 'Push notification' },
        { type: 'inApp', content: 'In-App notification' },
      ];

      mockNotificationPreferenceRepository.findOne.mockResolvedValue({
        emailEnabled: false, // Email notifications disabled
        smsEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        userId: mockUserId,
      } as any);

      const result = await service.filterNotifications(
        mockUserId,
        mockNotifications,
      );
      expect(result).toHaveLength(3); // Email notification should be filtered out
    });
  });
});
