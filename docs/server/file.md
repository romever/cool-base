# 业务文件存储

后台有两类文件，存放方式不同：

| 类型 | 例子 | 存放 | 访问 |
| --- | --- | --- | --- |
| 公开素材 | 商品图、头像、富文本里的图片 | 上传接口（`cl-upload`），本地存在 `server/data/upload/` | `/upload/...` 静态地址，**不需要登录** |
| 业务文件 | 用户上传待处理的数据包、导出的报表、检测报告 | 模块自己的目录 `server/data/<模块>/` | 只能通过需要登录和权限的后台接口下载 |

`/upload` 下的文件任何人拿到地址都能访问。含业务数据或敏感内容的文件，不能放进上传目录。

## 公开素材

- **附属后台**：生产环境必须使用对象存储，原因见 `integration.md`。
- **独立业务系统**：单机部署可以存本地，把 `server/data` 挂载到宿主机持久化即可；多实例部署时必须使用对象存储，否则各实例的文件不一致。

## 业务文件

目录用 `src/comm/path.ts` 的 `pDataPath()` 拼出来，例如 `path.join(pDataPath(), 'report')`。规则：

- **数据库只存相对路径**（如 `2026/10/xxx.xlsx`），不存绝对路径，换部署目录不用改数据。
- **文件名由后端生成**（如 UUID 或内容哈希），不要用用户上传的原始文件名，原始文件名单独存一个字段用于展示。
- **读取前校验路径没有越出模块目录**，防止 `../` 读到其他文件：

```ts
const root = path.join(pDataPath(), 'report');
const fullPath = path.resolve(root, relativePath);
if (!fullPath.startsWith(root + path.sep)) {
  throw new CoolCommException('文件路径非法');
}
```

- **下载走后台接口**，在 Controller 里校验权限后返回文件流，接口加入 `menu.json` 的权限点。
- **要有清理规则**：文件会持续增长，在任务表或业务表上记录文件的生命周期（例如完成 30 天后删除），用 `@Job` 定期清理（见 `task.md`）。先改数据库记录，再删文件。
- 后端和 worker 进程（见 `worker.md`）必须读写同一个 `server/data` 目录：同一台机器上挂载相同的宿主机目录，多台机器时挂载共享存储。
