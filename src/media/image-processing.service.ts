import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  async processImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(800, 600, { fit: 'inside' })
      .toFormat('jpeg')
      .toBuffer();
  }
}
