import { Inject, Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseSysRoleEntity } from '../../entity/sys/role';
import { BaseSysUserRoleEntity } from '../../entity/sys/user_role';
import * as _ from 'lodash';
import { BaseSysRoleMenuEntity } from '../../entity/sys/role_menu';
import { BaseSysRoleDepartmentEntity } from '../../entity/sys/role_department';
import { BaseSysPermsService, SUPER_ADMIN_ROLE_LABEL } from './perms';
import { Brackets } from 'typeorm';
import { parseIds } from '../../../../comm/ids';

/**
 * 角色
 */
@Provide()
export class BaseSysRoleService extends BaseService {
  @InjectEntityModel(BaseSysRoleEntity)
  baseSysRoleEntity: Repository<BaseSysRoleEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  baseSysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @InjectEntityModel(BaseSysRoleMenuEntity)
  baseSysRoleMenuEntity: Repository<BaseSysRoleMenuEntity>;

  @InjectEntityModel(BaseSysRoleDepartmentEntity)
  baseSysRoleDepartmentEntity: Repository<BaseSysRoleDepartmentEntity>;

  @Inject()
  baseSysPermsService: BaseSysPermsService;

  @Inject()
  ctx;

  /**
   * 根据用户ID获得所有用户角色
   * @param userId
   */
  async getByUser(userId: number): Promise<number[]> {
    const userRole = await this.baseSysUserRoleEntity.findBy({ userId });
    if (!_.isEmpty(userRole)) {
      return userRole.map(e => {
        return e.roleId;
      });
    }
    return [];
  }

  /**
   * 超管角色只能由初始化数据创建，不允许通过接口新增、修改、删除
   * @param data
   * @param type
   */
  async modifyBefore(data, type: 'delete' | 'update' | 'add') {
    if (type === 'delete') {
      const roles = await this.baseSysRoleEntity.findBy({
        id: In(parseIds(data)),
      });
      if (roles.some(e => e.label === SUPER_ADMIN_ROLE_LABEL)) {
        throw new CoolCommException('超管角色不允许删除');
      }
      return;
    }
    if (data.label === SUPER_ADMIN_ROLE_LABEL) {
      throw new CoolCommException('不能使用超管角色的标识');
    }
    if (type === 'update') {
      const role = await this.baseSysRoleEntity.findOneBy({ id: data.id });
      if (role?.label === SUPER_ADMIN_ROLE_LABEL) {
        throw new CoolCommException('超管角色不允许修改');
      }
    }
  }

  /**
   *
   * @param param
   */
  async modifyAfter(param) {
    if (param.id) {
      this.updatePerms(param.id, param.menuIdList, param.departmentIdList);
    }
  }

  /**
   * 更新权限
   * @param roleId
   * @param menuIdList
   * @param departmentIds
   */
  async updatePerms(roleId, menuIdList?, departmentIds = []) {
    // 更新菜单权限
    await this.baseSysRoleMenuEntity.delete({ roleId });
    await Promise.all(
      menuIdList.map(async e => {
        return await this.baseSysRoleMenuEntity.save({ roleId, menuId: e });
      })
    );
    // 更新部门权限
    await this.baseSysRoleDepartmentEntity.delete({ roleId });
    await Promise.all(
      departmentIds.map(async e => {
        return await this.baseSysRoleDepartmentEntity.save({
          roleId,
          departmentId: e,
        });
      })
    );
    // 刷新权限
    const userRoles = await this.baseSysUserRoleEntity.findBy({ roleId });
    for (const userRole of userRoles) {
      await this.baseSysPermsService.refreshPerms(userRole.userId);
    }
  }

  /**
   * 角色信息
   * @param id
   */
  async info(id) {
    const info = await this.baseSysRoleEntity.findOneBy({ id });
    if (info) {
      // 超管角色拥有全部菜单和部门
      const where =
        info.label === SUPER_ADMIN_ROLE_LABEL ? {} : { roleId: info.id };
      const menus = await this.baseSysRoleMenuEntity.findBy(where);
      const menuIdList = menus.map(e => {
        return parseInt(e.menuId + '');
      });
      const departments = await this.baseSysRoleDepartmentEntity.findBy(where);
      const departmentIdList = departments.map(e => {
        return parseInt(e.departmentId + '');
      });
      return {
        ...info,
        menuIdList,
        departmentIdList,
      };
    }
    return {};
  }

  async list() {
    return this.baseSysRoleEntity
      .createQueryBuilder('a')
      .where(
        new Brackets(qb => {
          // 超级管理员的角色不展示
          qb.where('a.label != :label', { label: SUPER_ADMIN_ROLE_LABEL });
          // 如果不是超管，只能看到自己新建的或者自己有的角色
          if (!this.ctx.admin.isSuperAdmin) {
            qb.andWhere('(a.userId=:userId or a.id in (:...roleId))', {
              userId: this.ctx.admin.userId,
              roleId: this.ctx.admin.roleIds,
            });
          }
        })
      )
      .getMany();
  }
}
