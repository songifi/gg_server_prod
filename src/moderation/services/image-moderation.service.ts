import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ImageAnalysisResult {
  isInappropriate: boolean;
  confidence: number;
  labels: string[];
}

@Injectable()
export class ImageModerationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    const googleVisionApiKey = this.configService.get('GOOGLE_VISION_API_KEY');
    
    try {
      const response = await firstValueFrom(this.httpService.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
        {
          requests: [{
            image: {
              source: {
                imageUri: imageUrl
              }
            },
            features: [
              { type: 'SAFE_SEARCH_DETECTION' },
              { type: 'LABEL_DETECTION', maxResults: 10 }
            ]
          }]
        }
      ));

      const safeSearch = response.data.responses[0].safeSearchAnnotation;
      const labels = response.data.responses[0].labelAnnotations.map(label => label.description);

      // Check for inappropriate content based on Safe Search categories
      const isInappropriate = this.evaluateSafeSearch(safeSearch);
      const confidence = this.calculateConfidence(safeSearch);

      return {
        isInappropriate,
        confidence,
        labels
      };
    } catch (error) {
      console.error('Image analysis failed:', error);
      return {
        isInappropriate: false,
        confidence: 0,
        labels: []
      };
    }
  }

  private evaluateSafeSearch(safeSearch: any): boolean {
    const highRiskLevels = ['LIKELY', 'VERY_LIKELY'];
    return ['adult', 'violence', 'racy'].some(
      category => highRiskLevels.includes(safeSearch[category])
    );
  }

  private calculateConfidence(safeSearch: any): number {
    const weights = {
      VERY_LIKELY: 1.0,
      LIKELY: 0.8,
      POSSIBLE: 0.6,
      UNLIKELY: 0.2,
      VERY_UNLIKELY: 0
    };

    const categories = ['adult', 'violence', 'racy'];
    const scores = categories.map(category => weights[safeSearch[category]] || 0);
    return Math.max(...scores);
  }
}
