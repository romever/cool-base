# 鉴权与权限

采用无状态的 JWT 鉴权。登录成功后返回 `token` 和 `refreshToken`，客户端在请求头 `Authorization` 中携带 token，过期后用 refreshToken 换取新 token。

| 端 | 配置位置 | token 有效期 | refreshToken 有效期 |
| --- | --- | --- | --- |
| 后台 | `server/src/modules/base/config.ts` 的 `jwt` | 2 小时 | 15 天 |
| App | `server/src/modules/user/config.ts` 的 `jwt` | 1 天 | 30 天 |

两处 `jwt.secret` 的默认值会在首次 `pnpm dev` 时由 `cool check` 自动替换成随机值，替换后不要再随意修改，否则已登录用户的 token 全部失效。

## 哪些接口需要登录

由路由前缀决定，不需要在每个接口上处理：

| 路由 | 校验 | 实现位置 |
| --- | --- | --- |
| `/admin/**` | 后台用户登录 + 菜单权限 | `server/src/modules/base/middleware/authority.ts` |
| `/admin/**/open/**` | 不校验 | 同上 |
| `/admin/**/comm/**` | 只要登录，不校验权限 | 同上 |
| `/app/**` | App 用户登录 | `server/src/modules/user/middleware/app.ts` |
| 其他前缀（如 `controller/open` 下） | 不校验 | — |
| 打了 `TagTypes.IGNORE_TOKEN` 标签的接口 | 不校验 | 见 controller.md「路由标签」 |

登录后，后台用户信息在 `ctx.admin`（含 `userId`、`username`、`roleIds` 等），App 用户信息在 `ctx.user`。

## 后台权限模型

用户 → 角色 → 菜单/权限。

- `admin` 账号是超级管理员，拥有全部权限。
- 菜单中 `type = 2` 的记录是权限点，`perms` 形如 `shop:goods:page,shop:goods:add`，对应接口 `/admin/shop/goods/page`、`/admin/shop/goods/add`。
- 新增后台接口后，要在「系统管理 / 菜单列表」里给对应菜单添加权限，再到「角色管理」中勾选，非超管用户才能访问，否则返回 403。

## 登录流程

实现在 `server/src/modules/base/service/sys/login.ts`：校验验证码 → 校验账号密码和状态 → 查询角色 → 生成 token 和 refreshToken → 把权限、部门、token 写入缓存（`admin:perms:<userId>`、`admin:token:<userId>` 等）。

中间件每次请求会对比缓存里的 token 和密码版本，修改密码或在开启 `sso`（单点登录）时登录新设备，旧 token 会失效。

## 其他端的鉴权

需要给其他类型的客户端（例如第三方系统）做鉴权时，新建一个中间件，在模块 `config.ts` 的 `globalMiddlewares` 中注册，写法参考上面两个中间件。
