import { CoolConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';
import { entities } from '../entities';
import { TenantSubscriber } from '../modules/base/db/tenant';
import { requireEnv } from '../comm/env';

/**
 * 生产环境 npm run start 读取的配置文件
 * 写成函数是为了只在生产环境执行，敏感配置从环境变量读取
 */
export default (): MidwayConfig => ({
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: requireEnv('DB_HOST'),
        port: Number(requireEnv('DB_PORT')),
        username: requireEnv('DB_USERNAME'),
        password: requireEnv('DB_PASSWORD'),
        database: requireEnv('DB_DATABASE'),
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: false,
        // 打印日志
        logging: false,
        // 字符集
        charset: 'utf8mb4',
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities,
        // 订阅者
        subscribers: [TenantSubscriber],
      },
    },
  },
  cool: {
    // 实体与路径，跟生成代码、前端请求、swagger文档相关 注意：线上不建议开启，以免暴露敏感信息
    eps: false,
    // 是否自动导入模块数据库
    initDB: false,
    // 判断是否初始化的方式
    initJudge: 'db',
    // 关闭框架自带的一次性菜单导入，菜单由 base 模块在每次启动时按 key 同步（service/sys/menu_sync.ts）
    initMenu: false,
  } as CoolConfig,
});
