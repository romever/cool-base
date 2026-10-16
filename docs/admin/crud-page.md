# 标准增删改查页面

绝大多数后台页面都是"列表 + 搜索 + 新增/编辑弹窗"，用 `cl-crud` 一套组件完成。下面是推荐的标准写法，新页面以它为起点修改。

前提：后端已有 `/admin/shop/goods` 的 CRUD 接口，并且重启过后端，`build/cool/eps.d.ts` 中能找到 `service.shop.goods` 和 `Eps.ShopGoodsEntity`。

## 完整示例

`admin/src/modules/shop/views/goods.vue`：

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<!-- 关键字搜索，对应后端 keyWordLikeFields -->
			<cl-search-key :placeholder="$t('搜索标题、编码')" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'shop-goods'
});

import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCool } from '/@/cool';
import { useDict } from '/$/dict';

const { service } = useCool();
const { dict } = useDict();
const { t } = useI18n();

// 页面用到的所有选项
const options = reactive({
	status: [
		{ label: t('下架'), value: 0, type: 'danger' },
		{ label: t('上架'), value: 1, type: 'success' }
	]
});

// cl-crud：绑定 service，加载后刷新一次
const Crud = useCrud({ service: service.shop.goods }, app => {
	app.refresh();
});

// cl-table：列配置
const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: t('图片'), prop: 'cover', minWidth: 100, component: { name: 'cl-image', props: { size: 50 } } },
		{ label: t('标题'), prop: 'title', minWidth: 160 },
		{ label: t('编码'), prop: 'code', minWidth: 120 },
		{ label: t('价格'), prop: 'price', minWidth: 100, sortable: 'custom' },
		// 字典表中的字典
		{ label: t('类型'), prop: 'type', minWidth: 100, dict: dict.get('goodsType') },
		// 本地选项，自动显示为带颜色的标签
		{ label: t('状态'), prop: 'status', minWidth: 100, dict: options.status },
		{ label: t('创建时间'), prop: 'createTime', minWidth: 170, sortable: 'desc' },
		// 操作栏，默认有 edit、delete，可选 info
		{ type: 'op', buttons: ['edit', 'delete'] }
	]
});

// cl-upsert：新增、编辑表单
const Upsert = useUpsert<Eps.ShopGoodsEntity>({
	dialog: { width: '800px' },
	items: [
		{ label: t('标题'), prop: 'title', required: true, component: { name: 'el-input' } },
		{ label: t('编码'), prop: 'code', span: 12, required: true, component: { name: 'el-input' } },
		{ label: t('价格'), prop: 'price', span: 12, value: 0, component: { name: 'el-input-number', props: { min: 0, precision: 2 } } },
		{ label: t('类型'), prop: 'type', span: 12, component: { name: 'cl-select', props: { options: dict.get('goodsType') } } },
		{ label: t('状态'), prop: 'status', span: 12, value: 1, component: { name: 'el-radio-group', options: options.status } },
		{ label: t('图片'), prop: 'cover', component: { name: 'cl-upload' } },
		{ label: t('详情'), prop: 'content', component: { name: 'cl-editor-wang' } }
	]
});
</script>
```

做完后到后台「系统管理 / 菜单列表」新增菜单：节点路由 `/shop/goods`，文件路径 `modules/shop/views/goods.vue`，并给它添加对应的权限。

## 常见需求速查

| 需求 | 做法 | 详见 |
| --- | --- | --- |
| 按某个字段筛选 | `<cl-filter label="状态"><cl-select :options="options.status" prop="status" :width="120" /></cl-filter>`，后端 `fieldEq` 要包含该字段 | components/crud.md |
| 多个搜索条件 | `<cl-search ref="Search" />` + `useSearch({ items })` | components/search.md |
| 高级搜索抽屉 | `<cl-adv-btn />` + `<cl-adv-search ref="AdvSearch" />` + `useAdvSearch({ items })` | components/adv-search.md |
| 首次请求带默认参数 | `app.refresh({ status: 1 })` | components/crud.md「起步」 |
| 刷新列表 | `Crud.value?.refresh()` | |
| 表单项根据其他字段显示/隐藏 | `hidden: ({ scope }) => scope.type != 1` | components/form.md「隐藏/显示」 |
| 新增和编辑显示不同字段 | `hidden: () => Upsert.value?.mode == 'update'` | components/upsert.md「新增、编辑、详情模式」 |
| 提交前转换数据 | `onSubmit(data, { next }) { next({ ...data, xxx }) }` | components/upsert.md「打开、关闭、提交等事件」 |
| 编辑时数据要另外处理 | `onInfo(data, { done }) { done(data) }` / `onOpened(data) {}` | 同上 |
| 自定义操作按钮 | `buttons: ({ scope }) => ['edit', { label: '审核', onClick() {} }]` | components/table.md「操作栏」 |
| 自定义列内容 | 模板中 `<template #column-xxx="{ scope }">`，xxx 为 prop | components/table.md「插槽的使用」 |
| 表单项自定义内容 | 模板中 `<template #slot-xxx="{ scope }">`，表单项写 `component: { name: 'slot-xxx' }` | components/form.md「组件渲染」 |
| 表格内直接切换开关 | 列配置 `component: { name: 'cl-switch' }` | components/table.md「组件渲染」 |
| 导入、导出 Excel | `<cl-import-btn />`、`<cl-export-btn :columns="Table?.columns" />` | components/crud.md「完整示例」 |
| 调用非 CRUD 接口 | `service.shop.goods.stat().then(...).catch(err => ElMessage.error(err.message))` | |

## 常用组件

| 组件 | 用途 |
| --- | --- |
| `cl-select` | 下拉，支持 `options`、`tree`，放在 `cl-filter` 中带 `prop` 可直接筛选列表 |
| `cl-upload` | 上传图片/文件，`type: 'file'` 为文件，`multiple` 多个，`isSpace` 从文件空间选择 |
| `cl-editor-wang` | 富文本编辑器 |
| `cl-image` | 图片预览 |
| `cl-switch` | 表格内开关，切换后自动调用 update |
| `cl-date-picker` | 日期选择 |
| `cl-distpicker` | 省市区选择 |
| `cl-dialog` | 弹窗（带全屏、拖动） |
| `cl-form-card` | 表单内的分组卡片 |
