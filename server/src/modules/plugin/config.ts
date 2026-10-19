import { ModuleConfig } from '@cool-midway/core';
import { isDevEnv, requireEnv } from '../../comm/env';

/**
 * 模块配置
 */
export default options => {
  return {
    // 模块名称
    name: '插件模块',
    // 模块描述
    description: '插件查看、安装、卸载、配置等',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 基础插件配置
    hooks: {
      // 文件上传
      upload: {
        // 上传文件访问地址的前缀，返回给前端的地址为 `${domain}/upload/...`
        // 开发环境直连本机后端，其它环境必须通过环境变量 UPLOAD_DOMAIN 提供后端的对外地址
        domain: isDevEnv()
          ? `http://127.0.0.1:${options?.app?.getConfig('koa.port')}`
          : requireEnv('UPLOAD_DOMAIN'),
      },
    },
  } as ModuleConfig;
};
