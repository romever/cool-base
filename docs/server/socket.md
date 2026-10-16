# WebSocket

项目默认没有启用 WebSocket。需要实时通讯时，接入 Midway 官方的 Socket.io 组件（v4）：<https://midwayjs.org/docs/extensions/socketio>。

## 接入步骤

1. 安装：`pnpm --filter server add @midwayjs/socketio@3`
2. 在 `server/src/configuration.ts` 的 `imports` 中加入：

```ts
import * as socketio from '@midwayjs/socketio';

@Configuration({
  imports: [
    // ...
    socketio,
  ],
})
```

3. `server/src/config/config.default.ts` 中配置：

```ts
socketIO: {
  upgrades: ['websocket'],
},
```

## 服务端

放在模块的 `socket/` 目录：

```ts
import { WSController, OnWSConnection, OnWSMessage, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/socketio';

@WSController('/')
export class ChatSocketController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnection() {
    // 握手参数在 this.ctx.handshake.auth / query 中，在这里校验 token
    this.ctx.emit('data', '连接成功');
  }

  @OnWSMessage('message')
  async onMessage(data) {
    // ...
  }
}
```

## 客户端

```ts
import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:8001', { auth: { token: 'xxx' } });
socket.on('data', msg => console.log(msg));
```

## 多实例部署

多进程或多实例时，需要 Redis 适配器让各进程之间能互相广播：

```ts
import { createRedisAdapter } from '@midwayjs/socketio';

socketIO: {
  adapter: createRedisAdapter({ host: '127.0.0.1', port: 6379 }),
},
```
