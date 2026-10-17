import { Middleware } from '@midwayjs/core';
import * as _ from 'lodash';
import { NextFunction, Context } from '@midwayjs/koa';
import { IMiddleware } from '@midwayjs/core';
import { BaseSysLogService } from '../service/sys/log';

/**
 * 日志中间件
 */
@Middleware()
export class BaseLogMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const baseSysLogService = await ctx.requestContext.getAsync(
        BaseSysLogService
      );
      // 日志异步写入，不阻塞请求；写入失败只记录错误，不影响业务
      baseSysLogService
        .record(
          ctx,
          ctx.url,
          ctx.req.method === 'GET' ? ctx.request.query : ctx.request.body,
          ctx.admin ? ctx.admin.userId : null
        )
        .catch(err => ctx.logger.error('记录请求日志失败', err));
      await next();
    };
  }
}
