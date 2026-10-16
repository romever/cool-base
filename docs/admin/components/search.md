# cl-search 示例

列表上方的行内搜索：布局、折叠、自定义组件。

示例按场景分节，先看目录，再用 `## 小节名` 搜索定位，不需要通读全文。示例中 `service: 'test'` 是本地模拟数据，真实页面换成 `service.模块.实体`。

目录：

- 起步
- 折叠
- 自定义
- 布局
- 使用插件

## 起步

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!--【很重要】搜索组件 -->
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useSearch, useTable } from '@cool-vue/crud';
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

// cl-search 配置
//【很重要】该组件基于 cl-form 故很多示例都可复用
const Search = useSearch({
	// 配置如 cl-form 一样
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input',
				props: {
					clearable: true,

					// 值改变的时候刷新列表
					onChange(val: string) {
						refresh({
							name: val,
							page: 1
						});
					}
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

	onChange(data, prop) {
		console.log(data, prop);
	}
});

function refresh(params?: any) {
	Crud.value?.refresh(params);
}

</script>

```

## 折叠

```vue
<template>
	<cl-crud ref="Crud">
		<!--【collapse】折叠参数，【inline】是否行内 -->
		<cl-search ref="Search" reset-btn collapse :inline="false" />

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useSearch, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { range } from 'lodash-es';

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

// cl-search 配置
const Search = useSearch({
	items: [
		...range(20).map(i => {
			return {
				label: '输入框',
				prop: `T${i + 1}`,
				component: {
					name: 'el-input'
				}
			};
		})
	]
});

function refresh(params?: any) {
	Crud.value?.refresh(params);
}

</script>
x

```

## 自定义

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!--【很重要】搜索组件 -->
			<cl-search
				ref="Search"
				:reset-btn="true"
				:on-load="onLoad"
				:on-search="onSearch"
			>
				<!-- 自定义按钮 -->
				<template #buttons="scope">
					<el-button @click="toSearch(scope)">自定义按钮</el-button>
				</template>
			</cl-search>
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useSearch, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { ElMessage } from 'element-plus';

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

// cl-search 配置
//【很重要】该组件基于 cl-form 故很多示例都可复用
const Search = useSearch({
	// 配置如 cl-form 一样
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input',
				props: {
					clearable: true,

					// 值改变的时候刷新列表
					onChange(val: string) {
						refresh({
							name: val,
							page: 1
						});
					}
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

// cl-search 初始化
function onLoad(data: any) {
	data.name = '白小纯';
}

// cl-search 配置 onSearch 后，必须使用 next 方法继续请求
function onSearch(data: any, { next }: { next: (data: any) => void }) {
	ElMessage.info('开始搜索');
	// 这边可以处理其他事务
	next(data);
}

// 自定义搜索，data 为表单数据
function toSearch(data: any) {
	ElMessage.info('自定义搜索');

	refresh({
		page: 1,
		...data
	});
}

</script>

```

## 布局

```vue
<template>
	<cl-crud ref="Crud">
		<!--【很重要】搜索组件 -->
		<cl-search ref="Search" :reset-btn="true" />

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useSearch, useTable } from '@cool-vue/crud';
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

// cl-search 配置
//【很重要】该组件基于 cl-form 故很多示例都可复用
const Search = useSearch({
	// 取消行内表单模式
	inline: false,

	// 表单参数
	props: {
		labelPosition: 'top'
	},

	// 配置如 cl-form 一样
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input',
				props: {
					clearable: true,

					// 值改变的时候刷新列表
					onChange(val: string) {
						refresh({
							name: val,
							page: 1
						});
					}
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

## 使用插件

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-flex1 />
			<!--【很重要】搜索组件 -->
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useSearch, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { Plugins } from '/#/crud';

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

// cl-search 配置
const Search = useSearch({
	// 【很重要】自动读取 service 下的 search 数据
	plugins: [
		Plugins.Search.setAuto({
			customComponent(field) {
				if (field.propertyName == 'name') {
					return {
						name: 'cl-select',
						props: {
							options: [
								{
									label: '张三',
									value: '1'
								},
								{
									label: '李四',
									value: '2'
								}
							]
						}
					};
				}

				// null 则不操作，按系统默认操作
				return null;
			}
		})
	]
});

function refresh(params?: any) {
	Crud.value?.refresh(params);
}

</script>

```