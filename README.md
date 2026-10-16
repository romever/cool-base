# cool-base

基于 [cool-admin](https://cool-js.com) 8.x（Midway 后端 + Vue3 管理端）整理的通用管理后台框架。新项目直接复制本仓库，在上面开发后台业务模块即可。

本框架只包含管理后台，不包含面向 C 端用户的服务。C 端服务（小程序、App 的后端）独立开发、可以用任何语言，后台通过共享数据库或调用其内部接口来管理，见 [docs/server/integration.md](docs/server/integration.md)。

## 目录

```
cool-base/
├── server/     后端（Midway.js + TypeORM），端口 8001
├── admin/      管理端（Vue3 + Element Plus + @cool-vue/crud），端口 9000
├── docs/       开发规则文档（server/、admin/ 两部分）
└── AGENTS.md   AI 编码助手的入口说明（CLAUDE.md 引用它）
```

## 快速开始

环境：Node.js >= 20、pnpm >= 10、MySQL 5.7+ / 8。

依赖按子项目分别安装在 `server/node_modules`、`admin/node_modules`（见 `pnpm-workspace.yaml` 中的说明），仍然只需要在根目录执行一次 `pnpm install`。

1. 创建数据库 `cool`（字符集 `utf8mb4`），账号密码按需修改 `server/src/config/config.local.ts`。
2. 安装依赖并启动：

```bash
pnpm install
```

```bash
pnpm dev
```

3. 打开 <http://localhost:9000>，账号 `admin`，密码 `123456`。

首次启动后端会自动建表、导入初始数据和菜单。

## 基于本框架开新项目

1. 复制本仓库（不要带 `.git`），重新 `git init`。
2. 首次 `pnpm dev` 时，`cool check` 会自动把下面两个默认值替换成随机值，替换后的文件要提交到新项目里。本模板仓库自身保持默认值，不要把替换后的值提交回模板：
   - `server/src/config/config.default.ts` 的 `keys`（同时决定本地数据目录 `~/.cool-admin/<md5(keys)>/`）
   - `server/src/modules/base/config.ts` 的 `jwt.secret`（后台 token 密钥）
3. 按需修改：

| 位置 | 内容 |
| --- | --- |
| `server/src/config/config.local.ts` / `config.prod.ts` | 数据库连接 |
| `admin/.env` 的 `VITE_NAME` | 管理端名称 |
| `admin/src/config/proxy.ts` | 后端地址代理 |
| 根目录 `package.json` 的 `name` | 项目名 |

## 开发

新增业务功能的流程和规范见 [AGENTS.md](AGENTS.md)，详细规则在 [docs/](docs/)。

## 许可

cool-admin 原项目基于 MIT 协议，许可证见 `server/LICENSE`、`admin/LICENSE`。
