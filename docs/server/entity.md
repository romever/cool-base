# Entity 与数据库

ORM 使用 TypeORM 0.3.20（`typeorm` 指向 `@cool-midway/typeorm` 分支，额外支持 `dict` 等字段配置）。官方文档：<https://typeorm.io>、<https://midwayjs.org/docs/extensions/orm>。

## BaseEntity

所有实体继承 `server/src/modules/base/entity/base.ts` 中的 `BaseEntity`，它已经包含：

| 字段 | 说明 |
| --- | --- |
| `id` | 自增主键 |
| `createTime` / `updateTime` | 创建、更新时间，自动维护，格式 `YYYY-MM-DD HH:mm:ss` |
| `tenantId` | 租户 ID，开启多租户时使用（见 tenant.md） |

同一个文件还导出了 `transformerTime`、`transformerJson` 两个字段转换器。

## 实体示例

```ts
import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品
 */
@Entity('shop_goods')
export class ShopGoodsEntity extends BaseEntity {
  @Index()
  @Column({ comment: '标题', length: 100 })
  title: string;

  @Index({ unique: true })
  @Column({ comment: '编码', length: 50 })
  code: string;

  // 关联其他表只存 id，不使用外键
  @Index()
  @Column({ comment: '分类ID', nullable: true })
  categoryId: number;

  // 金额用 decimal
  @Column({ comment: '价格', type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  // 可选项：值是数组下标，0-下架 1-上架
  @Column({ comment: '状态', dict: ['下架', '上架'], default: 1 })
  status: number;

  // 数组、对象用 json，并带上 transformerJson，保证各数据库读出来都是对象
  @Column({ comment: '标签', type: 'json', nullable: true, transformer: transformerJson })
  labels: string[];

  // 只需要日期用 date，需要时分秒用 datetime
  @Column({ comment: '上架日期', type: 'date', nullable: true })
  onlineDate: Date;

  @Column({ comment: '详情', type: 'text', nullable: true })
  content: string;
}
```

要点：

- 表名 `模块_表`，类名 `模块 + 表 + Entity`，字段驼峰。
- 经常用于筛选、关联的字段加 `@Index()`。
- 状态、类型等枚举字段一定要用 `dict: ['选项0', '选项1', ...]` 声明可选项，值就是数组下标。前端代码生成和表格展示会根据它自动生成选项和标签。
- 实体所在层级变了，`BaseEntity` 的相对路径也要跟着变，例如 `entity/sys/xxx.ts` 中是 `../base`（base 模块内）或 `../../../base/entity/base`（其他模块）。

## 不使用外键

禁止 `@OneToMany`、`@ManyToOne`、`@ManyToMany`、`@OneToOne` 等关系装饰器。外键会带来写入开销、锁竞争，也让分库分表、迁移变得困难。关联统一用 `xxxId` 字段，查询时通过 Controller 的 `join` 配置或 QueryBuilder 关联（见 controller.md、service.md）。

## 虚拟列（MySQL）

需要按计算结果筛选时，用生成列代替在查询里写函数：

```ts
@Index()
@Column({
  type: 'varchar',
  length: 7,
  asExpression: "DATE_FORMAT(createTime, '%Y-%m')",
  generatedType: 'VIRTUAL',
  comment: '月份',
})
month: string;

// 从 json 字段中提取值，方便建索引和筛选
@Index()
@Column({
  asExpression: "JSON_EXTRACT(refund, '$.status')",
  generatedType: 'VIRTUAL',
  comment: '退款状态',
  nullable: true,
})
refundStatus: number;
```

虚拟列只能读，不能写入。

## 数据库配置

在 `server/src/config/config.local.ts`（本地）和 `config.prod.ts`（生产）中配置 `typeorm.dataSource.default`：

```ts
typeorm: {
  dataSource: {
    default: {
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'cool',
      // 自动同步表结构，只能在本地开启，线上开启可能丢数据
      synchronize: true,
      logging: false,
      charset: 'utf8mb4',
      cache: true,
      entities: ['**/modules/*/entity'],
      // 多租户订阅者，不要去掉
      subscribers: [TenantSubscriber],
    },
  },
},
```

切换数据库：

- PostgreSQL：`pnpm --filter server add pg`，`type: 'postgres'`，端口 5432。
- SQLite：`pnpm --filter server add sqlite3`，`type: 'sqlite'`，`database: path.join(__dirname, '../../cool.sqlite')`。

## 事务

```ts
import { Provide } from '@midwayjs/core';
import { BaseService, CoolTransaction } from '@cool-midway/core';
import { QueryRunner } from 'typeorm';

@Provide()
export class ShopOrderService extends BaseService {
  /**
   * queryRunner 由框架自动注入到最后一个参数，调用方不用传
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async create(params: any, queryRunner?: QueryRunner) {
    await queryRunner.manager.insert(ShopOrderEntity, { ... });
    await queryRunner.manager.update(ShopGoodsEntity, { id: params.goodsId }, { ... });
  }
}
```

- 事务内的数据库操作必须通过 `queryRunner.manager` 执行，用注入的 Repository 不在事务里。
- 方法内的数据库操作要逐个 `await`，不要并发执行。
- 抛出异常会自动回滚，并以 `CoolCommException`（同样的错误信息）继续向上抛出，方法内部不需要自己 try/catch。
