# 事件

用来解耦模块之间的联动，例如"用户信息更新后，其他模块各自刷新自己的数据"。事件监听放在模块的 `event/` 目录。

## 监听

```ts
import { CoolEvent, Event } from '@cool-midway/core';

@CoolEvent()
export class ShopUserEvent {
  @Event('updateUser')
  async updateUser(user, extra) {
    // ...
  }
}
```

## 发送

```ts
import { Inject } from '@midwayjs/core';
import { CoolEventManager } from '@cool-midway/core';

@Inject()
coolEventManager: CoolEventManager;

// 当前进程内触发
this.coolEventManager.emit('updateUser', { id: 1 }, 'extra');

// 多进程（pm2 cluster 等）：通知所有进程
await this.coolEventManager.globalEmit('updateUser', false, { id: 1 });
// 多进程：随机通知其中一个进程
await this.coolEventManager.globalEmit('updateUser', true, { id: 1 });
```

`globalEmit(event, random, ...args)`：`random` 为 `true` 时只随机发给一个进程。

## 框架内置事件

| 事件 | 触发时机 |
| --- | --- |
| `onReady` | 框架组件就绪 |
| `onDBInit` | 各模块 `db.json` 导入流程结束后 |
| `onMenuImport` | 收集到各模块 `menu.json` 数据时，参数为菜单数据（base 模块据此写入菜单表） |
| `onServerReady` | 服务启动完成，每个进程都会触发 |
| `onServerReadyOnce` | 服务启动完成，集群中只触发一次 |
