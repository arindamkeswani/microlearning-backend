import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { ResponseMessage, ResponseStatus } from '../../common/utils/constants';

/**
* Handles the Exception Thrown
*/
@Catch()
export class HttpExceptionFilter implements ExceptionFilter{
    catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let status = null;
        let message = null;

        console.log(exception);
        if(exception instanceof HttpException){
            status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
            message = (exception.getResponse() as any)?.message || exception?.message;
        } else if(exception?.isAxiosError){
            status = exception.response?.status;
            message = exception.response?.statusText;
        } else {
            status = ResponseStatus.InternalServerError;
            message = ResponseMessage.InternalServerError + `${exception ? "--> " + exception.message :  ""}`;
        }

        // @ts-ignore
        response.status(status as number).json({
            success: false,
            error: { message: Array.isArray(message) ? message[0] : message },
            status: status,
            fieldErrors: Array.isArray(message) ? message : [message]
        })

    }
}