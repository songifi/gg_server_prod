import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { NotificationsService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a notification', async () => {
      const createDto: CreateNotificationDto = {
        message: 'Test Notification',
        userId: 1,
      };
      const user = new User();
      user.id = 1;

      const mockNotification: Notification = {
        id: '1',
        ...createDto,
        user,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(notificationRepository, 'create')
        .mockReturnValue(mockNotification);
      jest
        .spyOn(notificationRepository, 'save')
        .mockResolvedValue(mockNotification);

      const result = await service.create(createDto);
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.create({ message: 'Test', userId: 99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const notifications: Notification[] = [
        {
          id: '1',
          message: 'Test Notification',
          user: new User(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest
        .spyOn(notificationRepository, 'find')
        .mockResolvedValue(notifications);
      const result = await service.findAll();
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('should return a notification if found', async () => {
      const notification: Notification = {
        id: '1',
        message: 'Test Notification',
        user: new User(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(notificationRepository, 'findOne')
        .mockResolvedValue(notification);
      const result = await service.findOne('1');
      expect(result).toEqual(notification);
    });

    it('should throw NotFoundException if notification is not found', async () => {
      jest.spyOn(notificationRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated notification', async () => {
      const updateDto: UpdateNotificationDto = {
        message: 'Updated Notification',
      };
      const notification: Notification = {
        id: '1',
        message: 'Old Notification',
        user: new User(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(notification);
      jest
        .spyOn(notificationRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(notificationRepository, 'findOne')
        .mockResolvedValue({ ...notification, ...updateDto });

      const result = await service.update('1', updateDto);
      expect(result).toEqual({ ...notification, ...updateDto });
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      jest
        .spyOn(notificationRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);
      await expect(service.delete('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if notification is not found', async () => {
      jest
        .spyOn(notificationRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);
      await expect(service.delete('99')).rejects.toThrow(NotFoundException);
    });
  });
});
