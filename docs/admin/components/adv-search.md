# cl-adv-search 示例

高级搜索抽屉。

示例按场景分节，先看目录，再用 `## 小节名` 搜索定位，不需要通读全文。示例中 `service: 'test'` 是本地模拟数据，真实页面换成 `service.模块.实体`。

目录：

- 起步
- 自定义

## 起步

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!--【很重要】高级搜索组件按钮 -->
			<cl-adv-btn />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!--【很重要】高级搜索组件 -->
		<cl-adv-search ref="AdvSearch" />
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useAdvSearch, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			label: '姓名',
			prop: 'name',
			minWidth: 140
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		}
	]
});

// cl-adv-search 配置
//【很重要】该组件基于 cl-form 故很多示例都可复用
const AdvSearch = useAdvSearch({
	// 配置如 cl-form 一样
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input',
				props: {
					clearable: true
				}
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			component: {
				name: 'el-input',
				props: {
					clearable: true
				}
			}
		},
		{
			label: '工作',
			prop: 'occupation',
			component: {
				name: 'cl-select',
				props: {
					tree: true,
					checkStrictly: true,
					options: dict.get('occupation')
				}
			}
		}
	]
});

function refresh(params?: any) {
	Crud.value?.refresh(params);
}

</script>

```

## 自定义

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!--【很重要】高级搜索组件按钮 -->
			<cl-adv-btn>更多搜索</cl-adv-btn>
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!--【很重要】高级搜索组件 -->
		<cl-adv-search ref="AdvSearch">
			<!-- 自定义按钮 -->
			<template #slot-btn>
				<el-button @click="toSearch">自定义</el-button>
			</template>
		</cl-adv-search>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useAdvSearch, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			label: '姓名',
			prop: 'name',
			minWidth: 140
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		}
	]
});

// cl-adv-search 配置
//【很重要】该组件基于 cl-form 故很多示例都可复用
const AdvSearch = useAdvSearch({
	// 配置如 cl-form 一样
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input',
				props: {
					clearable: true
				}
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			component: {
				name: 'el-input',
				props: {
					clearable: true
				}
			}
		},
		{
			label: '工作',
			prop: 'occupation',
			component: {
				name: 'cl-select',
				props: {
					tree: true,
					checkStrictly: true,
					options: dict.get('occupation')
				}
			}
		}
	],

	title: '更多搜索',
	size: '50%',
	op: ['close', 'search', 'slot-btn']
});

function refresh(params?: any) {
	Crud.value?.refresh(params);
}

// 自定义搜索
function toSearch() {
	refresh({ page: 1 });
}

</script>

```