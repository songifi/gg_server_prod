import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { UploadService } from './upload.service';
import { VideoProcessingService } from './video-processing.service';
import { AudioProcessingService } from './audio-processing.service';
import { ImageProcessingService } from './image-processing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  controllers: [MediaController],
  providers: [
    MediaService,
    UploadService,
    VideoProcessingService,
    AudioProcessingService,
    ImageProcessingService,
  ],
  exports: [MediaService],
})
export class MediaModule {}
