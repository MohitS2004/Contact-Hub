import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Transforms responses to standard API format
 * Skips transformation if response is already in ApiResponse format
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map((data) => {
        // If response is already in ApiResponse format, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If response is a paginated response (has items, total, page, limit, totalPages), return as-is
        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'total' in data &&
          'page' in data &&
          'limit' in data &&
          'totalPages' in data
        ) {
          return data;
        }

        // Transform to standard API response format
        return {
          success: true,
          message: 'Operation completed successfully',
          data,
          timestamp: new Date().toISOString(),
        } as ApiResponse<T>;
      }),
    );
  }
}

