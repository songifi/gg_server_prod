import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchController } from './controllers/search.controller';
import { SearchHistoryController } from './controllers/search-history.controller';
import { SearchService } from './services/search.service';
import { SuggestionService } from './services/suggestion.service';
import { IndexingService } from './services/indexing.service';
import { SearchHistory } from './entities/search-history.entity';
import { SearchFavorite } from './entities/search-favorite.entity';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'indexing',
    }),
    TypeOrmModule.forFeature([SearchHistory, SearchFavorite]),
  ],
  controllers: [SearchController, SearchHistoryController],
  providers: [SearchService, SuggestionService, IndexingService],
  exports: [SearchService, IndexingService],
})
export class SearchModule {}
