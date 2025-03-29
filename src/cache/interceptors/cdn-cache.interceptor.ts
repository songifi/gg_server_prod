import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CdnCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    // Add cache-control headers based on content type
    return next.handle().pipe(
      tap(() => {
        // Skip for non-GET requests
        if (request.method !== 'GET') {
          return;
        }

        // Check content type and set appropriate cache headers
        const path = request.url;

        if (path.includes('/static/')) {
          // Static content
          response.header('Cache-Control', 'public, max-age=86400'); // 24 hours
          response.header('CDN-Cache-Control', 'public, max-age=604800'); // 7 days for CDN
          response.header('Surrogate-Control', 'max-age=604800'); // 7 days
        } else if (path.includes('/content/')) {
          // Dynamic content
          response.header('Cache-Control', 'public, max-age=300'); // 5 minutes
          response.header('CDN-Cache-Control', 'public, max-age=3600'); // 1 hour for CDN
          response.header('Surrogate-Control', 'max-age=3600'); // 1 hour
          response.header('Surrogate-Key', `content-${path.split('/').pop()}`); // For targeted invalidation
        } else {
          // Default - no caching
          response.header('Cache-Control', 'no-cache, no-store');
          response.header('Pragma', 'no-cache');
        }
      }),
    );
  }
}
