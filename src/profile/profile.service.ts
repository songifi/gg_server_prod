import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { UpdateSettingsDto } from './dto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check username uniqueness if being updated
    if (updateProfileDto.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    // Update user profile
    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user settings
    if (!user.settings) {
      user.settings = {};
    }
    Object.assign(user.settings, updateSettingsDto);
    return this.userRepository.save(user);
  }

  async getSettings(userId: string): Promise<Record<string, any>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.settings || {};
  }

  async uploadAvatar(userId: string, file: any): Promise<User> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        const oldAvatarPath = join(this.configService.get('UPLOAD_DIR', './uploads/avatars'), user.avatar);
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        // Ignore error if file doesn't exist
      }
    }

    // Update user with new avatar path
    user.avatar = file.filename;
    return this.userRepository.save(user);
  }
}
