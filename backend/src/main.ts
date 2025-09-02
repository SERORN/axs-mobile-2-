import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:19006', // Expo dev server
      'http://localhost:19000', // Expo dev tools
      'exp://192.168.1.100:19000', // Expo client
      'exp://localhost:19000', // Expo client local
      configService.get('FRONTEND_URL', 'http://localhost:3000'),
    ],
    credentials: true,
  });

  // Stripe webhook raw body middleware
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('AXS Mobile API')
    .setDescription('Backend API for AXS Mobile Application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api');

  // Asegúrate de usar el puerto de .env (default 3001)
  const port = parseInt(process.env.PORT ?? '', 10) || 3001;
  await app.listen(port);
  console.log(`AXS Backend API running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`� Development Mode - Local endpoints only`);
  console.log(`🎯 Webhook endpoint: http://localhost:${port}/api/webhooks/stripe`);
}

bootstrap();
