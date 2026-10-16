# Controller

`@CoolController` 在 Midway Controller 的基础上增加了**自动路由**和**快速 CRUD**。Midway 原有的 `@Get`、`@Post`、`@Body`、`@Query` 等用法全部可用。

## 路由规则

路由前缀由文件位置自动生成：`/<controller 下的目录>/<模块名>/<文件名>`。

| 文件 | 路由前缀 |
| --- | --- |
| `modules/shop/controller/admin/goods.ts` | `/admin/shop/goods` |
| `modules/base/controller/admin/sys/user.ts` | `/admin/base/sys/user` |

方法路径拼在后面，例如 `/admin/shop/goods/page`。

不要手动设置 `prefix`。权限中间件依赖这个规则判断接口归属，手动前缀可能让权限校验失效。

## 快速 CRUD

```ts
import { Get, Inject } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { ShopGoodsEntity } from '../../entity/goods';
import { ShopGoodsService } from '../../service/goods';
import { BaseSysUserEntity } from '../../../base/entity/sys/user';

/**
 * 商品
 */
@CoolController({
  // 需要开放的通用接口
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ShopGoodsEntity,
  // 可选，有自定义业务逻辑时指定
  service: ShopGoodsService,
  // 新增时自动写入的字段，例如当前登录的后台用户
  insertParam: ctx => {
    return { userId: ctx.admin.userId };
  },
  // info 接口不返回的字段
  infoIgnoreProperty: ['password'],
  pageQueryOp: {
    keyWordLikeFields: ['a.title'],
    fieldEq: ['a.status'],
    select: ['a.*', 'b.name as userName'],
    join: [
      {
        entity: BaseSysUserEntity,
        alias: 'b',
        condition: 'a.userId = b.id',
        type: 'leftJoin',
      },
    ],
    addOrderBy: { 'a.createTime': 'DESC' },
  },
})
export class AdminShopGoodsController extends BaseController {
  @Inject()
  shopGoodsService: ShopGoodsService;

  @Get('/stat', { summary: '商品统计' })
  async stat() {
    return this.ok(await this.shopGoodsService.stat());
  }
}
```

类名约定：`Admin + 模块 + 实体 + Controller`，例如 `AdminShopGoodsController`。

### CrudOption

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `api` | `string[]` | 开放的通用接口：`add` `delete` `update` `info` `list` `page` |
| `entity` | Entity 类 | 操作的实体 |
| `service` | Service 类 | 自定义 Service，用来重写通用接口的实现 |
| `serviceApis` | `(string \| { method, summary })[]` | 把 Service 方法直接注册成 POST 接口 |
| `pageQueryOp` | `QueryOp \| (ctx) => QueryOp` | `page` 接口的查询配置 |
| `listQueryOp` | `QueryOp \| (ctx) => QueryOp` | `list` 接口的查询配置 |
| `insertParam` | `(ctx) => object` | 新增时追加写入的字段 |
| `before` | `(ctx) => void` | 执行通用接口前处理请求参数 |
| `infoIgnoreProperty` | `string[]` | `info` 接口忽略返回的字段 |

### QueryOp

| 参数 | 说明 |
| --- | --- |
| `keyWordLikeFields` | 请求参数 `keyWord` 会在这些字段上做模糊匹配 |
| `fieldEq` | 全等筛选。字符串数组，或 `{ column: 'a.id', requestParam: 'id' }`（请求参数名与字段不同时用） |
| `fieldLike` | 模糊筛选，格式同 `fieldEq` |
| `select` | 返回字段。**有 join 时必须设置**，否则 `id`、`createTime` 等同名字段会冲突 |
| `join` | 关联表：`{ entity, alias, condition, type: 'innerJoin' \| 'leftJoin' }`，主表别名固定为 `a`，其他表依次用 `b`、`c`…，`entity` 写实体类而不是表名 |
| `where` | `async ctx => [['a.price > :price', { price: 90 }], ['a.type = :type', { type }, 条件]]`，第三项为 false 时这条不生效 |
| `extend` | `async (find: SelectQueryBuilder) => { find.groupBy('a.id') }`，追加任意 QueryBuilder 操作 |
| `addOrderBy` | 默认排序，例如 `{ 'a.createTime': 'DESC' }` |

需要根据请求动态生成配置时，`pageQueryOp` 可以写成函数：

```ts
pageQueryOp: async ctx => {
  return { fieldEq: ['a.status'] };
},
```

## 接口调用格式

所有通用接口返回 `{ code: 1000, message: 'success', data }`，失败时 `code` 为 `1001`。

`page` / `list` 都是 POST，body 示例：

```json
{
  "keyWord": "关键字",
  "status": 1,
  "page": 1,
  "size": 20,
  "order": "createTime",
  "sort": "desc"
}
```

`page` 返回：

```json
{
  "list": [],
  "pagination": { "page": 1, "size": 20, "total": 0 }
}
```

`add`、`update` 以 body 传实体字段；`delete` 传 `{ "ids": [1, 2] }`；`info` 为 GET `?id=1`。

## serviceApis：把 Service 方法注册成接口

Controller 里只做转发时，直接把 Service 方法暴露出去，不用再写一遍方法：

```ts
@CoolController({
  entity: ShopGoodsEntity,
  service: ShopGoodsService,
  serviceApis: ['stat', { method: 'syncStock', summary: '同步库存' }],
})
export class AdminShopGoodsController extends BaseController {}
```

注册出来的都是 POST 接口（如 `/admin/shop/goods/syncStock`），**整个请求 body 作为唯一参数**传给 Service 方法，所以方法要写成 `async syncStock(params: { ... })`。

## 路由标签：给接口打标记

最常见的用法是让某个后台接口免登录：

```ts
import { CoolController, BaseController, CoolTag, TagTypes } from '@cool-midway/core';

@CoolController({ api: ['page', 'info'], entity: ShopGoodsEntity })
export class AdminShopGoodsController extends BaseController {
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/publicStat', { summary: '公开统计' })
  async publicStat() {}
}
```

通用接口（`page`、`info` 等）不是手写的方法，要在类上打标签：`@CoolUrlTag({ key: TagTypes.IGNORE_TOKEN, value: ['page', 'info'] })`。

在中间件里读取被标记的接口：

```ts
@Inject()
coolUrlTagData: CoolUrlTagData;

// 返回所有忽略 token 的 url
this.coolUrlTagData.byKey(TagTypes.IGNORE_TOKEN);
```
