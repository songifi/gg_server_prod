import { Injectable } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';
import { VideoProcessingService } from './video-processing.service';
import { AudioProcessingService } from './audio-processing.service';
import { UploadService } from './upload.service';
import { Express } from 'express';
import * as fs from 'fs/promises'; // ✅ Needed for reading video/audio files

@Injectable()
export class MediaService {
  constructor(
    private readonly imageProcessing: ImageProcessingService,
    private readonly videoProcessing: VideoProcessingService,
    private readonly audioProcessing: AudioProcessingService,
    private readonly uploadService: UploadService,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    let processedBuffer: Buffer | null = null;
    let outputPath: string | null = null;

    if (file.mimetype.startsWith('image/')) {
      processedBuffer = await this.imageProcessing.processImage(file.buffer);
    } else if (file.mimetype.startsWith('video/')) {
      outputPath = 'output.mp4';
      await this.videoProcessing.transcodeVideo(file.path, outputPath);
    } else if (file.mimetype.startsWith('audio/')) {
      outputPath = 'output.mp3';
      await this.audioProcessing.processAudio(file.path, outputPath);
    }

    if (!processedBuffer && outputPath) {
      processedBuffer = await fs.readFile(outputPath); // ✅ Read file as buffer
    }

    if (!processedBuffer) {
      throw new Error('File processing failed. No buffer found.');
    }

    const fileUrl = await this.uploadService.uploadFile(
      processedBuffer,
      file.originalname,
    );
    return fileUrl;
  }

  async processAndStore(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file);
  }
}
