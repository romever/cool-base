# 后台异步任务

适用于**独立业务系统**（见根目录 `AGENTS.md`「两种形态」）：后台自己要执行耗时的业务处理，例如批量导入、生成报告、调用外部服务做检测或扫描。

## 什么时候用

| 场景 | 做法 |
| --- | --- |
| 几秒内能完成 | 直接在接口里同步执行，不用异步任务 |
| 耗时长、可能失败、要看进度或结果 | 用本文的「任务表 + worker 进程」 |
| 定时清理日志这类维护工作 | `@Job`，见 `task.md` |

## 整体结构

```
管理端 ──提交──▶ API 进程：校验参数，往任务表插一条「排队中」记录，立即返回任务 ID
                         │
                    任务表（数据库）  ◀──轮询抢占、回写状态和结果──  worker 进程
                         │
管理端 ◀──查询── API 进程：按任务 ID 查状态、结果
```

规则：

- **任务表是唯一的状态来源**。管理端看到的状态、结果、失败原因，全部来自任务表。
- **API 进程不执行耗时逻辑**，只写任务记录、查任务记录。
- **worker 是独立进程**。它崩溃、卡死或占满 CPU 都不会影响后台接口，也可以单独扩容、单独限制资源。
- 多个 worker 同时运行时，靠数据库行锁 `FOR UPDATE SKIP LOCKED` 抢任务，同一条任务只会被一个 worker 拿到。PostgreSQL 和 MySQL 8 都支持，SQLite 不支持。

默认不需要 Redis 和消息队列。只有遇到「延迟重试、限流、每秒大量任务」这类需求时，才引入 [BullMQ](https://docs.bullmq.io)，并且任务表依然是唯一的状态来源。

## 1. 任务表

和普通实体一样写在模块的 `entity/` 下，正常生成迁移。以「报表导出」为例：

```ts
// server/src/modules/report/entity/export.ts
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerJson } from '../../base/entity/base';

/**
 * 报表导出任务
 */
@Entity('report_export')
export class ReportExportEntity extends BaseEntity {
  @Index()
  @Column({
    comment: '状态',
    dict: ['排队中', '执行中', '成功', '失败'],
    default: 0,
  })
  status: number;

  @Column({ comment: '导出参数', type: 'json', transformer: transformerJson })
  params: any;

  // worker 抢到任务时写入，超过这个时间还在执行中，说明 worker 已经异常退出
  @Column({ comment: '执行截止时间', type: 'timestamp', nullable: true })
  deadlineAt: Date;

  @Column({ comment: '结果文件路径', nullable: true })
  filePath: string;

  @Column({ comment: '失败原因', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ comment: '提交人ID' })
  userId: number;
}
```

- 状态用 `dict` 声明，管理端列表直接显示中文状态。
- 失败原因要写成操作人员能看懂的话，管理端直接展示。
- 重试是**新建一条任务**，不覆盖原来的记录，方便追查每一次执行。

## 2. API 进程：提交和查询

提交时只插入记录：

```ts
// server/src/modules/report/service/export.ts
@Provide()
export class ReportExportService extends BaseService {
  @InjectEntityModel(ReportExportEntity)
  reportExportEntity: Repository<ReportExportEntity>;

  @Inject()
  ctx;

  /**
   * 提交导出任务，由 worker 异步执行
   */
  async submit(params: { month: string }) {
    const task = await this.reportExportEntity.save({
      status: 0,
      params,
      userId: this.ctx.admin.userId,
    });
    return { id: task.id };
  }
}
```

查询直接用通用 CRUD 的 `page` / `info`，管理端列表定时刷新即可看到进度。

## 3. worker 进程

入口放在 `server/src/workers/<名称>.ts`，执行逻辑放在模块的 `worker/` 目录：

```
server/src/
├── workers/
│   └── report_export.ts        进程入口：连接数据库、循环抢任务
└── modules/report/
    └── worker/
        └── export.ts           抢任务、执行、回写结果
```

worker 不启动 Midway，**不能用 `@Inject`、`@InjectEntityModel`、`@Config`**，直接用 `server/src/config/datasource.ts` 导出的 TypeORM 数据源。所以：

- 执行逻辑写成普通函数，参数传 `DataSource`。API 进程和 worker 都要用的逻辑，也写成这种普通函数，两边共用。
- 配置从环境变量读，缺失时用 `src/comm/env.ts` 的 `requireEnv` 直接报错。
- 这个数据源没有挂多租户的 `TenantSubscriber`，不会自动写入 `tenantId`。开启多租户时，写入数据要显式带上任务记录里的 `tenantId`。
- `repo.update()` 不会自动更新 `updateTime`，每次更新都要显式传 `updateTime: new Date()`。

### 执行逻辑

```ts
// server/src/modules/report/worker/export.ts
import { DataSource, LessThan } from 'typeorm';
import { ReportExportEntity } from '../entity/export';

// 单个任务最长执行时间
const TIMEOUT_MS = 30 * 60 * 1000;

/**
 * 抢一条排队中的任务并标记为执行中，没有任务时返回 null
 */
export async function claimExport(dataSource: DataSource) {
  return dataSource.transaction(async manager => {
    const task = await manager
      .createQueryBuilder(ReportExportEntity, 'a')
      .setLock('pessimistic_write')
      // 跳过其他 worker 已锁住的行，多个 worker 不会抢到同一条
      .setOnLocked('skip_locked')
      .where('a.status = :status', { status: 0 })
      .orderBy('a.id', 'ASC')
      .getOne();
    if (!task) return null;
    await manager.update(ReportExportEntity, task.id, {
      status: 1,
      deadlineAt: new Date(Date.now() + TIMEOUT_MS),
      updateTime: new Date(),
    });
    return task;
  });
}

/**
 * 执行任务并回写结果
 */
export async function runExport(dataSource: DataSource, task: ReportExportEntity) {
  const repo = dataSource.getRepository(ReportExportEntity);
  try {
    const filePath = await buildReport(task.params);
    await repo.update(task.id, { status: 2, filePath, updateTime: new Date() });
  } catch (error) {
    // 失败原因写回任务表给操作人员看，同时保留日志
    console.error(`[report-export][taskId=${task.id}] 执行失败`, error);
    await repo.update(task.id, {
      status: 3,
      errorMessage: error.message,
      updateTime: new Date(),
    });
  }
}

/**
 * 超过截止时间还在执行中的任务，说明 worker 已经异常退出，标记为失败
 */
export async function failExpiredExports(dataSource: DataSource) {
  await dataSource
    .getRepository(ReportExportEntity)
    .update(
      { status: 1, deadlineAt: LessThan(new Date()) },
      {
        status: 3,
        errorMessage: '执行超时或 worker 异常退出，请重新提交',
        updateTime: new Date(),
      }
    );
}
```

### 进程入口

```ts
// server/src/workers/report_export.ts
import dataSource from '../config/datasource';
import {
  claimExport,
  failExpiredExports,
  runExport,
} from '../modules/report/worker/export';

async function main() {
  // 收到退出信号后不再抢新任务，等当前任务执行完再退出
  let stopping = false;
  process.on('SIGTERM', () => (stopping = true));
  process.on('SIGINT', () => (stopping = true));

  await dataSource.initialize();
  console.info('[report-export] worker 已启动');
  while (!stopping) {
    await failExpiredExports(dataSource);
    const task = await claimExport(dataSource);
    if (!task) {
      // 没有任务时等 2 秒再查
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
    await runExport(dataSource, task);
  }
  await dataSource.destroy();
  console.info('[report-export] worker 已退出');
}

// 只在直接运行本文件时启动，被其他代码引入时不执行
if (require.main === module) {
  main().catch(error => {
    console.error('[report-export] worker 异常退出', error);
    process.exit(1);
  });
}
```

Midway 启动时会加载 `src/` 下的所有文件，worker 入口也会被 API 进程加载，文件顶层的代码会执行。所以：

- `require.main === module` 不能省，否则 API 进程里也会跑起一个 worker。
- 入口文件顶层只写 `import` 和函数定义。注册信号监听、连接数据库这类有副作用的代码，全部放进 `main()`。
- 不要 `import 'reflect-metadata'`：server 没有直接依赖它，构建后运行会报找不到模块。TypeORM 自己会加载它。

## 4. 启动

在 `server/package.json` 中加两条命令：

```json
"worker:report-export": "NODE_ENV=production node ./dist/workers/report_export.js",
"dev:worker:report-export": "cross-env NODE_ENV=local ts-node src/workers/report_export.ts"
```

- 本地开发：另开一个终端执行 `pnpm --filter server dev:worker:report-export`。
- 生产：和后端用同一个镜像，再起一个容器（或 pm2 进程），启动命令改成 `pnpm worker:report-export`，环境变量和后端一致。迁移只由后端的 `pnpm start` 执行，worker 不执行迁移。
- worker 要读写后端生成的文件时，挂载和后端相同的数据目录，见 `file.md`。

## 5. 执行外部命令

调用外部程序（扫描引擎、转换工具等）时：

- 用 `child_process.spawn`，参数用数组传入，`shell: false`，禁止把用户输入拼成命令行字符串。
- 设置执行超时，超时后先发 `SIGTERM`，过一段时间仍未退出再发 `SIGKILL`。
- 限制 stdout / stderr 的累计大小，超出后终止进程，避免输出过大撑爆内存。
- 执行不可信的内容（用户上传的代码包等）时，worker 容器要以非 root 用户运行，文件系统只读，只给工作目录挂可写的临时目录。
