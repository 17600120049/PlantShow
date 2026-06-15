import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  app.setGlobalPrefix('api');
  
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
