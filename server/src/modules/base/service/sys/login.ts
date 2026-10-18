import { Inject, Provide, Config, InjectClient } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { LoginDTO } from '../../dto/login';
import { v1 as uuid } from 'uuid';
import { BaseSysUserEntity } from '../../entity/sys/user';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { BaseSysRoleService } from './role';
import * as _ from 'lodash';
import { BaseSysMenuService } from './menu';
import { BaseSysDepartmentService } from './department';
import { BaseSysPermsService } from './perms';
import { verifyPassword } from '../../../../comm/password';
import * as jwt from 'jsonwebtoken';
import { Context } from '@midwayjs/koa';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { Utils } from '../../../../comm/utils';
import * as svgCaptcha from 'svg-captcha';

/**
 * 已吊销会话的缓存 key（退出登录、刷新 token 后旧会话写入）
 * @param sid 会话编号
 */
export const revokedSessionKey = (sid: string) =>
  `admin:session:revoked:${sid}`;

/**
 * 登录
 */
@Provide()
export class BaseSysLoginService extends BaseService {
  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @Inject()
  baseSysRoleService: BaseSysRoleService;

  @Inject()
  baseSysMenuService: BaseSysMenuService;

  @Inject()
  baseSysDepartmentService: BaseSysDepartmentService;

  @Inject()
  baseSysPermsService: BaseSysPermsService;

  @Inject()
  ctx: Context;

  @Inject()
  utils: Utils;

  @Config('module.base')
  coolConfig;

  /**
   * 登录
   * @param login
   */
  async login(login: LoginDTO) {
    const { username, captchaId, verifyCode, password } = login;
    // 校验失败次数，ctx.ip 只在开启 koa.proxy 时才信任代理头，避免伪造 IP 绕过锁定
    const { maxFail, lockTime } = this.coolConfig.loginLock;
    const failKey = `admin:login:fail:${username}:${this.ctx.ip}`;
    const failCount: number = (await this.midwayCache.get(failKey)) || 0;
    if (failCount >= maxFail) {
      throw new CoolCommException(
        `登录失败次数过多，请 ${Math.ceil(lockTime / 60)} 分钟后再试`
      );
    }
    // 校验验证码
    const checkV = await this.captchaCheck(captchaId, verifyCode);
    if (!checkV) {
      throw new CoolCommException('验证码不正确');
    }
    const user = await this.baseSysUserEntity.findOneBy({ username });
    // 校验用户状态及密码
    if (
      !user ||
      user.status === 0 ||
      !(await verifyPassword(password, user.password))
    ) {
      await this.midwayCache.set(failKey, failCount + 1, lockTime * 1000);
      throw new CoolCommException('账户或密码不正确~');
    }
    await this.midwayCache.del(failKey);
    return this.createSession(user);
  }

  /**
   * 建立登录会话：按用户当前的角色生成 token，并把权限、部门、token 写入缓存
   * @param user 用户
   */
  async createSession(user: BaseSysUserEntity) {
    const roleIds = await this.baseSysRoleService.getByUser(user.id);
    if (_.isEmpty(roleIds)) {
      throw new CoolCommException('该用户未设置任何角色，无法登录~');
    }
    // sid 标识本次登录会话，同一次登录的 token 和 refreshToken 共用，用于按会话吊销
    const payload = {
      sid: uuid(),
      roleIds,
      isSuperAdmin: await this.baseSysPermsService.isAdmin(roleIds),
      username: user.username,
      userId: user.id,
      passwordVersion: user.passwordV,
      tenantId: user['tenantId'],
    };

    const { expire, refreshExpire } = this.coolConfig.jwt.token;
    const result = {
      expire,
      token: this.generateToken(payload, expire),
      refreshExpire,
      refreshToken: this.generateToken(payload, refreshExpire, true),
    };

    // 将用户相关信息保存到缓存
    const perms = await this.baseSysMenuService.getPerms(roleIds);
    const departments = await this.baseSysDepartmentService.getByRoleIds(
      roleIds,
      payload.isSuperAdmin
    );
    await this.midwayCache.set(`admin:department:${user.id}`, departments);
    await this.midwayCache.set(`admin:perms:${user.id}`, perms);
    await this.midwayCache.set(`admin:token:${user.id}`, result.token);
    await this.midwayCache.set(
      `admin:passwordVersion:${user.id}`,
      user.passwordV
    );

    return result;
  }

  /**
   * 验证码
   * @param width 宽
   * @param height 高
   */
  async captcha(width = 150, height = 50, color = '#fff') {
    const svg = svgCaptcha.create({
      // ignoreChars: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
      width,
      height,
      noise: 3,
    });
    const result = {
      captchaId: uuid(),
      data: svg.data.replace(/"/g, "'"),
    };
    // 文字变白
    const rpList = [
      '#111',
      '#222',
      '#333',
      '#444',
      '#555',
      '#666',
      '#777',
      '#888',
      '#999',
    ];
    rpList.forEach(rp => {
      result.data = result.data['replaceAll'](rp, color);
    });

    // Convert SVG to base64
    const base64Data = Buffer.from(result.data).toString('base64');
    result.data = `data:image/svg+xml;base64,${base64Data}`;

    // 半小时过期
    await this.midwayCache.set(
      `verify:img:${result.captchaId}`,
      svg.text.toLowerCase(),
      1800 * 1000
    );
    return result;
  }

  /**
   * 退出登录：吊销当前会话，同一账号在其它设备上的登录不受影响
   */
  async logout() {
    await this.revokeSession(this.ctx.admin.sid);
  }

  /**
   * 吊销会话，记录保留到 refreshToken 的最长有效期
   * @param sid 会话编号
   */
  async revokeSession(sid: string) {
    const { refreshExpire } = this.coolConfig.jwt.token;
    await this.midwayCache.set(
      revokedSessionKey(sid),
      true,
      refreshExpire * 1000
    );
  }

  /**
   * 检验图片验证码
   * @param captchaId 验证码ID
   * @param value 验证码
   */
  async captchaCheck(captchaId, value) {
    const rv = await this.midwayCache.get(`verify:img:${captchaId}`);
    if (!rv || !value || value.toLowerCase() !== rv) {
      return false;
    } else {
      this.midwayCache.del(`verify:img:${captchaId}`);
      return true;
    }
  }

  /**
   * 生成token
   * @param payload token 内容
   * @param expire 过期时间（秒）
   * @param isRefresh 是否是刷新token
   */
  generateToken(payload: object, expire: number, isRefresh = false) {
    return jwt.sign({ ...payload, isRefresh }, this.coolConfig.jwt.secret, {
      expiresIn: expire,
    });
  }

  /**
   * 刷新token
   * @param token
   */
  async refreshToken(token: string) {
    let decoded;
    try {
      decoded = jwt.verify(token, this.coolConfig.jwt.secret);
    } catch (err) {
      // 只把 jwt 校验失败视为登录失效，其它异常继续抛出
      if (!(err instanceof jwt.JsonWebTokenError)) throw err;
      throw new CoolCommException('登录失效~', 401);
    }
    if (
      !decoded.isRefresh ||
      (await this.midwayCache.get(revokedSessionKey(decoded.sid)))
    ) {
      throw new CoolCommException('登录失效~', 401);
    }
    // 重新读取用户：禁用或改过密码后，旧的 refreshToken 不能再换取新 token
    const user = await this.baseSysUserEntity.findOneBy({
      id: decoded.userId,
    });
    if (
      !user ||
      user.status === 0 ||
      user.passwordV !== decoded.passwordVersion
    ) {
      throw new CoolCommException('登录失效~', 401);
    }
    // 轮换：换出新会话后吊销旧会话，旧 refreshToken 不能重复使用
    const result = await this.createSession(user);
    await this.revokeSession(decoded.sid);
    return result;
  }
}
