import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SearchService } from './search.service';

@Injectable()
export class IndexingService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly searchService: SearchService,
    @InjectQueue('indexing') private readonly indexingQueue: Queue,
  ) {}

  async indexDocument(index: string, document: any, roomIds: string[] = []) {
    try {
      // Add document to indexing queue
      await this.indexingQueue.add('index', {
        index,
        document,
        operation: 'index',
      });

      // Prepare suggestion data
      const suggestionDoc = this.prepareSuggestionData(document);
      
      // Index the document
      await this.elasticsearchService.index({
        index,
        body: {
          ...document,
          suggest: suggestionDoc,
          timestamp: new Date(),
        },
      });

      // Notify relevant rooms of the update
      if (roomIds.length > 0) {
        const update = {
          type: 'new_content',
          index,
          document: {
            id: document.id,
            type: index,
            preview: this.getDocumentPreview(document),
          },
        };

        roomIds.forEach(roomId => {
          this.searchService.notifyRealtimeUpdate(roomId, update);
        });
      }
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  async updateDocument(index: string, id: string, update: any, roomIds: string[] = []) {
    try {
      // Add update to queue
      await this.indexingQueue.add('index', {
        index,
        id,
        document: update,
        operation: 'update',
      });

      // Update the document
      await this.elasticsearchService.update({
        index,
        id,
        body: {
          doc: {
            ...update,
            timestamp: new Date(),
          },
        },
      });

      // Notify relevant rooms of the update
      if (roomIds.length > 0) {
        const updateNotification = {
          type: 'update_content',
          index,
          id,
          update: this.getDocumentPreview(update),
        };

        roomIds.forEach(roomId => {
          this.searchService.notifyRealtimeUpdate(roomId, updateNotification);
        });
      }
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(index: string, id: string, roomIds: string[] = []) {
    try {
      // Add deletion to queue
      await this.indexingQueue.add('index', {
        index,
        id,
        operation: 'delete',
      });

      // Delete the document
      await this.elasticsearchService.delete({
        index,
        id,
      });

      // Notify relevant rooms of the deletion
      if (roomIds.length > 0) {
        const deleteNotification = {
          type: 'delete_content',
          index,
          id,
        };

        roomIds.forEach(roomId => {
          this.searchService.notifyRealtimeUpdate(roomId, deleteNotification);
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  private prepareSuggestionData(document: any) {
    // Create suggestion entries from relevant fields
    const suggestions = [];

    if (document.title) {
      suggestions.push({
        input: document.title,
        weight: 5,
      });
    }

    if (document.content) {
      // Extract key phrases from content
      const phrases = this.extractKeyPhrases(document.content);
      suggestions.push(...phrases.map(phrase => ({
        input: phrase,
        weight: 3,
      })));
    }

    if (document.tags) {
      suggestions.push(...document.tags.map(tag => ({
        input: tag,
        weight: 4,
      })));
    }

    return suggestions;
  }

  private extractKeyPhrases(content: string): string[] {
    // Simple implementation - could be enhanced with NLP
    const words = content.split(/\s+/).filter(word => word.length > 3);
    const phrases = new Set<string>();
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      phrases.add(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        phrases.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    return Array.from(phrases);
  }

  private getDocumentPreview(document: any) {
    return {
      title: document.title,
      content: document.content?.substring(0, 100),
      type: document.type,
      timestamp: document.timestamp,
    };
  }
}
