import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class AudioProcessingService {
  async processAudio(inputFile: string, outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .output(outputFile)
        .audioCodec('aac')
        .format('mp3')
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }
}
