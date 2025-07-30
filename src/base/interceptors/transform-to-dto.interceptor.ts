import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class TransformToDtoInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransformToDtoInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    this.logger.log(this.reflector.get('ToDTO', context.getClass()));

    return next.handle();
  }
}
