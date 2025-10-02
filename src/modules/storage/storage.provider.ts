import { Provider } from '@nestjs/common';
import { S3Client } from 'bun';

import { configs } from '@/base/configs';

export const STORAGE = 'STORAGE';

export const StorageProvider: Provider = {
  provide: STORAGE,
  useFactory: () => new S3Client(configs.STORAGE),
};
