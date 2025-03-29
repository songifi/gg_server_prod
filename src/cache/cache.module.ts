import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheService } from './cache.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Content } from 'src/content/entities/content.entity';
import { CacheMonitorController } from './cache-monitor.controller';
import { ContentCacheService } from './content-cache.service';
import { CacheWarmerService } from './cache-warmer.service';
import { ContentSubscriber } from 'src/content/content-subscriber';
import { CdnCacheInterceptor } from './interceptors/cdn-cache.interceptor';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Redis } from 'ioredis';
import { TerminusModule } from '@nestjs/terminus';
import redisStore from 'cache-manager-ioredis'; // Correct import

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          ttl: 60 * 60, // Default TTL in seconds (1 hour)
        }),
      }),
    }),
    TerminusModule,
    TypeOrmModule.forFeature([Content]),
  ],
  controllers: [CacheMonitorController],
  providers: [
    CacheService,
    CircuitBreakerService,
    ContentCacheService,
    CacheWarmerService,
    ContentSubscriber,
    Redis,
    {
      provide: APP_INTERCEPTOR,
      useClass: CdnCacheInterceptor,
    },
  ],
  exports: [CacheService, ContentCacheService, Redis],
})
export class CacheModule {}
