import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { StorageDriver, initializeTransactionalContext } from 'typeorm-transactional';

import { configSwagger, configs } from '@/base/configs';
import { StripUndefinedPipe } from '@/base/pipes';

import { AppModule } from './app.module';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create(AppModule);

  // URL prefix: /api/v1
  app.setGlobalPrefix('/api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  configSwagger(app);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
    new StripUndefinedPipe(),
  );

  await app.listen(configs.APP_PORT, () => {
    logger.log(`Current environment: ${configs.NODE_ENV}`);
    logger.log(`Server is running on port ${configs.APP_PORT}`);
    if (configs.NODE_ENV === 'development') {
      logger.log(`API: http://localhost:${configs.APP_PORT}/api/v1`);
      logger.log(`Swagger Docs: http://localhost:${configs.APP_PORT}/api/v1/docs`);
    }
  });
}
void bootstrap();
