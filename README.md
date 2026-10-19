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

环境：Node.js >= 20、pnpm >= 10、PostgreSQL 13+。

依赖按子项目分别安装在 `server/node_modules`、`admin/node_modules`（见 `pnpm-workspace.yaml` 中的说明），仍然只需要在根目录执行一次 `pnpm install`。

1. 创建数据库 `cool`（`createdb cool`，或用 `server/docker-compose.yml` 启动），账号密码按需修改 `server/src/config/config.local.ts`。
2. 安装依赖并启动：

```bash
pnpm install
```

```bash
pnpm dev
```

3. 打开 <http://localhost:9000>，账号 `admin`，密码 `123456`。

启动后端时会先执行数据库迁移建表，再导入初始数据和菜单。

## 基于本框架开新项目

1. 复制本仓库（不要带 `.git`），重新 `git init`。
2. 按需修改：

| 位置 | 内容 |
| --- | --- |
| `server/src/config/config.local.ts` / `config.prod.ts` | 数据库连接 |
| `admin/.env` 的 `VITE_NAME` | 管理端名称 |
| `admin/src/config/proxy.ts` | 后端地址代理 |
| 根目录 `package.json` 的 `name` | 项目名 |

## 开发

新增业务功能的流程和规范见 [AGENTS.md](AGENTS.md)，详细规则在 [docs/](docs/)。

## 部署

后端生产环境必须提供以下环境变量，缺少任意一个都会启动失败：

| 变量 | 说明 |
| --- | --- |
| `JWT_SECRET` | 后台 token 签名密钥，32 位以上随机串，上线后不要更换 |
| `APP_KEYS` | cookie 签名密钥，随机串 |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | PostgreSQL 连接信息 |
| `UPLOAD_DOMAIN` | 本地上传文件的访问地址前缀，填浏览器能访问到的后端地址，例如 `https://admin.example.com/api`，上传接口返回 `<UPLOAD_DOMAIN>/upload/...` |

在 `server/` 下执行 `pnpm build` 后，用 `pnpm start` 启动：会先执行未执行过的数据库迁移，再启动服务；首次启动时自动导入初始数据。运行时数据（缓存、上传文件、插件）在 `server/data/`，容器部署时要挂载出来。

### Docker 镜像

两个镜像都要在仓库根目录构建，依赖按各自的 `pnpm-lock.yaml` 安装，lockfile 与 `package.json` 不一致时构建会失败：

```bash
docker build -f server/Dockerfile -t cool-server .
```

```bash
docker build -f admin/Dockerfile -t cool-admin .
```

后端镜像运行时要传入上面的环境变量，并挂载 `/app/server/data`。管理端镜像是 Nginx，`/api/` 转发到 `admin/nginx.conf` 里 upstream 配置的后端地址（默认 `midway:8001`），部署前按实际改。

## 许可

cool-admin 原项目基于 MIT 协议，许可证见 `server/LICENSE`、`admin/LICENSE`。
