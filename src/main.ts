import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {

  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // app.enableCors({
  //   origin: ['https://imperahub.com'], // Tus dominios de GoDaddy
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );


  await app.listen( envs.port );
  
  logger.log(`Demo service running on port ${envs.port}`);
}
bootstrap();
