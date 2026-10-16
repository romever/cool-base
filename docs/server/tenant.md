# 多租户

按列隔离：每张表都有 `BaseEntity` 带来的 `tenantId` 字段，框架在 SQL 构建阶段自动加上租户条件，业务代码不用改。默认关闭。

## 原理

- 后台用户表的 `tenantId` 在登录时写入 token，请求进来后可从 `ctx.admin.tenantId` 读到。
- `server/src/modules/base/db/tenant.ts` 中的 `TenantSubscriber` 监听 TypeORM 的 QueryBuilder：查询、更新、删除自动加 `tenantId = 当前租户`，新增自动写入 `tenantId`。
- 只对配置在 `urls` 中的请求生效，`tenantId` 为空（如超管）时不过滤。

## 开启

`server/src/config/config.default.ts`：

```ts
cool: {
  tenant: {
    enable: true,
    // 需要做租户隔离的接口，支持通配符
    urls: ['/admin/**/*'],
  },
},
```

`config.local.ts` / `config.prod.ts` 中 `typeorm` 的 `subscribers: [TenantSubscriber]` 必须保留。

## 哪些操作会被隔离

| 操作 | 是否自动隔离 |
| --- | --- |
| Controller 的通用 CRUD 接口 | 是 |
| Repository 的 `find`、`createQueryBuilder` 等 | 是 |
| `sqlRenderPage` | 是 |
| `nativeQuery` 原生 SQL | **否**，需要自己加 `tenantId` 条件 |

## 局部跳过隔离

```ts
import { noTenant } from '../../base/db/tenant';

@Inject()
ctx;

async allGoods() {
  // 包在 noTenant 里的查询不加租户条件
  return noTenant(this.ctx, async () => {
    return this.shopGoodsEntity.find();
  });
}
```
