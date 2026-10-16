# cl-upsert 示例

新增/编辑/详情弹窗表单：模式、事件钩子、hook。

示例按场景分节，先看目录，再用 `## 小节名` 搜索定位，不需要通读全文。示例中 `service: 'test'` 是本地模拟数据，真实页面换成 `service.模块.实体`。

目录：

- 起步
- 打开、关闭、提交等事件
- Hook的使用
- 新增、编辑、详情模式

## 起步

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 打开新增表单的按钮 -->
			<cl-add-btn />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!--【很重要】新增、编辑的表单组件 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
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
		},
		{
			type: 'op',
			// edit 打开编辑表单
			buttons: ['edit', 'delete']
		}
	]
});

// cl-upsert 配置
//【很重要】该组件基于 cl-form 故很多示例都可复用
const Upsert = useUpsert({
	// 配置如 cl-form 一样
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input'
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			component: {
				name: 'el-input'
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

</script>

```

## 打开、关闭、提交等事件

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 打开新增表单的按钮 -->
			<cl-add-btn />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!--【很重要】新增、编辑的表单组件 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { useCool } from '/@/cool';

const { service } = useCool();
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
		},
		{
			type: 'op',
			// edit 打开编辑表单
			buttons: ['edit', 'delete']
		}
	]
});

// cl-upsert 配置
const Upsert = useUpsert({
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input'
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			component: {
				name: 'el-input'
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

	// 以下事件按顺序触发

	// 弹窗打开的事件，这个时候还未有表单数据
	onOpen() {
		console.log('onOpen');
	},

	// 获取详情，编辑的时候会触发
	async onInfo(data, { next, done }) {
		// 不配置 onInfo 的时候默认执行 next(data)，调用 service 的 info 接口获取详情
		// next(data);

		// 自定义，需要对请求数据进行处理或者返回处理后的数据
		const res = await next({
			id: data.id
		});

		done({
			...res,
			name: `[${res.name}]`
		});
	},

	// 弹窗打开后，已经得到了表单数据
	onOpened(data) {
		// 判定是否编辑模式
		if (Upsert.value?.mode == 'update') {
			// 对数据处理
			data.phone += '000';
		}
	},

	// 提交事件的钩子
	// data 表单提交数据
	// next 继续往下执行
	// done 关闭加载
	// close 关闭弹窗
	async onSubmit(data, { next, done, close }) {
		// 不配置 onSubmit 的时候默认执行 next(data)，提交后会去请求 service 的 update/add 接口
		// next(data);

		// 自定义如下
		// 场景1：提交时对参数额外的处理
		// next({
		// 	...data,
		// 	status: 1,
		// 	createTime: dayjs().format("YYYY-MM-DD")
		// });

		// 场景2：提交前、后的操作
		// 之前，模拟获取 userId
		const userId = await service.base.sys.user.info({ id: 1 });

		// 返回值
		const res = await next({
			userId,
			data
		});

		// 之后
		// console.log(res);
	},

	// 关闭时触发
	onClose(action, done) {
		// action 关闭的类型
		console.log('action，', action);

		// 使用 done 关闭窗口
		done();
	},

	// 关闭后触发
	onClosed() {
		console.log('onClosed');
	}
});

</script>

```

## Hook的使用

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 打开新增表单的按钮 -->
			<cl-add-btn />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!--【很重要】新增、编辑的表单组件 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
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
			label: '省市区',
			prop: 'pca',
			formatter(row) {
				return row.province ? row.province + '-' + row.city + '-' + row.district : '-';
			},
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
		},
		{
			type: 'op',
			buttons: ['edit', 'delete']
		}
	]
});

// cl-upsert 配置
const Upsert = useUpsert({
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input'
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			component: {
				name: 'el-input'
			}
		},
		{
			label: '省市区',
			prop: 'pca2',

			//【很重要】hook 参数配置
			hook: {
				bind(value, { form }) {
					// 将3个参数合并成一个数组，带入级联选择器
					return [form.province, form.city, form.district];
				},
				submit(value, { form, prop }) {
					// 提交的时候将数组拆分成3个字段提交
					const [province, city, district] = value || [];
					form.province = province;
					form.city = city;
					form.district = district;

					// 删除 prop 绑定值
					form[prop] = undefined;
				}
			},
			// 注册到全局后可直接使用，注册代码看 ./reg-pca2.ts
			// hook: "pca2",

			component: {
				name: 'cl-distpicker'
			}
		},
		{
			label: '标签',
			prop: 'labels',
			//【很重要】使用内置方法，避免一些辣鸡后端要你这么传给他
			hook: {
				// labels 的数据为 1,2,3

				// 绑定的时候将 labels 按 , 分割成数组
				bind: ['split', 'number'],

				// 提交的时候将 labels 拼接成字符串
				submit: ['join']
			},
			component: {
				name: 'el-select',
				props: {
					multiple: true
				},
				options: [
					{
						label: '帅气',
						value: 1
					},
					{
						label: '多金',
						value: 2
					},
					{
						label: '有才华',
						value: 3
					}
				]
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

</script>

```

## 新增、编辑、详情模式

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 打开新增表单的按钮 -->
			<cl-add-btn />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!--【很重要】新增、编辑的表单组件 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
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
		},
		{
			type: 'op',
			width: 240,
			buttons: ['info', 'edit', 'delete']
		}
	]
});

// cl-upsert 配置
const Upsert = useUpsert({
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input'
			}
		},
		//【很重要】只有返回方法的时候才能使用 Upsert
		() => {
			return {
				label: '手机号',
				prop: 'phone',

				// 新增的时候隐藏
				// hidden: Upsert.value?.mode == "add",

				component: {
					name: 'el-input',
					props: {
						// 编辑的时候禁用
						disabled: Upsert.value?.mode == 'update'
					}
				}
			};
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
	onOpen() {
		ElMessage.info(`当前模式：` + Upsert.value?.mode);
	}
});

</script>

```