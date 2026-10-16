# server/AGENTS.md

后端：Midway.js 3 + Koa + TypeORM 0.3.20（`@cool-midway/typeorm` 分支）+ `@cool-midway/core` 8.x。支持 MySQL / PostgreSQL / SQLite，默认 MySQL。

## 目录

```
server/
├── src/
│   ├── comm/                 通用工具
│   ├── config/
│   │   ├── config.default.ts 所有环境生效
│   │   ├── config.local.ts   本地开发（pnpm dev）
│   │   └── config.prod.ts    生产（pnpm start）
│   ├── configuration.ts      Midway 组件注册
│   └── modules/<模块>/       业务模块，结构见 docs/server/module.md
├── public/                   静态资源、上传文件
├── .vscode/*.code-snippets   代码片段（controller、entity、service 等关键字）
└── bootstrap.js              生产启动入口
```

## 硬性规则

**导入**
- 装饰器从 `@midwayjs/core` 导入，`@midwayjs/decorator` 已废弃。
- 实体仓库用 `@midwayjs/typeorm` 的 `InjectEntityModel`，`@midwayjs/orm` 已废弃。

**Entity**
- 必须继承 `src/modules/base/entity/base.ts` 的 `BaseEntity`（自带 `id`、`createTime`、`updateTime`、`tenantId`），不要再从 `@cool-midway/core` 导入。导入路径按文件所在层级写相对路径：`modules/<模块>/entity/xxx.ts` 中是 `../../base/entity/base`。
- 禁止使用 `@ManyToOne`、`@OneToMany`、`@ManyToMany` 等外键关系，关联靠 `xxxId` 字段加查询时 join。
- 表名格式为 `模块_表`，类名格式为 `模块 + 表 + Entity`，例如 `@Entity('shop_goods')` 对应 `ShopGoodsEntity`。
- 字段用驼峰命名，例如 `studentNo`。枚举、状态字段用 `dict` 声明可选项，不要只写在 comment 里（见 `docs/server/entity.md`）。

**Controller**
- 用 `@CoolController` 声明，不需要加 `@Provide()`。
- 不要在 Controller 里重写 `add`、`delete`、`update`、`info`、`list`、`page`。需要改这些行为时，在 Service 里重写同名方法，或使用 `modifyBefore` / `modifyAfter`。
- 分页、列表的筛选和关联查询，优先用 `pageQueryOp` / `listQueryOp` 配置，不写自定义 SQL。
- 接口路径不要多级，用驼峰：`/studentDetail`，而不是 `/student/detail`。
- 本框架只提供管理后台接口：`controller/admin` 放后台接口，`controller/open` 只放少量免登录接口（如第三方回调）。不要写 `controller/app` 这类面向 C 端用户的接口，C 端服务独立实现，对接方式见 `docs/server/integration.md`。

**Service**
- 业务逻辑写在 Service，Controller 只做参数接收和转发。
- 数据库操作用 TypeORM API。统计类等确实复杂的查询，才用 `nativeQuery` / `sqlRenderPage`，参数一律走占位符，禁止拼接 SQL。
- 业务错误直接 `throw new CoolCommException('提示信息')`，不要吞掉异常。

**命名**
- 文件名用下划线，并且不要重复模块名：`shop` 模块下的商品写 `goods.ts`，不要写 `shop_goods.ts`；多个单词时写 `goods_sku.ts`。

## 按需阅读

| 任务 | 文档 |
| --- | --- |
| 新建模块：目录结构、`config.ts`、`db.json`、`menu.json` | `../docs/server/module.md` |
| Controller：路由规则、CRUD 配置、关联查询、`serviceApis`、路由标签 | `../docs/server/controller.md` |
| Entity：字段写法、可选项、虚拟列、数据库配置、事务 | `../docs/server/entity.md` |
| Service：重写 CRUD、TypeORM 查询、原生 SQL、异常 | `../docs/server/service.md` |
| 鉴权与权限 | `../docs/server/authority.md` |
| 对接 C 端服务：边界规则、独立数据源、调用内部管理接口 | `../docs/server/integration.md` |
| 缓存 | `../docs/server/cache.md` |
| 事件 | `../docs/server/event.md` |
| 定时任务（后台自身的维护任务） | `../docs/server/task.md` |
| 多租户 | `../docs/server/tenant.md` |
| WebSocket | `../docs/server/socket.md` |

新建业务模块时，至少要读 `module.md`、`controller.md`、`entity.md`、`service.md`。
