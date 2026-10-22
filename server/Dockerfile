# 在仓库根目录构建：docker build -f server/Dockerfile -t cool-server .
# 依赖按 server/pnpm-lock.yaml 安装，安装脚本白名单沿用根目录的 pnpm-workspace.yaml
FROM node:24-alpine AS base

# 配置alpine国内镜像加速
RUN sed -i -E "s@https?://dl-cdn.alpinelinux.org/@https://repo.huaweicloud.com/@g" /etc/apk/repositories

# 安装tzdata,默认的alpine基础镜像不包含时区组件，安装后可通过TZ环境变量配置时区
RUN apk add --no-cache tzdata

# 设置时区为中国东八区，这里的配置可以被docker-compose.yml或docker run时指定的时区覆盖
ENV TZ="Asia/Shanghai"

# 如果各公司有自己的私有源，可以替换registry地址,如使用官方源注释下一行
RUN npm config set registry https://registry.npmmirror.com

# pnpm 版本与根目录 package.json 的 packageManager 保持一致
RUN npm install -g pnpm@11.5.1

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
# pnpm-workspace.yaml 中 patchedDependencies 引用的补丁文件
COPY patches ./patches
COPY server/package.json server/pnpm-lock.yaml ./server/

# 构建阶段：安装全部依赖并编译
FROM base AS build
RUN pnpm install --frozen-lockfile --filter server
COPY server ./server
RUN pnpm --filter server run build

# 运行阶段：只安装生产依赖，拷入编译产物
FROM base
RUN pnpm install --frozen-lockfile --prod --filter server
COPY --from=build /app/server/dist ./server/dist
COPY server/bootstrap.js ./server/
COPY server/public ./server/public

WORKDIR /app/server
# 运行时数据（缓存、上传文件、插件），需要挂载出来持久化
VOLUME /app/server/data

# 如果端口更换，这边可以更新一下
EXPOSE 8001

CMD ["pnpm", "start"]
