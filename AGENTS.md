# AGENTS.md

本仓库是基于 [cool-admin](https://cool-js.com) 8.x 的通用后台框架，用来二次开发各种应用的**管理后台**。它只包含后台本身，不包含面向 C 端用户（App、小程序、网站）的服务；C 端服务独立开发，后台通过共享数据库或调用其内部接口来管理它们（见 `docs/server/integration.md`）。

前后端放在同一个 pnpm workspace 里：

| 目录 | 内容 | 技术栈 |
| --- | --- | --- |
| `server/` | 后端 API | Midway.js 3 + Koa + TypeORM 0.3（`@cool-midway/core`），TypeScript |
| `admin/` | 管理端 | Vue 3 + Vite + Element Plus + `@cool-vue/crud`，TypeScript/TSX |
| `docs/` | 给 AI 和开发者看的开发规则，按需阅读 | Markdown |

进入 `server/` 或 `admin/` 工作时，先读该目录下的 `AGENTS.md`，里面有这一端的硬性规则和文档索引。

## 常用命令（在仓库根目录执行）

```bash
pnpm install          # 安装全部依赖
pnpm dev              # 同时启动后端(8001)和管理端(9000)
pnpm dev:server       # 只启动后端
pnpm dev:admin        # 只启动管理端
pnpm build            # 构建前后端
```

本地开发需要一个 MySQL（默认 `127.0.0.1:3306`，库名 `cool`，账号 `root/123456`，见 `server/src/config/config.local.ts`）。库建好后启动后端会自动建表并导入初始数据，管理端默认账号 `admin / 123456`。

## 前后端是怎么连起来的

1. 后端每个模块的 Controller 按目录自动生成路由，例如 `server/src/modules/shop/controller/admin/goods.ts` 对应 `/admin/shop/goods/*`。
2. 后端开启 `eps` 后，会把所有接口和实体结构暴露给前端。
3. 管理端启动时 `@cool-vue/vite-plugin` 拉取 eps，生成 `admin/build/cool/eps.d.ts`，于是前端可以直接调用 `service.shop.goods.page()`，并带有类型提示。
4. 菜单、权限存在数据库里。菜单的 `viewPath` 指向管理端的 `.vue` 文件，例如 `modules/shop/views/goods.vue`。

所以**新增一个业务功能的标准流程**是：

1. 后端：在 `server/src/modules/<模块>/` 下写 entity → service（可选）→ controller，详见 `docs/server/module.md`。
2. 重启后端，确认新表已建好、接口可访问。
3. 管理端：在 `admin/src/modules/<模块>/views/` 下写页面，详见 `docs/admin/crud-page.md`。
4. 在管理后台「系统管理 / 菜单列表」中添加菜单并配置权限；需要随代码分发菜单时，导出到后端模块的 `menu.json`。

## 全局约定

- 回复、代码注释、文档一律使用中文。
- 模块名在前后端保持一致（后端 `server/src/modules/shop` ↔ 前端 `admin/src/modules/shop`）。
- 后端 `base`、`space`、`plugin`、`swagger`，管理端 `base`、`space`、`helper` 是框架自带的通用模块。业务功能放到新模块里，不要往框架模块里塞业务代码；确实需要改框架模块时，要明确说明改了什么。
- 不要修改 `admin/build/cool/` 下的文件，它们由 eps 自动生成。
- `admin/packages/` 是 `@cool-vue/crud` 和 `@cool-vue/vite-plugin` 的源码副本，只用于查阅。项目实际依赖的是 npm 包，改这里不会生效。

## 文档索引

先按任务找到对应文档，只读需要的部分。

| 任务 | 文档 |
| --- | --- |
| 新建后端模块、模块配置、初始化数据和菜单 | `docs/server/module.md` |
| 写接口、CRUD 配置、关联查询、路由规则 | `docs/server/controller.md` |
| 定义实体、字段类型、可选项、数据库配置、事务 | `docs/server/entity.md` |
| 写业务逻辑、重写 CRUD、原生 SQL、抛异常 | `docs/server/service.md` |
| 登录鉴权、接口权限 | `docs/server/authority.md` |
| 对接 C 端服务：边界规则、独立数据源、调用内部管理接口 | `docs/server/integration.md` |
| 缓存、Redis | `docs/server/cache.md` |
| 事件 | `docs/server/event.md` |
| 定时任务（后台自身的维护任务） | `docs/server/task.md` |
| 多租户 | `docs/server/tenant.md` |
| WebSocket | `docs/server/socket.md` |
| 前端模块/插件结构、config.ts、路由、store | `docs/admin/module.md` |
| 写一个标准的增删改查页面 | `docs/admin/crud-page.md` |
| `cl-crud` / `cl-table` / `cl-upsert` / `cl-form` / `cl-search` / `cl-adv-search` 详细示例 | `docs/admin/components/*.md` |
