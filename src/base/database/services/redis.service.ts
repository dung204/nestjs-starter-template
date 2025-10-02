import { RedisClient } from 'bun';

import { Injectable, Logger } from '@nestjs/common';

import { configs } from '@/base/configs/config.service';

@Injectable()
export class RedisService {
  private readonly redis: RedisClient;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const { host, port, username, password } = configs.REDIS;
    this.redis = new RedisClient(`redis://${username}:${password}@${host}:${port}`);
  }

  async set(key: string, value: string, ttl?: number) {
    try {
      await this.redis.set(key, value);
      if (ttl) await this.redis.expire(key, ttl);
      this.logger.log(`String: Set key ${key} with value ${value}`);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  get(key: string, deleteAfterGet?: boolean) {
    try {
      this.logger.log(`String: Get key ${key}${deleteAfterGet ? ' then delete' : ''}`);
      if (deleteAfterGet) {
        return this.redis.getdel(key);
      }
      return this.redis.get(key);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async del(key: string) {
    try {
      this.logger.log(`String: Delete key ${key}`);
      return await this.redis.del(key);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
