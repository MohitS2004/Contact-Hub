import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (response.headersSent || request.url?.includes('/export')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

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

        return {
          success: true,
          data,
          message: 'Operation successful',
        } as ApiResponse<T>;
      }),
    );
  }
}

