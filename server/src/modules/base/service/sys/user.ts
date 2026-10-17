import { Inject, InjectClient, Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, In, Repository } from 'typeorm';
import { BaseSysUserEntity } from '../../entity/sys/user';
import { BaseSysPermsService, SUPER_ADMIN_ROLE_LABEL } from './perms';
import * as _ from 'lodash';
import { BaseSysUserRoleEntity } from '../../entity/sys/user_role';
import { BaseSysDepartmentEntity } from '../../entity/sys/department';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { BaseSysRoleEntity } from '../../entity/sys/role';
import { hashPassword, verifyPassword } from '../../../../comm/password';

/**
 * 系统用户
 */
@Provide()
export class BaseSysUserService extends BaseService {
  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  baseSysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @InjectEntityModel(BaseSysDepartmentEntity)
  baseSysDepartmentEntity: Repository<BaseSysDepartmentEntity>;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Inject()
  baseSysPermsService: BaseSysPermsService;

  @Inject()
  ctx;

  /**
   * 分页查询
   * @param query
   */
  async page(query) {
    const { keyWord, status, departmentIds = [] } = query;
    const userId = this.ctx.admin.userId;
    const permsDepartmentArr = await this.baseSysPermsService.departmentIds(
      userId
    ); // 部门权限
    const sql = `
        SELECT
            a.id,a.name,a.nickName,a.headImg,a.email,a.remark,a.status,a.createTime,a.updateTime,a.username,a.phone,a.departmentId,
            b.name as "departmentName"
        FROM
            base_sys_user a
            LEFT JOIN base_sys_department b on a.departmentId = b.id
        WHERE 1 = 1
            ${this.setSql(
              !_.isEmpty(departmentIds),
              'and a.departmentId in (?)',
              [departmentIds]
            )}
            ${this.setSql(status, 'and a.status = ?', [status])}
            ${this.setSql(keyWord, 'and (a.name LIKE ? or a.username LIKE ?)', [
              `%${keyWord}%`,
              `%${keyWord}%`,
            ])}
            ${this.setSql(
              true,
              'and a.id not in (select ur.userId from base_sys_user_role ur inner join base_sys_role r on ur.roleId = r.id where r.label = ?)',
              [SUPER_ADMIN_ROLE_LABEL]
            )}
            ${this.setSql(
              !this.ctx.admin.isSuperAdmin,
              `and (a.departmentId in (?) or a.userId = ${userId})`,
              [!_.isEmpty(permsDepartmentArr) ? permsDepartmentArr : [null]]
            )} `;
    const result = await this.sqlRenderPage(sql, query);
    // 匹配角色
    if (!_.isEmpty(result.list)) {
      const userIds = result.list.map(e => e.id);
      const roles: BaseSysRoleEntity[] = await this.nativeQuery(
        'SELECT b.name, a.userId FROM base_sys_user_role a LEFT JOIN base_sys_role b ON a.roleId = b.id WHERE a.userId in (?) ',
        [userIds]
      );
      result.list.forEach(e => {
        const arr = roles.filter(a => a.userId == e.id);

        e['roleIds'] = arr.map(a => a.userId);
        e['roleName'] = arr.map(a => a.name).join(',');
      });
    }
    return result;
  }

  /**
   * 移动部门
   * @param departmentId
   * @param userIds
   */
  async move(departmentId, userIds) {
    await this.baseSysUserEntity.update({ id: In(userIds) }, { departmentId });
  }

  /**
   * 获得个人信息
   */
  async person(userId) {
    const info = await this.baseSysUserEntity.findOneBy({
      id: Equal(userId),
    });
    delete info?.password;
    return info;
  }

  /**
   * 更新用户角色关系
   * @param user
   */
  async updateUserRole(user) {
    if (_.isEmpty(user.roleIdList)) {
      return;
    }
    await this.baseSysUserRoleEntity.delete({ userId: user.id });
    if (user.roleIdList) {
      for (const roleId of user.roleIdList) {
        await this.baseSysUserRoleEntity.save({ userId: user.id, roleId });
      }
    }
    await this.baseSysPermsService.refreshPerms(user.id);
  }

  /**
   * 超管用户不允许通过用户管理修改，超管角色不允许分配给其他用户
   * @param param
   */
  async checkSuperAdmin(param) {
    if (param.id && (await this.baseSysPermsService.isAdminUser(param.id))) {
      throw new CoolCommException('超管用户不允许修改');
    }
    if (
      !_.isEmpty(param.roleIdList) &&
      (await this.baseSysPermsService.isAdmin(param.roleIdList))
    ) {
      throw new CoolCommException('不能分配超管角色');
    }
  }

  /**
   * 删除前校验：超管用户不允许删除
   * @param data
   * @param type
   */
  async modifyBefore(data, type: 'delete' | 'update' | 'add') {
    if (type !== 'delete') return;
    for (const userId of data) {
      if (await this.baseSysPermsService.isAdminUser(userId)) {
        throw new CoolCommException('超管用户不允许删除');
      }
    }
  }

  /**
   * 新增
   * @param param
   */
  async add(param) {
    await this.checkSuperAdmin(param);
    const exists = await this.baseSysUserEntity.findOneBy({
      username: param.username,
    });
    if (!_.isEmpty(exists)) {
      throw new CoolCommException('用户名已经存在~');
    }
    param.password = await hashPassword(param.password);
    await super.add(param);
    await this.updateUserRole(param);
    return param.id;
  }

  /**
   * 根据ID获得信息
   * @param id
   */
  public async info(id) {
    const info = await this.baseSysUserEntity.findOneBy({ id });
    const userRoles = await this.nativeQuery(
      'select a.roleId from base_sys_user_role a where a.userId = ?',
      [id]
    );
    const department = await this.baseSysDepartmentEntity.findOneBy({
      id: info.departmentId,
    });
    if (info) {
      delete info.password;
      if (userRoles) {
        info.roleIdList = userRoles.map(e => {
          return parseInt(e.roleId);
        });
      }
    }
    delete info.password;
    if (department) {
      info.departmentName = department.name;
    }
    return info;
  }

  /**
   * 修改个人信息
   * @param param
   */
  public async personUpdate(param) {
    param.id = this.ctx.admin.userId;
    if (!_.isEmpty(param.password)) {
      const userInfo = await this.baseSysUserEntity.findOneBy({ id: param.id });
      if (!userInfo) {
        throw new CoolCommException('用户不存在');
      }
      if (!(await verifyPassword(param.oldPassword, userInfo.password))) {
        throw new CoolCommException('原密码错误');
      }
      param.password = await hashPassword(param.password);
      param.passwordV = userInfo.passwordV + 1;
      await this.midwayCache.set(
        `admin:passwordVersion:${param.id}`,
        param.passwordV
      );
    } else {
      delete param.password;
    }
    await this.baseSysUserEntity.save(param);
  }

  /**
   * 修改
   * @param param 数据
   */
  async update(param) {
    await this.checkSuperAdmin(param);
    if (!_.isEmpty(param.password)) {
      param.password = await hashPassword(param.password);
      const userInfo = await this.baseSysUserEntity.findOneBy({ id: param.id });
      if (!userInfo) {
        throw new CoolCommException('用户不存在');
      }
      param.passwordV = userInfo.passwordV + 1;
      await this.midwayCache.set(
        `admin:passwordVersion:${param.id}`,
        param.passwordV
      );
    } else {
      delete param.password;
    }
    if (param.status === 0) {
      await this.forbidden(param.id);
    }
    await this.baseSysUserEntity.save(param);
    await this.updateUserRole(param);
  }

  /**
   * 禁用用户
   * @param userId
   */
  async forbidden(userId) {
    await this.midwayCache.del(`admin:token:${userId}`);
  }
}
