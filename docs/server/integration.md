# 对接 C 端服务

本文只适用于**附属后台**形态（见根目录 `AGENTS.md`「两种形态」）。独立业务系统没有 C 端，业务数据直接放在 `default` 数据源，不受下面的边界约束。

附属后台形态下，面向 C 端用户的服务（小程序、App、网站的后端）独立开发，语言、框架、表结构都由 C 端自己决定。这篇文档讲后台和 C 端的边界，以及后台怎么管理 C 端的数据和业务。

## 边界

**数据归属**
- 后台只拥有"让后台自身运转"的数据：管理员账号、角色、菜单、部门、操作日志、素材库索引等，存在 `default` 数据源。
- C 端的业务数据，以及 C 端运行时要读取的配置（商品、订单、用户、活动规则、开关……），都归 C 端所有，表结构由 C 端维护。

**依赖方向只能是 后台 → C 端**
- 后台可以读写 C 端的库（方式 A），也可以调用 C 端的接口（方式 B）。
- C 端绝不读后台的库，也不调用后台的接口。C 端运行时需要的配置要放在 C 端自己的库里，后台通过方式 A 或 B 去维护。

**其他归属**
- **业务定时任务归 C 端**：订单超时、统计、推送等由 C 端自己调度。后台只用 `@Job` 做自身的维护任务，比如清理日志，见 `task.md`。
- **文件**：生产环境必须使用对象存储（OSS、COS 等，在后台「扩展管理 / 插件列表」中安装对应的上传插件）。文件 URL 指向存储域名，不能指向后台服务器的 `/upload`，否则 C 端会依赖后台服务。`space`（文件管理）只是后台的素材库索引。

## 两种对接方式

| 方式 | 适合 | 代价 |
| --- | --- | --- |
| A. 共享数据库 | 简单的数据查看和维护：列表、筛选、改状态、改字段 | 后台直接改数据，会绕过 C 端的业务规则 |
| B. 调用 C 端的内部管理接口 | 涉及业务流程、必须由 C 端统一执行的操作：退款、发货、封禁账号、发放权益 | C 端要提供并维护这些接口 |

两者可以混用：同一个功能里，列表和简单编辑用 A，涉及业务流程的按钮用 B。

## A. 共享数据库

### 1. 每个 C 端业务一个独立数据源

- `default` 数据源只放后台的系统表。
- 每个 C 端业务配一个数据源，**数据源名称和后台中对应的模块名一致**，实体就放在这个模块的 `entity/` 下。
- `default` 的 `entities` 要排除这些模块，否则同一个实体会被两个数据源加载。

以 C 端业务 `shop` 为例（`server/src/config/config.local.ts` / `config.prod.ts`）：

```ts
typeorm: {
  dataSource: {
    default: {
      // ...
      // 排除 C 端模块，多个时写成 !(shop|order)
      entities: ['**/modules/!(shop)/entity'],
      subscribers: [TenantSubscriber],
    },
    // C 端业务 shop，名称与模块名一致
    shop: {
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      // 单独的、权限受限的数据库账号，只授予后台需要的表和操作
      username: 'admin_shop',
      password: 'xxx',
      database: 'shop',
      // C 端维护表结构，后台绝不能同步
      synchronize: false,
      logging: false,
      entities: ['**/modules/shop/entity'],
      // 不挂 TenantSubscriber：C 端的表没有 tenantId 列
    },
  },
},
```

**不需要写数据源名**：Midway 启动时会按每个数据源的 `entities` 配置，建立"实体 → 数据源"的映射。`@InjectEntityModel(ShopGoodsEntity)` 和 `@CoolController({ entity: ShopGoodsEntity })` 都会自动找到 `shop` 数据源（实现见 `@midwayjs/typeorm` 的 `getDataSourceNameByModel`）。前提是**每个实体只能被一个数据源的 `entities` 匹配到**：被匹配到两次时，后初始化的数据源会覆盖前一个；一次都没匹配到时，会退回 `default`。

注意事项：
- 跨数据源不能 join，也没有跨库事务。需要组合后台和 C 端的数据时，分别查询后在 Service 里拼装。
- C 端改了表结构后，要同步修改后台的实体，否则查询会报错。

### 2. C 端实体的写法

按 C 端真实的表结构写普通的 TypeORM 实体：

```ts
// server/src/modules/shop/entity/goods.ts
import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * C 端商品表（表结构由 C 端维护）
 */
@Entity('goods', { synchronize: false })
export class ShopGoodsEntity {
  // 主键列名不是 id 时，映射成 id 属性
  @PrimaryColumn({ name: 'goods_id', generated: 'increment' })
  id: number;

  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '状态', dict: ['下架', '上架'] })
  status: number;

  // 时间列映射成 createTime / updateTime，通用 CRUD 会自动写入
  @Column({ name: 'created_at' })
  createTime: Date;

  @Column({ name: 'updated_at' })
  updateTime: Date;
}
```

规则：
- **必须写 `@Entity('表名', { synchronize: false })`**。数据源上的 `synchronize: false` 一旦被人改错，TypeORM 就会改动 C 端的表结构；实体上再加一层，保证不出事。
- **不要继承 `BaseEntity`**。它的 `createTime` 是 varchar 类型，还带 `tenantId`，和 C 端真实的表结构对不上。
- 只声明后台需要用到的字段即可，不用把 C 端表的所有列都写上。

### 3. 用 cool 的通用 CRUD 管理 C 端表

照常写 `@CoolController` 和管理端的 `cl-crud` 页面（见 `controller.md`、`docs/admin/crud-page.md`）。通用 CRUD 对表有几个隐含要求：

| 要求 | 原因 | 表结构不同时 |
| --- | --- | --- |
| 主键属性叫 `id` | `info`、`update`、`delete` 都按 `id` 处理，`page`/`list` 默认按 `id` 排序 | `@PrimaryColumn({ name: 'goods_id' }) id`，并在 `pageQueryOp.select` 中写 `a.goods_id AS id` |
| 时间属性叫 `createTime`、`updateTime` | 新增、修改时框架会自动给这两个属性赋值 | `@Column({ name: 'created_at' }) createTime` |
| 请求中多余的字段会被忽略 | 当前 `crud.upsert` 配置为 `save`，实体中不存在的字段不会写入 | — |

`page`、`list` 走的是原生 SQL，返回的是**数据库列名**；`info` 返回的是**实体属性名**。列名和属性名不同时，要在 `select` 里起别名，让两边一致：

```ts
@CoolController({
  // C 端表默认不开放 delete
  api: ['info', 'update', 'page'],
  entity: ShopGoodsEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.title'],
    fieldEq: ['a.status'],
    select: ['a.goods_id AS id', 'a.title', 'a.status', 'a.created_at AS createTime'],
  },
})
export class AdminShopGoodsController extends BaseController {}
```

- **默认不开放 `delete`**：删除、下架这类是业务操作，应该改状态字段，或者用方式 B 调用 C 端接口。
- 不满足上面要求、或者需要组合多张表的场景，不用通用 CRUD，自己在 Service 里写查询。
- 不要把这些接口加进多租户的 `urls`：C 端的表没有 `tenantId` 列。

## B. 调用 C 端的内部管理接口

C 端提供一组只给后台调用的内部接口，后台的 Service 转调这些接口，Controller 再把它们暴露给管理端。

```ts
// server/src/modules/shop/service/order.ts
import { Config, Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import axios from 'axios';

/**
 * 订单：调用 C 端的内部管理接口
 */
@Provide()
export class ShopOrderService extends BaseService {
  @Config('module.shop.api')
  api: { baseURL: string; token: string };

  /**
   * 退款：退款规则由 C 端统一执行
   * 通过 serviceApis 注册成接口时，请求 body 会作为唯一参数传进来
   */
  async refund(params: { orderId: number; reason: string }) {
    return this.request('/internal/order/refund', params);
  }

  private async request(path: string, data: any) {
    const res = await axios.post(this.api.baseURL + path, data, {
      headers: { 'X-Internal-Token': this.api.token },
      timeout: 10000,
    });
    // 按 C 端的返回约定判断成功与否，失败时把原因透传给管理端
    if (res.data.code !== 0) {
      throw new CoolCommException(res.data.message);
    }
    return res.data.data;
  }
}
```

```ts
// server/src/modules/shop/controller/admin/order.ts
@CoolController({
  service: ShopOrderService,
  serviceApis: [{ method: 'refund', summary: '退款' }],
})
export class AdminShopOrderController extends BaseController {}
```

C 端的地址和凭证放在模块的 `config.ts` 中（`api: { baseURL, token }`），不要写死在代码里。

要点：
- **内部接口不能暴露到公网**：放在内网，或者至少用独立的凭证鉴权（上例的 `X-Internal-Token`）。
- **透传失败原因**：C 端返回的业务错误转成 `CoolCommException` 抛出，管理端会直接提示给操作人员。不要吞掉错误，也不要返回默认值。
- **记录操作人**：需要审计时，把 `this.ctx.admin.userId`、`username` 一起传给 C 端。后台自己的请求日志在 `base_sys_log` 表中。
