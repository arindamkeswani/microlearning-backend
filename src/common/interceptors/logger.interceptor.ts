import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { catchError, tap } from 'rxjs/operators';
import { CLogger } from 'src/bootstrap/logger.service';
import { ContextService } from 'src/core/services/context.service';
import logsConfig from 'src/bootstrap/logs.config';
import * as _ from "lodash";


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler<any>){
        const className = context.getClass().name;
        const loggingService = await ContextService.context.resolve(
            CLogger
        )

        const request = context.switchToHttp().getRequest();
        loggingService.setLogLevels(logsConfig())
        request["logger"] = loggingService;
        let date = Date.now();

        let logMessage = {
            path: request.originalUrl,
            apiUrl: request.path,
            method: request.method,
            headers: _.pick(request.headers, ["x-auth"]),
        }

        return next.handle().pipe(
            tap((data) => {
                loggingService.log(JSON.stringify({
                    timestamp: new Date(),
                    body: JSON.stringify(request.body),
                    ...logMessage,
                    responseTime: Date.now() - date
                }))
            }),
            catchError((err) => {

                loggingService.error(JSON.stringify({
                    className: className,
                    timeStamp: new Date(),
                    error: JSON.stringify(err),
                    stack: JSON.stringify(err.stack),
                    body: JSON.stringify(request.body),
                    ...logMessage,
                    responseTime: Date.now() - date
                }))
                throw err;
            })
        )
    }

}