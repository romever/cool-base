# 管理端模块与插件

`src/modules/<模块>` 放业务模块，`src/plugins/<插件>` 放与业务无关、可复用的能力（上传、编辑器、图表等）。两者结构和配置方式完全相同，启动时自动扫描加载。

## 目录结构

```
modules/shop/
├── views/        视图路由（在主布局内显示），一般由菜单的 viewPath 指向
├── pages/        页面路由（独立全屏页面，如登录页）
├── components/   组件
├── directives/   指令，文件名即指令名
├── hooks/        组合式函数
├── store/        Pinia 状态
├── locales/      国际化：zh-cn.json、zh-tw.json、en.json
├── static/       静态资源
├── config.ts     必须，模块配置
└── index.ts      模块对外导出
```

约定的目录名不能改，用不到的可以不建。

## 路由

`views`、`pages` 下的页面不会自动注册路由，有两种注册方式：

1. **通过菜单注册（推荐）**：在后端模块的 `menu.json` 中添加菜单节点，`router` 填 `/shop/goods`，`viewPath` 填 `modules/shop/views/goods.vue`（见 `docs/server/module.md`）。这种方式受权限控制。
2. **在 config.ts 中注册**：用于不需要权限控制的页面，例如详情页、带参数的页面。

```ts
import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
  return {
    // 在主布局内显示
    views: [
      {
        // 支持动态参数，? 表示可选
        path: '/shop/goods/detail/:id?',
        meta: { label: '商品详情' },
        component: () => import('./views/detail.vue'),
      },
    ],
    // 独立页面
    pages: [
      {
        path: '/shop/screen',
        meta: { label: '数据大屏' },
        component: () => import('./pages/screen.vue'),
      },
    ],
  };
};
```

页面需要 keep-alive 缓存时，`name` 必须和路由对应：`/shop/goods` → `shop-goods`，`/shop/goods-sku` → `shop-goods-sku`。

```ts
defineOptions({
  name: 'shop-goods',
});
```

## config.ts 完整配置项

在 VS Code 中输入 `module-config` 可生成模板。

```ts
import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
  return {
    // 是否启用
    enable: true,
    // 名称、描述等信息，会显示在插件管理中
    label: '商城',
    description: '商品、订单管理',
    author: '',
    version: '1.0.0',
    updateTime: '2026-01-01',
    // 加载顺序，值越大越先加载
    order: 0,
    // 提供给外部读取的参数，读取方式：module.config('shop')
    options: {},
    // 忽略配置
    ignore: {
      // 不显示进度条的请求
      NProgress: [],
      // 不需要 token 的路由
      token: [],
    },
    // 全局注册的组件
    components: Object.values(import.meta.glob('./components/**/*')),
    // 视图路由、页面路由，见上文
    views: [],
    pages: [],
    // 顶部工具栏组件
    toolbar: {
      order: 1,
      pc: true,
      h5: true,
      component: import('./components/toolbar.vue'),
    },
    // 注入到根节点的全局组件
    index: {
      component: import('./components/index.vue'),
    },
    // 模块安装时触发，可注册组件、指令
    install(app) {},
    // 模块加载时触发，可预加载数据，返回值会传给其他模块的 onLoad
    async onLoad(events) {},
  };
};
```

### onLoad 的用法

`base` 模块的 `onLoad` 会导出 `hasToken`，其他模块可以借它在登录后加载数据：

```ts
export default (): ModuleConfig => {
  return {
    onLoad({ hasToken }) {
      // 已登录时才执行，例如预加载本模块要用的数据
      hasToken(async () => {
        await service.report.group.list();
      });
    },
  };
};
```

## 全局组件

`config.ts` 中 `components` 里的组件会全局注册，组件必须声明 `name`，模板里直接用 `<shop-goods-select />`。

## 指令

`directives/` 下每个文件注册为一个指令，文件名即指令名：

```ts
// directives/focus.ts
export default {
  mounted(el) {
    el.querySelector('input')?.focus();
  },
};
```

使用：`<div v-focus></div>`。

## store

使用 Pinia 的 setup 写法：

```ts
// store/cart.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCartStore = defineStore('shop-cart', () => {
  const count = ref(0);

  function add() {
    count.value += 1;
  }

  return { count, add };
});
```

导出方式参考 `src/modules/base/store/index.ts`。

## index.ts：模块对外导出

其他模块需要用到本模块的状态和方法时，通过 `use + 模块名` 统一导出：

```ts
// modules/shop/index.ts
import { useCartStore } from './store/cart';

export function useShop() {
  return {
    cart: useCartStore(),
  };
}
```

使用：

```ts
import { useShop } from '/$/shop';

const { cart } = useShop();
```
