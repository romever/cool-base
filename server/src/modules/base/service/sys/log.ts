import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as _ from 'lodash';
import { BaseSysLogEntity } from '../../entity/sys/log';
import * as moment from 'moment';
import { Utils } from '../../../../comm/utils';
import { BaseSysConfService } from './conf';
import { Context } from '@midwayjs/koa';

/**
 * 写入日志前需要脱敏的字段名（不区分大小写），新增敏感字段时加到这里
 */
const SENSITIVE_FIELDS = ['password', 'oldpassword', 'token', 'refreshtoken'];

/**
 * 描述
 */
@Provide()
export class BaseSysLogService extends BaseService {
  @Inject()
  ctx;

  @Inject()
  utils: Utils;

  @InjectEntityModel(BaseSysLogEntity)
  baseSysLogEntity: Repository<BaseSysLogEntity>;

  @Inject()
  baseSysConfService: BaseSysConfService;

  /**
   * 记录
   * @param url URL地址
   * @param params 参数
   * @param userId 用户ID
   */
  async record(context: Context, url, params, userId) {
    const ip = await this.utils.getReqIP(context);
    const sysLog = new BaseSysLogEntity();
    sysLog.userId = userId;
    sysLog.ip = typeof ip === 'string' ? ip : ip.join(',');
    sysLog.action = url.split('?')[0];
    sysLog.params = this.maskSensitive(params);
    await this.baseSysLogEntity.insert(sysLog);
  }

  /**
   * 递归把敏感字段的值替换为 ***
   * @param value 请求参数
   */
  maskSensitive(value) {
    if (_.isArray(value)) {
      return value.map(e => this.maskSensitive(e));
    }
    if (_.isPlainObject(value)) {
      return _.mapValues(value, (v, k) =>
        SENSITIVE_FIELDS.includes(k.toLowerCase())
          ? '***'
          : this.maskSensitive(v)
      );
    }
    return value;
  }

  /**
   * 日志
   * @param isAll 是否清除全部
   */
  async clear(isAll?) {
    if (isAll) {
      await this.baseSysLogEntity.clear();
      return;
    }
    const keepDay = await this.baseSysConfService.getValue('logKeep');
    if (keepDay) {
      const beforeDate = moment().add(-keepDay, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
      await this.baseSysLogEntity.createQueryBuilder().delete().where('createTime < :beforeDate', { beforeDate }).execute();
    } else {
      await this.baseSysLogEntity.clear();
    }
  }
}
