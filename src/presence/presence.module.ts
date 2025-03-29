import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PresenceService } from './services/presence.service';
import { PresenceGateway } from './presence.gateway';
import { PresenceController } from './presence.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 86400000, // 24 hours in milliseconds
      max: 10000, // Maximum number of items in cache
    }),
    EventEmitterModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PresenceService, PresenceGateway],
  controllers: [PresenceController],
  exports: [PresenceService],
})
export class PresenceModule {}
