# 鉴权与权限

本框架只服务管理后台，只有后台管理员一种登录身份。C 端用户（App、小程序等）的账号体系属于 C 端服务自己，不放在这里，对接方式见 `integration.md`。

采用无状态的 JWT 鉴权。登录成功后返回 `token`（默认 2 小时）和 `refreshToken`（默认 15 天），管理端在请求头 `Authorization` 中携带 token，过期后用 refreshToken 换取新 token。配置在 `server/src/modules/base/config.ts` 的 `jwt` 中。

`jwt.secret` 在本地开发时是固定值；生产环境必须通过环境变量 `JWT_SECRET` 提供（建议 32 位以上随机串），缺失时服务直接启动失败。上线后不要随意更换，否则已登录用户的 token 全部失效。

## 哪些接口需要登录

由路由前缀决定，不需要在每个接口上处理：

| 路由 | 校验 | 实现位置 |
| --- | --- | --- |
| `/admin/**` | 后台用户登录 + 菜单权限 | `server/src/modules/base/middleware/authority.ts` |
| `/admin/**/open/**` | 不校验 | 同上 |
| `/admin/**/comm/**` | 只要登录，不校验权限 | 同上 |
| `/admin` 以外的前缀（如 `controller/open` 下） | 不校验，只用于少量公开接口，如第三方回调 | — |
| 打了 `TagTypes.IGNORE_TOKEN` 标签的接口 | 不校验 | 见 controller.md「路由标签」 |

登录后，后台用户信息在 `ctx.admin`（含 `userId`、`username`、`roleIds`、`isSuperAdmin`、`tenantId` 等）。

## 后台权限模型

用户 → 角色 → 菜单/权限。

- 拥有标识（`label`）为 `admin` 的角色的用户是超级管理员，拥有全部权限。判断超管一律用 `ctx.admin.isSuperAdmin`，不要按用户名判断。
- 超管角色只能由初始化数据创建：接口不能新增、修改、删除它，也不能把它分配给其他用户；超管用户不能在「用户列表」中修改或删除。
- 菜单中 `type = 2` 的记录是权限点，`perms` 形如 `shop:goods:page,shop:goods:add`，对应接口 `/admin/shop/goods/page`、`/admin/shop/goods/add`。
- 菜单和权限点定义在各模块的 `menu.json` 中，启动时自动同步到数据库，见 `module.md`。新增后台接口后，要在 `menu.json` 里把它加进对应的权限点；发版后到「角色列表」中勾选，非超管用户才能访问，否则返回 403。
- 前后端都按完整的权限字符串**精确匹配**：前端 `v-permission`、`service.xxx._permission` 决定按钮是否显示，后端中间件决定接口是否放行。

## 登录流程

实现在 `server/src/modules/base/service/sys/login.ts`：校验验证码 → 校验账号密码和状态 → 查询角色 → 生成 token 和 refreshToken → 把权限、部门、token 写入缓存（`admin:perms:<userId>`、`admin:token:<userId>` 等）。

密码用 bcrypt 加盐哈希存储（`server/src/comm/password.ts`）。用 refreshToken 换新 token 时会重新读取用户：已禁用或改过密码的用户无法换取。用户被禁用、角色权限变更后，缓存中的 token 会被清除，原 token 立即失效。

中间件每次请求会对比缓存里的 token 和密码版本，修改密码或在开启 `sso`（单点登录）时登录新设备，旧 token 会失效。

同一账号在同一 IP 连续登录失败 5 次后锁定 15 分钟，次数和时长在 `server/src/modules/base/config.ts` 的 `loginLock` 中配置。IP 取自 `ctx.ip`：部署在 Nginx 等反向代理之后时，要在 `config.prod.ts` 中设置 `koa: { proxy: true }`，否则所有请求都会被识别成代理的 IP。

## 其它安全约定

- **请求日志脱敏**：所有后台请求的参数会写入 `base_sys_log`，写入前会把 `password`、`oldPassword`、`token`、`refreshToken` 字段替换为 `***`。新增其它敏感字段时，加到 `server/src/modules/base/service/sys/log.ts` 的 `SENSITIVE_FIELDS` 中。
- **上传白名单**：只允许 `server/src/comm/upload.ts` 中 `UPLOAD_EXTENSIONS` 列出的扩展名（不含 html、svg、js 等可执行脚本的类型），插件安装接口只允许 `.cool`。需要支持新的文件类型时改这个列表。
