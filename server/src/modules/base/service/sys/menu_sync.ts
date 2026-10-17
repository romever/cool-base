import {
  App,
  ILogger,
  IMidwayApplication,
  Inject,
  InjectClient,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { EntityManager, In, IsNull, Not, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { BaseSysMenuEntity } from '../../entity/sys/menu';
import { BaseSysRoleMenuEntity } from '../../entity/sys/role_menu';
import { BaseSysUserRoleEntity } from '../../entity/sys/user_role';
import { BaseSysMenuService } from './menu';
import { BaseSysRoleService } from './role';

/**
 * menu.json 中的菜单节点
 */
interface MenuNode {
  key: string;
  name: string;
  type: number;
  router?: string;
  perms?: string;
  icon?: string;
  orderNum?: number;
  viewPath?: string;
  keepAlive?: boolean;
  isShow?: boolean;
  childMenus?: MenuNode[];
}

/**
 * 由代码同步的字段，同步时以 menu.json 为准覆盖
 */
const SYNC_FIELDS = [
  'name',
  'type',
  'router',
  'perms',
  'icon',
  'orderNum',
  'viewPath',
  'keepAlive',
  'isShow',
];

/**
 * 菜单同步：把各模块 menu.json 定义的菜单同步到数据库
 * - 按 key 新增或更新，id 保持不变，角色已勾选的权限不受影响
 * - 代码中已删除的菜单从数据库删除，连同角色关联和挂在其下的手动菜单
 * - 没有 key 的手动菜单不处理
 * - 每个进程启动时都会执行，多实例并发执行结果一致
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class BaseSysMenuSyncService {
  @App()
  app: IMidwayApplication;

  @Logger()
  logger: ILogger;

  @InjectEntityModel(BaseSysMenuEntity)
  baseSysMenuEntity: Repository<BaseSysMenuEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  baseSysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Inject()
  baseSysMenuService: BaseSysMenuService;

  @Inject()
  baseSysRoleService: BaseSysRoleService;

  async sync() {
    const modules = this.readMenus();
    const result = { added: 0, updated: 0, removed: 0 };

    await this.baseSysMenuEntity.manager.transaction(async manager => {
      const existRows = await manager.findBy(BaseSysMenuEntity, {
        key: Not(IsNull()),
      });
      const existMap = new Map(existRows.map(e => [e.key, e]));
      const seen = new Set<string>();

      // 按 key 新增或更新，父级先于子级保存
      const save = async (nodes: MenuNode[], parentId: number | null) => {
        for (const node of nodes) {
          seen.add(node.key);
          const data: any = { ..._.pick(node, SYNC_FIELDS), parentId };
          const exist = existMap.get(node.key);
          let id: number;
          if (exist) {
            id = exist.id;
            if (this.isChanged(exist, data)) {
              await manager.update(BaseSysMenuEntity, id, data);
              result.updated++;
            }
          } else {
            // 多个实例同时启动时可能并发插入同一个 key，用 upsert 保证不冲突
            await manager.upsert(
              BaseSysMenuEntity,
              { ...data, key: node.key },
              ['key']
            );
            id = (await manager.findOneBy(BaseSysMenuEntity, { key: node.key })).id;
            result.added++;
          }
          await save(node.childMenus || [], id);
        }
      };
      for (const nodes of Object.values(modules)) {
        await save(nodes, null);
      }

      // 删除代码中已不存在的菜单
      const removedIds = existRows.filter(e => !seen.has(e.key)).map(e => e.id);
      if (removedIds.length > 0) {
        const ids = await this.withDescendants(manager, removedIds);
        await manager.delete(BaseSysRoleMenuEntity, { menuId: In(ids) });
        await manager.delete(BaseSysMenuEntity, { id: In(ids) });
        result.removed = ids.length;
      }
    });

    if (result.added || result.updated || result.removed) {
      await this.refreshPermsCache();
    }
    this.logger.info(
      `[base:menu] 菜单同步完成：新增 ${result.added}，更新 ${result.updated}，删除 ${result.removed}`
    );
  }

  /**
   * 读取并校验所有模块的 menu.json，任何错误都直接抛出，阻止带着错误的菜单启动
   */
  private readMenus(): Record<string, MenuNode[]> {
    const modulesDir = path.join(this.app.getBaseDir(), 'modules');
    const result: Record<string, MenuNode[]> = {};
    const keys = new Map<string, string>();
    const errors: string[] = [];

    const check = (node: MenuNode, module: string, trail: string) => {
      const where = `${module}/menu.json「${trail}」`;
      if (!node.key || typeof node.key !== 'string') {
        errors.push(`${where}缺少 key`);
      } else if (keys.has(node.key)) {
        errors.push(`${where}的 key「${node.key}」与 ${keys.get(node.key)} 重复`);
      } else {
        keys.set(node.key, where);
      }
      if (!node.name) errors.push(`${where}缺少 name`);
      if (![0, 1, 2].includes(node.type)) {
        errors.push(`${where}的 type 只能是 0 目录、1 菜单、2 权限`);
      }
      if (node.type === 1 && (!node.router || !node.viewPath)) {
        errors.push(`${where}是菜单，必须有 router 和 viewPath`);
      }
      if (node.type === 2 && !node.perms) {
        errors.push(`${where}是权限，必须有 perms`);
      }
      for (const child of node.childMenus || []) {
        check(child, module, `${trail} / ${child.name}`);
      }
    };

    for (const module of fs.readdirSync(modulesDir)) {
      const file = path.join(modulesDir, module, 'menu.json');
      if (!fs.existsSync(file)) continue;
      let nodes: MenuNode[];
      try {
        nodes = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (err) {
        errors.push(`${module}/menu.json 不是合法的 JSON：${err.message}`);
        continue;
      }
      if (!Array.isArray(nodes)) {
        errors.push(`${module}/menu.json 顶层必须是数组`);
        continue;
      }
      nodes.forEach(node => check(node, module, node.name));
      result[module] = nodes;
    }

    if (errors.length > 0) {
      throw new CoolCommException(`菜单定义有误：\n${errors.join('\n')}`);
    }
    return result;
  }

  /**
   * 数据库中的值与代码不同才更新，避免每次启动都改写所有行
   */
  private isChanged(exist: BaseSysMenuEntity, data: any) {
    return Object.keys(data).some(
      k => (exist[k] ?? null) !== (data[k] ?? null)
    );
  }

  /**
   * 找出菜单及其全部下级（包括挂在下面的手动菜单）
   */
  private async withDescendants(manager: EntityManager, ids: number[]) {
    const all = await manager.find(BaseSysMenuEntity, {
      select: ['id', 'parentId'],
    });
    const result = new Set(ids);
    let added = true;
    while (added) {
      added = false;
      for (const menu of all) {
        if (!result.has(menu.id) && result.has(menu.parentId)) {
          result.add(menu.id);
          added = true;
        }
      }
    }
    return [...result];
  }

  /**
   * 刷新已登录管理员的权限缓存
   * 只更新 perms，不删除 token，发版不会让管理员掉线
   */
  private async refreshPermsCache() {
    const userIds = _.uniq(
      (await this.baseSysUserRoleEntity.find({ select: ['userId'] })).map(
        e => e.userId
      )
    );
    for (const userId of userIds) {
      const roleIds = await this.baseSysRoleService.getByUser(userId);
      const perms = await this.baseSysMenuService.getPerms(roleIds);
      await this.midwayCache.set(`admin:perms:${userId}`, perms);
    }
  }
}
