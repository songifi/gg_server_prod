import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '../entities/search-history.entity';
import { SearchQueryDto } from '../dto/search-query.dto';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { SearchResult } from '../interfaces/search.types';

@WebSocketGateway({
  cors: true,
})
@Injectable()
export class SearchService {
  @WebSocketServer() server: Server;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async search(userId: string, searchQuery: SearchQueryDto): Promise<SearchResult> {
    const { query, page = 1, limit = 20, filters = {}, includeSocial = true, types } = searchQuery;

    // Build Elasticsearch query
    const esQuery = {
      index: types,
      body: {
        query: {
          function_score: {
            query: {
              bool: {
                must: [
                  {
                    multi_match: {
                      query,
                      fields: ['content^2', 'title^1.5', 'description'],
                      fuzziness: 'AUTO',
                    },
                  },
                ],
                filter: this.buildFilters(filters),
              },
            },
            functions: includeSocial ? this.getSocialScoreFunctions(userId) : [],
            boost_mode: 'multiply',
          },
        },
        from: (page - 1) * limit,
        size: limit,
        highlight: {
          fields: {
            content: {},
            title: {},
            description: {},
          },
        },
        aggs: this.buildAggregations(),
      },
    };

    const searchResult = await this.elasticsearchService.search(esQuery);
    const total = typeof searchResult.hits.total === 'number' 
      ? searchResult.hits.total 
      : searchResult.hits.total?.value || 0;

    // Save search history
    await this.searchHistoryRepository.save({
      userId,
      query,
      filters,
      resultCount: total,
    });

    // Format and return results
    return {
      hits: searchResult.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        type: hit._index,
        source: hit._source,
        highlight: hit.highlight,
      })),
      total,
      facets: this.formatAggregations(searchResult.aggregations),
      page,
      limit,
    };
  }

  private buildFilters(filters: Record<string, any>) {
    const filterClauses = [];

    Object.entries(filters).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        filterClauses.push({ terms: { [field]: value } });
      } else {
        filterClauses.push({ term: { [field]: value } });
      }
    });

    return filterClauses;
  }

  private getSocialScoreFunctions(userId: string) {
    return [
      {
        filter: { term: { 'connections.id': userId } },
        weight: 1.5,
      },
      {
        filter: { term: { 'interactions.userId': userId } },
        weight: 1.3,
      },
      {
        gauss: {
          timestamp: {
            origin: 'now',
            scale: '7d',
            decay: 0.5,
          },
        },
      },
    ];
  }

  private buildAggregations() {
    return {
      types: { terms: { field: '_index' } },
      categories: { terms: { field: 'category.keyword' } },
      authors: { terms: { field: 'author.keyword' } },
      dates: {
        date_histogram: {
          field: 'timestamp',
          calendar_interval: 'month',
        },
      },
    };
  }

  private formatAggregations(aggs: any) {
    const formatted = {};
    Object.entries(aggs || {}).forEach(([key, value]: [string, any]) => {
      formatted[key] = value.buckets.map(bucket => ({
        key: bucket.key,
        count: bucket.doc_count,
      }));
    });
    return formatted;
  }

  // Method to notify clients of real-time updates
  async notifyRealtimeUpdate(roomId: string, update: any) {
    this.server.to(roomId).emit('search:update', update);
  }
}
