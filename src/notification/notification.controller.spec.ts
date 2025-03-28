import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createDto: CreateNotificationDto = {
        message: 'Test Notification',
        userId: '1',
      };
      const notification: Notification = {
        id: '1',
        ...createDto,
        user: { id: '1', username: 'user1' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(notification);

      const result = await controller.create(createDto);
      expect(result).toEqual(notification);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      const createDto: CreateNotificationDto = {
        message: 'Test Notification',
        userId: '99',
      };

      jest.spyOn(service, 'create').mockRejectedValue(new NotFoundException());

      await expect(controller.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const notifications: Notification[] = [
        {
          id: '1',
          message: 'Test Notification',
          user: { id: '1', username: 'user1' },
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(notifications);

      const result = await controller.findAll();
      expect(result).toEqual(notifications);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a notification if found', async () => {
      const notification: Notification = {
        id: '1',
        message: 'Test Notification',
        user: { id: '1', username: 'user1' },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(notification);

      const result = await controller.findOne('1');
      expect(result).toEqual(notification);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if notification is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the notification', async () => {
      const updateDto: UpdateNotificationDto = {
        message: 'Updated Notification',
      };
      const updatedNotification: Notification = {
        id: '1',
        message: 'Updated Notification',
        user: { id: '1', username: 'user1' },
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedNotification);

      const result = await controller.update('1', updateDto);
      expect(result).toEqual(updatedNotification);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await expect(controller.delete('1')).resolves.not.toThrow();
      expect(service.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if notification is not found', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(new NotFoundException());

      await expect(controller.delete('99')).rejects.toThrow(NotFoundException);
    });
  });
});
