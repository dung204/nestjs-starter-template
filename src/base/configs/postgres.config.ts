import { DataSource } from 'typeorm';

import { configs } from './config.service';

export default new DataSource(configs.POSTGRES);
