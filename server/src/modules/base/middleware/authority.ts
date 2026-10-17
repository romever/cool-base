import { App, Config, Inject, Middleware } from '@midwayjs/core';
import * as _ from 'lodash';
import { CoolCommException, CoolUrlTagData, TagTypes } from '@cool-midway/core';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Context } from '@midwayjs/koa';
import {
  IMiddleware,
  IMidwayApplication,
  Init,
  InjectClient,
} from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { Utils } from '../../../comm/utils';

/**
 * 权限校验
 */
@Middleware()
export class BaseAuthorityMiddleware
  implements IMiddleware<Context, NextFunction>
{
  @Config('koa.globalPrefix')
  prefix;

  @Config('module.base')
  jwtConfig;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Inject()
  coolUrlTagData: CoolUrlTagData;

  @App()
  app: IMidwayApplication;

  @Inject()
  utils: Utils;

  ignoreUrls: string[] = [];

  @Init()
  async init() {
    this.ignoreUrls = this.coolUrlTagData.byKey(TagTypes.IGNORE_TOKEN, 'admin');
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const url = ctx.url.replace(this.prefix, '').split('?')[0];
      const adminUrl = '/admin/';
      // 只有 admin 前缀的路由需要权限校验
      if (!_.startsWith(url, adminUrl)) {
        await next();
        return;
      }

      // 1. 解析 token，免登录接口也会解析，便于接口内读取当前用户
      const token = ctx.get('Authorization');
      let tokenError: string;
      if (token) {
        try {
          ctx.admin = jwt.verify(token, this.jwtConfig.jwt.secret);
        } catch (err) {
          // 只处理 jwt 校验失败，其它异常继续抛出
          if (!(err instanceof jwt.JsonWebTokenError)) throw err;
          tokenError =
            err instanceof jwt.TokenExpiredError
              ? '登录已过期~'
              : '登录凭证无效~';
        }
      }

      // 2. 免登录接口直接放行
      const isIgnored = this.ignoreUrls.some(pattern =>
        this.utils.matchUrl(pattern, url)
      );
      if (isIgnored) {
        await next();
        return;
      }

      // 3. 校验会话：refreshToken 只能用于换取新 token；改密码、禁用、角色变更后会话失效
      if (!ctx.admin) {
        throw new CoolCommException(tokenError || '登录失效~', 401);
      }
      if (ctx.admin.isRefresh) {
        throw new CoolCommException('登录失效~', 401);
      }
      const { userId } = ctx.admin;
      const passwordV = await this.midwayCache.get(
        `admin:passwordVersion:${userId}`
      );
      if (passwordV != ctx.admin.passwordVersion) {
        throw new CoolCommException('登录失效~', 401);
      }
      const rToken = await this.midwayCache.get(`admin:token:${userId}`);
      if (!rToken || (this.jwtConfig.jwt.sso && rToken !== token)) {
        throw new CoolCommException('登录失效~', 401);
      }

      // 4. 校验接口权限：超管和登录即可访问的 comm 接口直接放行
      if (
        !ctx.admin.isSuperAdmin &&
        !new RegExp(`^${adminUrl}?.*/comm/`).test(url)
      ) {
        const perms: string[] = await this.midwayCache.get(
          `admin:perms:${userId}`
        );
        const permUrls = (perms || []).map(e => e.replace(/:/g, '/'));
        if (!permUrls.includes(url.replace(adminUrl, ''))) {
          throw new CoolCommException('无权限访问~', 403);
        }
      }
      await next();
    };
  }
}
