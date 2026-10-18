import { BaseLogMiddleware } from './middleware/log';
import { BaseAuthorityMiddleware } from './middleware/authority';
import { ModuleConfig } from '@cool-midway/core';
import { BaseTranslateMiddleware } from './middleware/translate';
import { isDevEnv, requireEnv } from '../../comm/env';

/**
 * 模块的配置
 */
export default () => {
  return {
    // 模块名称
    name: '权限管理',
    // 模块描述
    description: '基础的权限管理功能，包括登录，权限校验',
    // 中间件
    globalMiddlewares: [
      BaseTranslateMiddleware,
      BaseAuthorityMiddleware,
      BaseLogMiddleware,
    ],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 10,
    // 登录失败锁定：同一账号在同一 IP 连续失败 maxFail 次后，锁定 lockTime 秒
    loginLock: {
      maxFail: 5,
      lockTime: 15 * 60,
    },
    // jwt 生成解密token的
    jwt: {
      // 单点登录
      sso: false,
      // 开发环境使用固定密钥，其它环境必须通过环境变量 JWT_SECRET 提供
      secret: isDevEnv() ? 'cool-admin-local-secret' : requireEnv('JWT_SECRET'),
      // token
      token: {
        // 2小时过期，需要用刷新token
        expire: 2 * 3600,
        // 15天内，如果没操作过就需要重新登录
        refreshExpire: 24 * 3600 * 15,
      },
    },
  } as ModuleConfig;
};
