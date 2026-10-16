import { Config, ILogger, Middleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { IMiddleware, Inject } from '@midwayjs/core';
import { BaseTranslateService } from '../service/translate';
import * as _ from 'lodash';
import { RESCODE } from '@cool-midway/core';
/**
 * 翻译中间件
 */
@Middleware()
export class BaseTranslateMiddleware
  implements IMiddleware<Context, NextFunction>
{
  @Inject()
  baseTranslateService: BaseTranslateService;

  @Inject()
  logger: ILogger;

  @Config('cool.i18n')
  config: {
    /** 是否开启 */
    enable: boolean;
    /** 语言 */
    languages: string[];
    /** 翻译服务 */
    serviceUrl?: string;
  };

  resolve() {
    return async (ctx, next: NextFunction) => {
      const url = ctx.url;
      const language = ctx.get('language');
      let data;
      try {
        data = await next();
      } catch (error) {
        this.logger.error(error);
        // 处理翻译消息
        if (error.name == 'CoolCommException') {
          if (error.message && error.message !== 'success') {
            ctx.status = error.statusCode || 200;
            ctx.body = {
              code: RESCODE.COMMFAIL,
              message: await this.baseTranslateService.translate(
                'msg',
                language,
                error.message
              ),
            };
            return;
          }
        }
        ctx.status = 200;
        ctx.body = {
          code: RESCODE.COMMFAIL,
          message: error.message,
        };
        return;
      }
      if (!this.config.enable) {
        return;
      }
      // 处理菜单翻译
      if (url == '/admin/base/comm/permmenu') {
        for (const menu of data.data.menus) {
          if (menu.name) {
            menu.name = await this.baseTranslateService.translate(
              'menu',
              language,
              menu.name
            );
          }
        }
      }
      if (url == '/admin/base/sys/menu/list') {
        for (const menu of data.data) {
          if (menu.name) {
            menu.name = await this.baseTranslateService.translate(
              'menu',
              language,
              menu.name
            );
          }
        }
      }
    };
  }
}
