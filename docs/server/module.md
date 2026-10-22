# 后端模块开发

业务按模块组织，一个模块一个目录：`server/src/modules/<模块名>/`。

## 目录结构

```
modules/shop/
├── controller/
│   ├── admin/        后台接口，路由前缀 /admin/shop/...，需要登录和权限
│   └── open/         （可选）免登录接口，如第三方回调
├── entity/           实体，见 entity.md
├── service/          业务逻辑，见 service.md
├── dto/              （可选）参数校验
├── middleware/       （可选）模块中间件
├── event/            （可选）事件监听，见 event.md
├── schedule/ 或 job/ （可选）定时任务，见 task.md
├── worker/           （可选）worker 进程的执行逻辑，见 worker.md
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

启动时会把 `db.json` 中的数据导入对应的表，key 是表名。只用于后台自己的表（`default` 数据源），C 端的数据不通过这里初始化。

```json
{
  "report_group": [
    {
      "name": "运营报表",
      "@childDatas": {
        "report_item": [
          { "groupId": "@id", "name": "日活", "orderNum": 1 },
          { "groupId": "@id", "name": "留存", "orderNum": 2 }
        ]
      }
    }
  ]
}
```

- `@childDatas`：先插入父级记录，再插入其中的子表数据。
- `@id`：替换成刚插入的父级记录的 id。

## menu.json：菜单与权限点

**菜单和权限点由代码定义**：每个模块的 `menu.json` 是该模块菜单的唯一来源。服务每次启动时，`base` 模块会把所有模块的 `menu.json` 同步到 `base_sys_menu` 表（`server/src/modules/base/service/sys/menu_sync.ts`）。数据库里只需要维护"哪个角色拥有哪些菜单和权限点"。

```json
[
  {
    "key": "report",
    "name": "报表",
    "type": 0,
    "icon": "icon-data",
    "orderNum": 10,
    "childMenus": [
      {
        "key": "report.daily",
        "name": "日报",
        "type": 1,
        "router": "/report/daily",
        "viewPath": "modules/report/views/daily.vue",
        "childMenus": [
          { "key": "report.daily.query", "name": "查询", "type": 2, "perms": "report:daily:page,report:daily:info" },
          { "key": "report.daily.export", "name": "导出", "type": 2, "perms": "report:daily:export" }
        ]
      }
    ]
  }
]
```

| 字段 | 说明 |
| --- | --- |
| `key` | **必填**，稳定标识，所有模块中唯一。格式 `模块.功能[.子功能].操作`。上线后不要修改，修改等于删除旧菜单、新增一个菜单，角色的勾选会丢失 |
| `name` | 名称 |
| `type` | 0 目录，1 菜单，2 权限点 |
| `router` | 前端路由，例如 `/report/daily`。菜单必填 |
| `viewPath` | 前端页面文件，相对 `admin/src`，例如 `modules/report/views/daily.vue`；也可以是 `http` 开头的外链。菜单必填 |
| `perms` | 权限点对应的接口，多个用逗号隔开，格式 `模块:实体:方法`，例如 `report:daily:page`。权限点必填 |
| `icon`、`orderNum`、`isShow`、`keepAlive` | 图标、排序、是否显示、是否缓存 |
| `childMenus` | 下级节点 |

同步规则：
- **按 `key` 新增或更新**，以 `menu.json` 为准覆盖数据库中的值。已存在的菜单 id 不变，所以角色已经勾选的权限不受影响。
- **`menu.json` 中删掉的节点会从数据库删除**，连同角色的勾选，以及挂在它下面的手动菜单。
- **启动时校验**：key 缺失或重复、菜单缺少 `router`/`viewPath`、权限点缺少 `perms`、JSON 格式错误，都会直接报错并列出具体位置，服务不会带着错误的菜单启动。
- 在后台界面里手动添加的菜单（没有 key）不受同步影响，适合运营临时添加的外链等入口。

代码定义的菜单在后台「菜单列表」中**只读**，修改它要改 `menu.json` 后重启或发版。

**开发流程**：
1. 新增页面或接口时，在模块的 `menu.json` 里加上对应的菜单和权限点，重启后端即生效。
2. 也可以先在本地后台用「快速创建」「自动添加权限」配好，再用「导出」得到 JSON。导出时手动菜单的 `key` 为空字符串，放进 `menu.json` 前要补全。
3. 发版后，在生产后台给角色勾选新的权限点。

## db.json 的初始化机制

相关配置在 `server/src/config/config.local.ts` 的 `cool` 下：

| 配置 | 说明 |
| --- | --- |
| `initDB` | 是否自动导入各模块的 `db.json` |
| `initJudge` | 判断是否已导入过的方式。`db`：记录在 `base_sys_conf` 表，key 为 `init_db_<模块>`；`file`：在 `server/` 下生成 `lock/db/<模块>.db.lock` |
| `initMenu` | 框架自带的一次性菜单导入，固定为 `false`，菜单改由上面的同步机制负责 |

`db.json` 每个模块只导入一次。想重新导入，删除对应的记录或 lock 文件后重启。

本地和生产都开启 `initDB`：表结构由迁移在启动前建好，`db.json` 在首次启动时导入一次。表结构变更见 `entity.md`「表结构变更」。
