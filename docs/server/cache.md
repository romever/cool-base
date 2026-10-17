# 缓存

基于 `@midwayjs/cache-manager`。默认使用框架自带的本地文件缓存（`CoolCacheStore`），单机开发不需要 Redis。缓存、上传文件、插件文件都存在启动目录下的 `data/`（即 `server/data/`，已加入 `.gitignore`，见 `server/src/comm/path.ts`）。容器部署时要把这个目录挂载出来。

## 使用

```ts
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

@Provide()
export class ShopGoodsService {
  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  async demo() {
    await this.midwayCache.set('key', { a: 1 });
    // 第三个参数是过期时间，单位毫秒
    await this.midwayCache.set('key', { a: 1 }, 10 * 1000);
    await this.midwayCache.get('key');
    await this.midwayCache.del('key');
  }
}
```

## 方法缓存

结果短时间内不变的查询（排行榜、推荐位等），用 `@CoolCache` 缓存整个方法的返回值：

```ts
import { Provide } from '@midwayjs/core';
import { CoolCache } from '@cool-midway/core';

@Provide()
export class ShopRankService {
  // 缓存 5 秒，单位毫秒
  @CoolCache(5000)
  async hot() {
    return [];
  }
}
```

`@CoolCache` 只用在 Service 中。

## 切换为 Redis

多实例部署时必须换成 Redis，否则各实例缓存不一致、登录状态不共享。

1. 安装：`pnpm --filter server add cache-manager-ioredis-yet`
2. 修改 `server/src/config/config.default.ts`，把 `cacheManager` 换成文件中已注释好的 Redis 配置：

```ts
import { redisStore } from 'cache-manager-ioredis-yet';

cacheManager: {
  clients: {
    default: {
      store: redisStore,
      options: { host: '127.0.0.1', port: 6379, password: '', db: 0, ttl: 0 },
    },
  },
},
```
