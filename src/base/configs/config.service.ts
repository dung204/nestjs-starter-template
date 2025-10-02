import { Injectable } from '@nestjs/common';
import { S3Options } from 'bun';
import type { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class ConfigService {
  NODE_ENV = process.env['NODE_ENV'];
  APP_PORT = parseInt(process.env['APP_PORT'] ?? '3000');
  USE_HTTPS = process.env['USE_HTTPS'] === 'true';

  ACCESS_SECRET_KEY = process.env['ACCESS_SECRET_KEY'];
  REFRESH_SECRET_KEY = process.env['REFRESH_SECRET_KEY'];

  POSTGRES = {
    type: 'postgres',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE_NAME'],
    synchronize: false,
    entities: ['src/**/*.entity.ts'],
    migrations: ['dist/**/database/migrations/*.js'],
    migrationsRun: process.env['NODE_ENV'] === 'production',
    namingStrategy: new SnakeNamingStrategy(),
    logging: process.env['NODE_ENV'] === 'development',
  } satisfies DataSourceOptions;

  REDIS = {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379'),
    username: process.env['REDIS_USERNAME'] ?? '',
    password: process.env['REDIS_PASSWORD'] ?? '',
  };

  STORAGE = {
    accessKeyId: process.env['STORAGE_ACCESS_KEY'],
    secretAccessKey: process.env['STORAGE_SECRET_KEY'],
    endpoint: process.env['STORAGE_ENDPOINT'],
    bucket: process.env['STORAGE_BUCKET'],
  } satisfies S3Options;
}

export const configs = new ConfigService();
