# 在仓库根目录构建：docker build -f admin/Dockerfile -t cool-admin .
# 依赖按 admin/pnpm-lock.yaml 安装，安装脚本白名单沿用根目录的 pnpm-workspace.yaml
FROM node:24-alpine AS build
# 设置npm镜像
RUN npm config set registry https://registry.npmmirror.com
# pnpm 版本与根目录 package.json 的 packageManager 保持一致
RUN npm install -g pnpm@11.5.1
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
# pnpm-workspace.yaml 中 patchedDependencies 引用的补丁文件
COPY patches ./patches
COPY admin/package.json admin/pnpm-lock.yaml ./admin/
RUN pnpm install --frozen-lockfile --filter admin
COPY admin ./admin
RUN pnpm --filter admin run build

FROM nginx
RUN mkdir /app
COPY --from=build /app/admin/dist /app
COPY --from=build /app/admin/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
