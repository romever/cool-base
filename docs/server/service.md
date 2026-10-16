# Service

业务逻辑写在 Service。继承 `BaseService` 后，Controller 的通用接口（`add`、`delete`、`update`、`info`、`list`、`page`）都由 Service 中的同名方法实现，所以要改通用接口的行为，就在 Service 中重写。

## 基本结构

```ts
import { Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ShopGoodsEntity } from '../entity/goods';

/**
 * 商品
 */
@Provide()
export class ShopGoodsService extends BaseService {
  @InjectEntityModel(ShopGoodsEntity)
  shopGoodsEntity: Repository<ShopGoodsEntity>;

  /**
   * 重写新增：校验编码唯一后再调用默认实现
   */
  async add(param: any) {
    const exist = await this.shopGoodsEntity.findOneBy({ code: param.code });
    if (exist) {
      throw new CoolCommException('商品编码已存在');
    }
    return super.add(param);
  }
}
```

重写后，记得在 Controller 的 `@CoolController({ service: ShopGoodsService })` 中指定这个 Service，否则不会生效。

## 修改前后钩子

只想在增删改前后补一点逻辑时，用钩子，不用重写整个方法：

```ts
/**
 * 增删改之前，可以修改 data
 */
async modifyBefore(data: any, type: 'add' | 'update' | 'delete') {
  if (type === 'add' || type === 'update') {
    if (data.password) data.password = md5(data.password);
  }
}

/**
 * 增删改之后，比如同步缓存、发事件
 */
async modifyAfter(data: any, type: 'add' | 'update' | 'delete') {}
```

## TypeORM 常用操作

```ts
// 新增：insert 要求字段都存在于表中；save 会忽略不存在的字段
await this.shopGoodsEntity.insert({ title: 'xxx' });
await this.shopGoodsEntity.save([{ title: 'a' }, { title: 'b' }]);
// 查询
await this.shopGoodsEntity.findOneBy({ id: 1 });
await this.shopGoodsEntity.findBy({ id: In([1, 2]) });
// 更新
await this.shopGoodsEntity.update(1, { title: 'xxx' });
await this.shopGoodsEntity.update({ status: 0 }, { title: 'xxx' });
// 删除
await this.shopGoodsEntity.delete([1, 2]);
// 条件查询、关联查询
await this.shopGoodsEntity
  .createQueryBuilder('a')
  .select(['a.*', 'b.name as categoryName'])
  .leftJoin(ShopCategoryEntity, 'b', 'a.categoryId = b.id')
  .where('a.status = :status', { status: 1 })
  .getRawMany();
```

## 分页

```ts
// QueryBuilder 分页，query 为前端传来的 { page, size, order, sort }
async goodsPage(query) {
  const find = this.shopGoodsEntity.createQueryBuilder('a').where('a.status = 1');
  return this.entityRenderPage(find, query);
}
```

## 原生 SQL

只在统计、复杂报表等 TypeORM 写起来很别扭的场景使用。

```ts
// 返回数组
await this.nativeQuery('select * from shop_goods a where a.id = ?', [id]);

// 返回分页对象 { list, pagination }
await this.sqlRenderPage('select * from shop_goods order by id desc', query, false);

// 动态条件：第一个参数为真时才拼上这段 SQL，参数仍走占位符
await this.nativeQuery(`
  select a.*, b.nickName
  from shop_goods a
  left join user_info b on a.userId = b.id
  where 1 = 1
  ${this.setSql(query.status, 'and a.status = ?', [query.status])}
  ${this.setSql(query.keyWord, 'and a.title like ?', [`%${query.keyWord}%`])}
`);
```

禁止把参数直接拼进 SQL 字符串。

注意：开启多租户时，`nativeQuery` 不会自动加租户条件，`sqlRenderPage` 会（见 tenant.md）。

## 异常

业务错误统一抛 `CoolCommException`，接口返回 `{ code: 1001, message: '提示信息' }`。管理端的请求封装会把它变成 reject 的 `{ code, message }`：`cl-crud` 内置的增删改查会自动弹出提示，页面里自己调用的接口需要 `.catch(err => ElMessage.error(err.message))`。

```ts
throw new CoolCommException('库存不足');
```

不要 catch 后返回空值或默认值来掩盖错误。

## 调用其他 Service

直接 `@Inject()` 对应的 Service 即可。如果在别的 Service 里调用了某个 Service 继承自 `BaseService` 的方法（如 `page`）并报"未设置操作实体"，说明该 Service 自己没有绑定实体，在它里面加：

```ts
@Init()
async init() {
  await super.init();
  this.setEntity(this.shopGoodsEntity);
}
```

更推荐的做法是在当前 Service 里直接注入要操作的实体仓库，减少 Service 之间的耦合。
