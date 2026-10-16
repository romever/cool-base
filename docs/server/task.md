# 定时任务与队列

有三种方式，按场景选：

| 方式 | 适用场景 | 依赖 |
| --- | --- | --- |
| 代码中的 `@Job` | 固定不变的系统任务，例如清理日志 | 无（`@midwayjs/cron`，已启用） |
| 后台「任务管理」配置的任务 | 需要在后台随时启停、改周期的任务 | 单机无依赖；多实例需要 Redis |
| 队列 `@CoolQueue` | 异步处理、延迟执行、削峰，例如订单超时取消 | Redis + `@cool-midway/task` |

## 代码中的定时任务

```ts
import { Job, IJob } from '@midwayjs/cron';
import { FORMAT } from '@midwayjs/core';

@Job({
  cronTime: FORMAT.CRONTAB.EVERY_PER_30_MINUTE,
  start: true,
})
export class ShopOrderCheckJob implements IJob {
  async onTick() {
    // ...
  }
}
```

放在模块的 `job/` 或 `schedule/` 目录。多实例部署时每个实例都会执行，需要自己保证幂等或只在一个实例开启。

## 后台配置的任务

1. 写一个 Service 方法作为任务入口：

```ts
@Provide()
export class ShopTaskService extends BaseService {
  async syncStock(shopId?: number) {
    // ...
  }
}
```

2. 在后台「系统管理 / 任务管理」新建任务，「服务」一栏填 `实例名.方法名(参数)`，例如 `shopTaskService.syncStock(1)`。实例名是类名首字母小写。参考 `server/src/modules/task/service/demo.ts` 和 `task/db.json` 中自带的示例任务。

任务的启停要通过后台或 `TaskInfoService` 操作，直接改数据库里的状态不会生效。

cron 格式（6 位时第一位是秒）：

```
秒(可选) 分 时 日 月 周
*/5 * * * * *   每 5 秒
0 */5 * * * *   每 5 分钟
0 0 1 * * *     每天 1 点
0 0 0 * * 0     每周日 0 点
0 0 0 1 * *     每月 1 号 0 点
```

## 启用 Redis 分布式任务和队列

多实例部署或需要队列时开启：

1. 在 `server/src/configuration.ts` 中取消 `task` 的注释（`import * as task from '@cool-midway/task'`，并加入 `imports`）。
2. 在 `server/src/config/config.default.ts` 的 `cool` 中配置 Redis（>= 5，推荐 7）：

```ts
cool: {
  redis: { host: '127.0.0.1', port: 6379, password: '', db: 0 },
  // Redis 集群写成数组：[{ host, port }, ...]
},
```

启用后，后台配置的任务会自动切换为基于 Redis（bullmq）调度，集群内不会重复执行。

## 队列

放在模块的 `queue/` 目录。

普通队列：有数据时自动调用 `data` 消费。

```ts
import { BaseCoolQueue, CoolQueue } from '@cool-midway/task';

@CoolQueue()
export class ShopOrderQueue extends BaseCoolQueue {
  async data(job: any, done: any) {
    console.log('收到数据', job.data);
    // 抛出异常会重试，默认 5 次
    done();
  }
}
```

单实例消费队列：`@CoolQueue({ type: 'single' })`，用法同普通队列，但集群中只有抢到锁的一个实例消费。

主动队列：由业务代码自己取数据。

```ts
@CoolQueue({ type: 'getter' })
export class ShopGetterQueue extends BaseCoolQueue {}

// 使用
const jobs = await this.shopGetterQueue.getters.getJobs(['wait'], 0, 0, true);
await jobs[0].remove();
```

发送数据：

```ts
@Inject()
shopOrderQueue: ShopOrderQueue;

// 第二个参数是 bullmq 的 JobsOptions：delay 延迟毫秒、attempts 重试次数、priority 优先级、jobId 去重等
await this.shopOrderQueue.add({ orderId: 1 }, { delay: 2 * 3600 * 1000 });
```

更多选项见 <https://docs.bullmq.io>。
