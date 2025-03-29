import { Injectable, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SuggestionQueryDto } from '../dto/suggestion-query.dto';
import { SuggestionResponse } from '../interfaces/search.types';

@Injectable()
export class SuggestionService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getSuggestions(userId: string, queryDto: SuggestionQueryDto): Promise<SuggestionResponse[]> {
    const { query, limit = 5, personalized = true } = queryDto;

    // Try to get cached suggestions
    const cacheKey = `suggestions:${query}:${userId}`;
    const cached = await this.cacheManager.get<SuggestionResponse[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get spelling suggestions
    const correctedQuery = await this.getSpellingCorrection(query);

    // Build Elasticsearch suggestion query
    const esQuery = {
      index: ['messages', 'profiles', 'content'],
      body: {
        suggest: {
          completion: {
            prefix: query,
            completion: {
              field: 'suggest',
              size: limit,
              fuzzy: {
                fuzziness: 'AUTO',
              },
              contexts: personalized ? {
                user_id: userId,
              } : undefined,
            },
          },
        },
        _source: ['title', 'content', 'type'],
      },
    };

    const result = await this.elasticsearchService.search(esQuery);
    
    const suggestions: SuggestionResponse[] = [];

    // Extract suggestions from Elasticsearch response
    const options = result.suggest?.completion?.[0]?.options;
    if (Array.isArray(options)) {
      suggestions.push(
        ...options.map(option => ({
          text: option.text,
          score: option._score,
          source: {
            type: option._source?.type,
            title: option._source?.title,
          },
        }))
      );
    }

    // Add spelling correction if different from original
    if (correctedQuery !== query) {
      suggestions.unshift({
        text: correctedQuery,
        score: 1,
        isSpellingCorrection: true,
      });
    }

    // Cache suggestions for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, suggestions, 300000);

    return suggestions;
  }

  private async getSpellingCorrection(query: string): Promise<string> {
    // Simple implementation - can be enhanced with a proper NLP service
    return query; // For now, return the original query
  }

  // Method to train the spelling correction model with domain-specific terms
  async trainSpellingModel(terms: string[]) {
    // Implement actual spelling model training when needed
    console.log('Training spelling model with terms:', terms);
  }
}
