# admin/AGENTS.md

管理端：Vue 3 + Vite 5 + Element Plus + Pinia + Tailwind + vue-i18n，CRUD 组件库 `@cool-vue/crud`，开发服务端口 9000，`/dev` 代理到后端 `127.0.0.1:8001`（见 `src/config/proxy.ts`）。

## 目录

```
admin/
├── build/cool/          eps.json / eps.d.ts，根据后端接口自动生成，不要手改
├── packages/            @cool-vue/crud、@cool-vue/vite-plugin 源码副本，只用于查阅
├── src/
│   ├── cool/            框架核心（路由、请求、模块加载），一般不改
│   ├── config/          index.ts 默认配置、dev.ts、prod.ts、proxy.ts
│   ├── modules/<模块>/  业务模块，结构见 docs/admin/module.md
│   └── plugins/<插件>/  通用插件：crud、upload、editor-wang、excel、echarts、i18n、theme 等
└── .vscode/*.code-snippets  代码片段（cl-crud、module-config 等关键字）
```

框架自带模块：`base`（登录、布局、用户、角色、菜单、参数、日志）、`dict`（字典）、`space`（文件空间）、`task`（任务）、`recycle`（回收站）、`user`（App 用户）、`helper`（AI 编码、插件管理）。

## 导入别名

| 别名 | 路径 |
| --- | --- |
| `/@` | `src` |
| `/$` | `src/modules` |
| `/#` | `src/plugins` |
| `/~` | `packages` |

## 硬性规则

- 文件、组件名用短横线连接：`goods-info.vue`。
- 页面要参与 keep-alive 缓存，必须用 `defineOptions({ name })` 声明 name，规则是路由 path 去掉开头的 `/` 后把 `/` 换成 `-`：`/shop/goods` → `shop-goods`。
- 请求后端一律用 `const { service } = useCool()` 中由 eps 生成的方法，例如 `service.shop.goods.page()`，不要手写 axios 请求或拼接口地址。可用的 service 和实体类型（`Eps.ShopGoodsEntity`）查 `build/cool/eps.d.ts`。
- 增删改查页面用 `cl-crud` 系列组件实现，不要用 `el-table`、`el-dialog` 自己拼。
- 下拉、状态等选项统一放在 `const options = reactive({...})` 中；来自字典表的用 `useDict()` 的 `dict.get('字典key')`。
- 页面上的文案用 `$t('中文')` / `t('中文')`，并在模块 `locales/` 中补充翻译。
- 后端新增或修改了接口、实体后，需要重启后端，再刷新前端（或重启 `pnpm dev:admin`），eps 才会更新。

## 按需阅读

| 任务 | 文档 |
| --- | --- |
| 新建模块或插件、`config.ts`、路由、全局组件、store | `../docs/admin/module.md` |
| 写一个标准的增删改查页面（**最常用**） | `../docs/admin/crud-page.md` |
| `cl-crud` 进阶：事件、自定义 service、选择表格 | `../docs/admin/components/crud.md` |
| `cl-table` 列配置、字典、格式化、操作栏、插槽、合计 | `../docs/admin/components/table.md` |
| `cl-upsert` 新增/编辑表单的模式和钩子 | `../docs/admin/components/upsert.md` |
| `cl-form` 表单布局、分组、联动、校验、自定义组件 | `../docs/admin/components/form.md` |
| `cl-search` 行内搜索 | `../docs/admin/components/search.md` |
| `cl-adv-search` 高级搜索 | `../docs/admin/components/adv-search.md` |

组件示例文档比较长，先看文件开头的目录，再搜索对应小节，不要通读。
