import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseTransformerInterceptor } from './common/interceptors/response.interceptor'
import { ContextService } from './core/services/context.service';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      validateCustomDecorators: true
    })
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalInterceptors(new ResponseTransformerInterceptor())

  app.useGlobalInterceptors(new ResponseTransformerInterceptor())

  app.useGlobalInterceptors(new LoggingInterceptor());

  ContextService.context = app;

  const config = new DocumentBuilder()
    .setTitle('Microlearning')
    .setDescription('Microlearning Microservice API document')
    .setVersion('1.0')
    .addTag('micro')
    .build()
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { filter: true }
  })

  const port = app.get<ConfigService>(ConfigService).get('port') || 5002;
  const env = app.get<ConfigService>(ConfigService).get('ENV') || 'Hackathon Winning';
  
  await app.listen(port);

  console.log(`App launched successfully!\nPort: ${port}\nEnvironment: ${env}`);
}
bootstrap();
