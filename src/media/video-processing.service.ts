import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class VideoProcessingService {
  async transcodeVideo(inputFile: string, outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .output(outputFile)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }
}
