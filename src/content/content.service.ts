import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  async findAll(): Promise<Content[]> {
    return this.contentRepository.find();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });

    if (content) {
      // Update views and last accessed
      content.views += 1;
      content.last_accessed = new Date();
      await this.contentRepository.save(content);
    }

    return content;
  }

  async create(contentData: Partial<Content>): Promise<Content> {
    const content = this.contentRepository.create(contentData);
    return this.contentRepository.save(content);
  }

  async update(id: string, contentData: Partial<Content>): Promise<Content> {
    await this.contentRepository.update(id, contentData);
    return this.contentRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.contentRepository.delete(id);
  }
}
