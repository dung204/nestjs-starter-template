import { DataSource } from 'typeorm';

import { configs } from './config.service';

// biome-ignore lint/style/noDefaultExport: default export here is required for TypeORM
export default new DataSource(configs.POSTGRES);
