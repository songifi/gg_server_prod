import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'test-user-id';
      const updateProfileDto = {
        displayName: 'John Doe',
        bio: 'Test bio',
      };

      const user = new User();
      user.id = userId;

      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, ...updateProfileDto });

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(result).toEqual({ ...user, ...updateProfileDto });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent-id', { displayName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when username is taken', async () => {
      const userId = 'test-user-id';
      const updateProfileDto = {
        username: 'taken_username',
      };

      const user = new User();
      user.id = userId;

      const existingUser = new User();
      existingUser.id = 'other-user-id';
      existingUser.username = 'taken_username';

      mockUserRepository.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(existingUser);

      await expect(
        service.updateProfile(userId, updateProfileDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateSettings', () => {
    it('should update user settings successfully', async () => {
      const userId = 'test-user-id';
      const updateSettingsDto = {
        emailNotifications: true,
        darkMode: false,
      };

      const user = new User();
      user.id = userId;
      user.settings = {};

      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        settings: updateSettingsDto,
      });

      const result = await service.updateSettings(userId, updateSettingsDto);

      expect(result.settings).toEqual(updateSettingsDto);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSettings('non-existent-id', { darkMode: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
