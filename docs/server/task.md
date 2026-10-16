# 定时任务

后台只用定时任务做**自身的维护工作**，比如清理过期日志。业务定时任务（订单超时、数据统计、消息推送等）归 C 端服务自己调度，不放在后台，原因见 `integration.md`。

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

`@Job` 在每个进程、每个实例里都会执行。后台的维护任务要做到可以重复执行（幂等），比如"删除 N 天前的日志"执行多次结果一样。
