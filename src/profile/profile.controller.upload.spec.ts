import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('ProfileController (Upload)', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockProfileService = {
    uploadAvatar: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  describe('uploadAvatar', () => {
    const userId = 'test-user-id';
    const uploadDir = './uploads/avatars';
    const mockFile = {
      fieldname: 'avatar',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      destination: uploadDir,
      filename: 'test-uuid.jpg',
      path: join(uploadDir, 'test-uuid.jpg'),
      buffer: Buffer.from('test'),
    };

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(uploadDir);
      jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);
    });

    it('should successfully upload avatar', async () => {
      const user = new User();
      user.id = userId;
      user.avatar = mockFile.filename;

      mockProfileService.uploadAvatar.mockResolvedValue(user);

      const result = await controller.uploadAvatar(userId, mockFile);

      expect(service.uploadAvatar).toHaveBeenCalledWith(userId, mockFile);
      expect(result).toEqual(user);
    });

    it('should reject files larger than 5MB', async () => {
      const largeFile = {
        ...mockFile,
        size: 6 * 1024 * 1024, // 6MB
      };

      await expect(controller.uploadAvatar(userId, largeFile)).rejects.toThrow();
    });

    it('should reject non-image files', async () => {
      const nonImageFile = {
        ...mockFile,
        mimetype: 'text/plain',
        originalname: 'test.txt',
      };

      await expect(controller.uploadAvatar(userId, nonImageFile)).rejects.toThrow();
    });

    it('should handle missing file', async () => {
      mockProfileService.uploadAvatar.mockRejectedValue(
        new BadRequestException('No file uploaded'),
      );

      await expect(controller.uploadAvatar(userId, null)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
