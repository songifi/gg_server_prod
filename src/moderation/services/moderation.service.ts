import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationQueue, ModerationStatus, ModerationReason } from '../entities/moderation-queue.entity';
import { Message } from '../../message/entities/message.entity';
import { User } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum ModerationLevel {
  STRICT = 'strict',
  MODERATE = 'moderate',
  MINIMAL = 'minimal',
}

@Injectable()
export class ModerationService {
  private readonly toxicityThresholds = {
    [ModerationLevel.STRICT]: 0.6,
    [ModerationLevel.MODERATE]: 0.8,
    [ModerationLevel.MINIMAL]: 0.9,
  };

  constructor(
    @InjectRepository(ModerationQueue)
    private readonly moderationQueueRepo: Repository<ModerationQueue>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async analyzeContent(content: string, userId: string): Promise<{ 
    shouldFlag: boolean;
    toxicityScore: number;
  }> {
    const perspectiveApiKey = this.configService.get('PERSPECTIVE_API_KEY');
    const userReputationThreshold = await this.getUserReputationThreshold(userId);
    
    try {
      const response = await firstValueFrom(this.httpService.post(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${perspectiveApiKey}`,
        {
          comment: { text: content },
          languages: ['en'],
          requestedAttributes: { TOXICITY: {} },
        }
      ));

      const toxicityScore = response.data.attributeScores.TOXICITY.summaryScore.value;
      const shouldFlag = toxicityScore > userReputationThreshold;

      return { shouldFlag, toxicityScore };
    } catch (error) {
      // Fallback to basic profanity check if API fails
      const hasProfanity = this.checkBasicProfanity(content);
      return { shouldFlag: hasProfanity, toxicityScore: hasProfanity ? 1 : 0 };
    }
  }

  private async getUserReputationThreshold(userId: string): Promise<number> {
    // TODO: Implement reputation-based threshold adjustment
    return this.toxicityThresholds[ModerationLevel.MODERATE];
  }

  private checkBasicProfanity(content: string): boolean {
    const profanityList = ['badword1', 'badword2']; // Replace with actual profanity list
    return profanityList.some(word => content.toLowerCase().includes(word));
  }

  async queueForModeration(
    message: Message,
    reason: ModerationReason,
    toxicityScore?: number,
  ): Promise<ModerationQueue> {
    const queueItem = this.moderationQueueRepo.create({
      message,
      reason,
      toxicityScore,
      status: ModerationStatus.PENDING,
    });

    return this.moderationQueueRepo.save(queueItem);
  }

  async reviewContent(
    queueItemId: string,
    moderator: User,
    approved: boolean,
    notes?: string,
  ): Promise<ModerationQueue> {
    const queueItem = await this.moderationQueueRepo.findOne({
      where: { id: queueItemId },
      relations: ['message', 'assignedModerator'],
    });

    if (!queueItem) {
      throw new Error('Moderation queue item not found');
    }

    queueItem.status = approved ? ModerationStatus.APPROVED : ModerationStatus.REJECTED;
    queueItem.assignedModerator = moderator;
    queueItem.notes = notes;

    return this.moderationQueueRepo.save(queueItem);
  }

  async getQueue(status?: ModerationStatus): Promise<ModerationQueue[]> {
    const query = this.moderationQueueRepo.createQueryBuilder('queue')
      .leftJoinAndSelect('queue.message', 'message')
      .leftJoinAndSelect('queue.assignedModerator', 'moderator');

    if (status) {
      query.where('queue.status = :status', { status });
    }

    return query
      .orderBy('queue.createdAt', 'DESC')
      .getMany();
  }
}
