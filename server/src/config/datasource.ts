import * as path from 'path';
import * as _ from 'lodash';
import { DataSource } from 'typeorm';
import LocalConfig from './config.local';
import ProdConfig from './config.prod';
import { isLocalEnv } from '../comm/env';

/**
 * TypeORM CLI 使用的数据源（pnpm migration:*）
 * 本地开发连接 config.local 的库，生产连接 config.prod 的库
 * 源码中（ts-node）加载 .ts，构建产物中加载 .js；订阅者依赖 Midway 容器，CLI 中不需要
 */
const config = isLocalEnv() ? LocalConfig : ProdConfig();
const ext = path.extname(__filename);

export default new DataSource({
  ..._.omit(config.typeorm.dataSource.default, ['entities', 'subscribers']),
  entities: [path.join(__dirname, `../modules/*/entity/**/*${ext}`)],
  migrations: [path.join(__dirname, `../migration/*${ext}`)],
});
