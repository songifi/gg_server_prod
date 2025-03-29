import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
  Connection,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Content } from './entities/content.entity';
import { ContentCacheService } from 'src/cache/content-cache.service';

@Injectable()
@EventSubscriber()
export class ContentSubscriber implements EntitySubscriberInterface<Content> {
  constructor(
    private connection: Connection,
    private contentCacheService: ContentCacheService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Content;
  }

  async afterUpdate(event: UpdateEvent<Content>) {
    if (event.entity && event.entity.id) {
      await this.contentCacheService.invalidateContent(event.entity.id);
      console.log(
        `Cache invalidated for content ${event.entity.id} due to database update`,
      );
    }
  }
}
