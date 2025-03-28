import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export enum ReputationAction {
  CONTENT_APPROVED = 'content_approved',
  CONTENT_REJECTED = 'content_rejected',
  CONTENT_REPORTED = 'content_reported',
  REPORT_VALIDATED = 'report_validated',
  REPORT_DISMISSED = 'report_dismissed'
}

const REPUTATION_CHANGES = {
  [ReputationAction.CONTENT_APPROVED]: 5,
  [ReputationAction.CONTENT_REJECTED]: -10,
  [ReputationAction.CONTENT_REPORTED]: -3,
  [ReputationAction.REPORT_VALIDATED]: 2,
  [ReputationAction.REPORT_DISMISSED]: -1
};

@Injectable()
export class ReputationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateReputation(userId: string, action: ReputationAction): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const change = REPUTATION_CHANGES[action];
    user.reputationScore = Math.max(0, Math.min(100, (user.reputationScore || 50) + change));
    await this.userRepository.save(user);

    return user.reputationScore;
  }

  async getReputationThreshold(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return 0.8; // Default threshold
    }

    // Adjust threshold based on reputation
    if (user.reputationScore >= 80) {
      return 0.9; // More lenient for trusted users
    } else if (user.reputationScore <= 30) {
      return 0.6; // Stricter for low-reputation users
    }
    return 0.8; // Default threshold
  }

  async getReputationStats(userId: string): Promise<{
    score: number;
    level: string;
    threshold: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const threshold = await this.getReputationThreshold(userId);
    const level = this.getReputationLevel(user.reputationScore);

    return {
      score: user.reputationScore,
      level,
      threshold
    };
  }

  private getReputationLevel(score: number): string {
    if (score >= 80) return 'Trusted';
    if (score >= 60) return 'Good Standing';
    if (score >= 40) return 'Neutral';
    if (score >= 20) return 'Warning';
    return 'Restricted';
  }
}
