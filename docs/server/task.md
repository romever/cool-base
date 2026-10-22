# 定时任务

`@Job` 在后端 API 进程里按时间触发，适合**短小、可重复执行**的工作，比如清理过期日志。

业务上的定时处理按形态区分（见根目录 `AGENTS.md`「两种形态」）：

- **附属后台**：订单超时、数据统计、消息推送等归 C 端服务自己调度，不放在后台，原因见 `integration.md`。
- **独立业务系统**：可以用 `@Job` 定时触发，但 Job 里只往任务表插入记录，耗时的执行交给 worker 进程（见 `worker.md`）。插入时用唯一索引（例如「任务类型 + 日期」）防止多实例重复创建。

定时任务基于 `@midwayjs/cron`（已在 `server/src/configuration.ts` 中启用），文档：<https://midwayjs.org/docs/extensions/cron>。

## 写法

放在模块的 `job/` 目录。框架自带的例子是 `server/src/modules/base/job/log.ts`（每天清理请求日志）：

```ts
import { Job, IJob } from '@midwayjs/cron';
import { FORMAT, ILogger, Inject } from '@midwayjs/core';
import { BaseSysLogService } from '../service/sys/log';

/**
 * 日志定时任务
 */
@Job({
  cronTime: FORMAT.CRONTAB.EVERY_DAY,
  start: true,
})
export class BaseLogJob implements IJob {
  @Inject()
  baseSysLogService: BaseSysLogService;

  @Inject()
  logger: ILogger;

  async onTick() {
    await this.baseSysLogService.clear();
  }
}
```

- 任务逻辑写在 Service 里，Job 只负责调度和记录日志。
- `cronTime` 可以用 `FORMAT.CRONTAB` 中的常量，也可以写 cron 表达式。

## cron 表达式

6 位时第一位是秒：

```
秒(可选) 分 时 日 月 周
*/5 * * * * *   每 5 秒
0 */5 * * * *   每 5 分钟
0 0 1 * * *     每天 1 点
0 0 0 * * 0     每周日 0 点
0 0 0 1 * *     每月 1 号 0 点
```

## 多实例部署

`@Job` 在每个进程、每个实例里都会执行。Job 要做到可以重复执行（幂等），比如"删除 N 天前的日志"执行多次结果一样。
