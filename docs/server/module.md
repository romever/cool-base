# 后端模块开发

业务按模块组织，一个模块一个目录：`server/src/modules/<模块名>/`。

## 目录结构

```
modules/shop/
├── controller/
│   ├── admin/        后台接口，路由前缀 /admin/shop/...，需要登录和权限
│   ├── app/          App/小程序接口，路由前缀 /app/shop/...，需要用户登录
│   └── open/         （可选）免登录接口
├── entity/           实体，见 entity.md
├── service/          业务逻辑，见 service.md
├── dto/              （可选）参数校验
├── middleware/       （可选）模块中间件
├── event/            （可选）事件监听，见 event.md
├── queue/            （可选）队列，见 task.md
├── schedule/ 或 job/ （可选）定时任务，见 task.md
├── config.ts         必须，模块配置
├── db.json           （可选）模块初始化数据
└── menu.json         （可选）模块初始化菜单
```

最小可用的模块只需要 `config.ts` + `entity` + `controller`。Service 只有在需要写业务逻辑或重写 CRUD 时才建。

## config.ts

```ts
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 必须，模块名称
    name: '商城',
    // 必须，模块描述
    description: '商品、订单管理',
    // 只对本模块生效的中间件
    middlewares: [],
    // 全局生效的中间件
    globalMiddlewares: [],
    // 加载顺序，值越大越先加载
    order: 0,
    // 以下可以放模块自己的配置项
    pay: { appId: 'xxx' },
  } as ModuleConfig;
};
```

在模块代码中读取配置：

```ts
@Config('module.shop')
shopConfig;
```

## db.json：初始化数据

启动时会把 `db.json` 中的数据导入对应的表，key 是表名。

```json
{
  "dict_type": [
    {
      "name": "商品类型",
      "key": "goodsType",
      "@childDatas": {
        "dict_info": [
          { "typeId": "@id", "name": "实物", "value": "0", "orderNum": 1 },
          { "typeId": "@id", "name": "虚拟", "value": "1", "orderNum": 2 }
        ]
      }
    }
  ]
}
```

- `@childDatas`：先插入父级记录，再插入其中的子表数据。
- `@id`：替换成刚插入的父级记录的 id。

## menu.json：初始化菜单

菜单数据不用手写：在管理后台「系统管理 / 菜单列表」里配好后，用导出功能生成，再放到模块的 `menu.json`。格式参考 `server/src/modules/base/menu.json`。

菜单字段说明：

| 字段 | 说明 |
| --- | --- |
| `type` | 0 目录，1 菜单，2 权限 |
| `router` | 前端路由，例如 `/shop/goods` |
| `viewPath` | 前端页面文件，相对 `admin/src`，例如 `modules/shop/views/goods.vue` |
| `perms` | 权限标识，多个用逗号隔开，格式 `模块:实体:方法`，例如 `shop:goods:page,shop:goods:add` |
| `childMenus` | 子菜单 |

## 初始化机制

相关配置在 `server/src/config/config.local.ts` 的 `cool` 下：

| 配置 | 说明 |
| --- | --- |
| `initDB` | 是否自动导入各模块的 `db.json` |
| `initMenu` | 是否自动导入各模块的 `menu.json` |
| `initJudge` | 判断是否已导入过的方式。`db`：记录在 `base_sys_conf` 表，key 为 `init_db_<模块>`、`init_menu_<模块>`；`file`：在 `server/` 下生成 `lock/db/<模块>.db.lock`、`lock/menu/<模块>.menu.lock` |

每个模块只导入一次。想重新导入，删除对应的记录或 lock 文件后重启。

生产环境不要开启自动导入和 `synchronize`，表结构和初始数据通过本地导出、线上导入的方式同步。
