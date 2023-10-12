import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class ResponseTransformerInterceptor implements NestInterceptor {
    intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      const allowedRequestMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];
  
      if (allowedRequestMethods.indexOf(request.method) === -1) {
        return next.handle();
      }
  
      return next.handle().pipe(
        map((data) => {
          const resp = {
            statusCode: response.statusCode,
            message: '',
            success: true,
            data,
            paginate: undefined,
            metadata: undefined,
          };
  
          if (data && typeof data === 'object' && 'message' in data) {
            resp.message = data.message;
            delete data.message;
          }
  
          if (data && typeof data === 'object' && 'paginate' in data) {
            resp.paginate = data.paginate;
            delete data.paginate;
          }
  
          if (data && typeof data === 'object' && 'data' in data) {
            resp.data = data.data;
            delete data.data;
          }
  
          if (data && typeof data === 'object' && 'metadata' in data) {
            resp.metadata = data.metadata;
            resp.metadata?.log ? delete resp.metadata.log : {};
            resp.metadata?.notification ? delete resp.metadata.notification : {};
            delete data.metadata;
          }
  
          return resp;
        }),
      );
    }
  }
  