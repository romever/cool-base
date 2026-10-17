# 鉴权与权限

本框架只服务管理后台，只有后台管理员一种登录身份。C 端用户（App、小程序等）的账号体系属于 C 端服务自己，不放在这里，对接方式见 `integration.md`。

采用无状态的 JWT 鉴权。登录成功后返回 `token`（默认 2 小时）和 `refreshToken`（默认 15 天），管理端在请求头 `Authorization` 中携带 token，过期后用 refreshToken 换取新 token。配置在 `server/src/modules/base/config.ts` 的 `jwt` 中。

`jwt.secret` 的默认值会在首次 `pnpm dev` 时由 `cool check` 自动替换成随机值，替换后不要再随意修改，否则已登录用户的 token 全部失效。

## 哪些接口需要登录

由路由前缀决定，不需要在每个接口上处理：

| 路由 | 校验 | 实现位置 |
| --- | --- | --- |
| `/admin/**` | 后台用户登录 + 菜单权限 | `server/src/modules/base/middleware/authority.ts` |
| `/admin/**/open/**` | 不校验 | 同上 |
| `/admin/**/comm/**` | 只要登录，不校验权限 | 同上 |
| `/admin` 以外的前缀（如 `controller/open` 下） | 不校验，只用于少量公开接口，如第三方回调 | — |
| 打了 `TagTypes.IGNORE_TOKEN` 标签的接口 | 不校验 | 见 controller.md「路由标签」 |

登录后，后台用户信息在 `ctx.admin`（含 `userId`、`username`、`roleIds`、`tenantId` 等）。

## 后台权限模型

用户 → 角色 → 菜单/权限。

- `admin` 账号是超级管理员，拥有全部权限。
- 菜单中 `type = 2` 的记录是权限点，`perms` 形如 `shop:goods:page,shop:goods:add`，对应接口 `/admin/shop/goods/page`、`/admin/shop/goods/add`。
- 菜单和权限点定义在各模块的 `menu.json` 中，启动时自动同步到数据库，见 `module.md`。新增后台接口后，要在 `menu.json` 里把它加进对应的权限点；发版后到「角色列表」中勾选，非超管用户才能访问，否则返回 403。
- 前后端都按完整的权限字符串**精确匹配**：前端 `v-permission`、`service.xxx._permission` 决定按钮是否显示，后端中间件决定接口是否放行。

## 登录流程

实现在 `server/src/modules/base/service/sys/login.ts`：校验验证码 → 校验账号密码和状态 → 查询角色 → 生成 token 和 refreshToken → 把权限、部门、token 写入缓存（`admin:perms:<userId>`、`admin:token:<userId>` 等）。

中间件每次请求会对比缓存里的 token 和密码版本，修改密码或在开启 `sso`（单点登录）时登录新设备，旧 token 会失效。
