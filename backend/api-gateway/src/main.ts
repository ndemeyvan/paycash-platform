import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './types/common/response.interceptor.js';
import { ApiExceptionFilter } from './types/common/error.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:3000',
      'http://localhost:4200',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('PayCash API Gateway')
    .setDescription('API Gateway for PayCash Platform - Cameroon Mobile Money')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(4000);
  console.log('🚀 API Gateway running on http://localhost:4000');
  console.log('📚 Swagger: http://localhost:4000/api/docs');
}

void bootstrap();
