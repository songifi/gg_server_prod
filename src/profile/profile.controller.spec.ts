import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from '../users/entities/user.entity';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockProfileService = {
    updateProfile: jest.fn(),
    updateSettings: jest.fn(),
    getSettings: jest.fn(),
    uploadAvatar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should call service.updateProfile with correct parameters', async () => {
      const userId = 'test-user-id';
      const updateProfileDto = {
        displayName: 'John Doe',
        bio: 'Test bio',
      };

      const user = new User();
      user.id = userId;
      user.displayName = updateProfileDto.displayName;
      user.bio = updateProfileDto.bio;

      mockProfileService.updateProfile.mockResolvedValue(user);

      const result = await controller.updateProfile(userId, updateProfileDto);

      expect(service.updateProfile).toHaveBeenCalledWith(userId, updateProfileDto);
      expect(result).toEqual(user);
    });
  });

  describe('getSettings', () => {
    it('should call service.getSettings with correct parameters', async () => {
      const userId = 'test-user-id';
      const expectedSettings = {
        emailNotifications: true,
        darkMode: false,
      };

      mockProfileService.getSettings.mockResolvedValue(expectedSettings);

      const result = await controller.getSettings(userId);

      expect(service.getSettings).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedSettings);
    });
  });

  describe('updateSettings', () => {
    it('should call service.updateSettings with correct parameters', async () => {
      const userId = 'test-user-id';
      const updateSettingsDto = {
        emailNotifications: true,
        darkMode: false,
      };

      const user = new User();
      user.id = userId;
      user.settings = updateSettingsDto;

      mockProfileService.updateSettings.mockResolvedValue(user);

      const result = await controller.updateSettings(userId, updateSettingsDto);

      expect(service.updateSettings).toHaveBeenCalledWith(
        userId,
        updateSettingsDto,
      );
      expect(result).toEqual(user);
    });
  });

  describe('uploadAvatar', () => {
    it('should call service.uploadAvatar with correct parameters', async () => {
      const userId = 'test-user-id';
      const mockFile = {
        filename: 'test-avatar.jpg',
        fieldname: 'avatar',
        originalname: 'avatar.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: './uploads/avatars',
        path: './uploads/avatars/test-avatar.jpg',
        buffer: Buffer.from([]),
      } as Express.Multer.File;

      const user = new User();
      user.id = userId;
      user.avatar = mockFile.filename;

      mockProfileService.uploadAvatar.mockResolvedValue(user);

      const result = await controller.uploadAvatar(userId, mockFile);

      expect(service.uploadAvatar).toHaveBeenCalledWith(userId, mockFile);
      expect(result).toEqual(user);
    });
  });
});
