# cl-crud 示例

CRUD 容器：串联表格、表单、搜索、分页，绑定 service 完成增删改查。

示例按场景分节，先看目录，再用 `## 小节名` 搜索定位，不需要通读全文。示例中 `service: 'test'` 是本地模拟数据，真实页面换成 `service.模块.实体`。

目录：

- 完整示例
- 起步
- 修改文案 / 接口
- 事件监听
- 选择表格
- Service 配置
- 选择成员

## 完整示例

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />

			<!-- 新增按钮 -->
			<cl-add-btn />

			<!-- 批量删除按钮 -->
			<cl-multi-delete-btn />

			<!-- 筛选 -->
			<cl-filter label="状态筛选">
				<!-- 配置prop，选择后会自动过滤列表 -->
				<cl-select :options="options.status" prop="status" :width="120" />
			</cl-filter>

			<!-- 字典 -->
			<cl-filter label="工作（字典）">
				<cl-select
					tree
					:options="dict.get('occupation')"
					prop="occupation"
					:width="140"
					check-strictly
				/>
			</cl-filter>

			<cl-flex1 />

			<!-- 导入 -->
			<cl-import-btn template="/用户导入模版.xlsx" />

			<!-- 导出 -->
			<cl-export-btn :columns="Table?.columns" />

			<!-- 自定义列 -->
			<cl-column-custom
				:ref="setRefs('columnCustom')"
				:columns="Table?.columns"
			/>

			<!-- 关键字搜索 -->
			<cl-search-key placeholder="搜索姓名、手机号" :width="250" />

			<!-- 高级搜索按钮 -->
			<cl-adv-btn />
		</cl-row>

		<cl-row>
			<!-- 表格 -->
			<cl-table
				ref="Table"
				show-summary
				:summary-method="onSummaryMethod"
				:auto-height="false"
			>
				<!-- 展开信息 -->
				<template #column-detail="{ scope }">
					<div style="padding: 0 10px">
						<el-descriptions border :column="3">
							<el-descriptions-item label="ID">
								{{ scope.row.id }}
							</el-descriptions-item>

							<el-descriptions-item label="姓名">
								{{ scope.row.name }}
							</el-descriptions-item>

							<el-descriptions-item label="存款">
								{{ scope.row.wages }}
							</el-descriptions-item>

							<el-descriptions-item label="出生年月">
								{{ scope.row.createTime }}
							</el-descriptions-item>
						</el-descriptions>
					</div>
				</template>

				<!-- 自定义列 -->
				<template #column-wages="{ scope }">
					<span>{{ scope.row.wages }}🤑</span>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />

			<!-- 分页 -->
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />

		<!-- 高级搜索 -->
		<cl-adv-search ref="AdvSearch" />
	</cl-crud>
</template>

<script lang="tsx" setup>
defineOptions({
	name: 'demo-crud'
});

import { useCrud, useUpsert, useTable, useAdvSearch, useSearch } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';

// 基础
const { service, refs, setRefs } = useCool();

// 字典
const { dict } = useDict();

// 选项，统一命名options，存放所有的下拉等其他选项列表数据
const options = reactive({
	status: [
		{
			label: '启用',
			value: 1
		},
		{
			label: '禁用',
			type: 'danger',
			value: 0
		}
	]
});

// 合计数据
const subData = reactive({
	wages: 0
});

// crud
const Crud = useCrud(
	{
		// 绑定的服务，如：service.demo.goods、service.base.sys.user
		service: 'test',

		// 刷新事件
		async onRefresh(params, { next }) {
			const res = await next(params);
			Object.assign(subData, res.subData);
		}
	},
	app => {
		// Crud 加载完，默认刷新一次
		app.refresh({
			size: 10
			// status: 1 // 带额外参数的请求
		});
	}
);

// 刷新列表，统一调用这个方法去刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}

// 新增、编辑
// 插入类型 <Eps.UserInfoEntity>，prop 和 data 会有提示
const Upsert = useUpsert<Eps.UserInfoEntity>({
	items: [
		// 分组
		{
			type: 'tabs',
			props: {
				type: 'card',
				labels: [
					{
						label: '基础信息',
						value: 'base'
					},
					{
						label: '其他配置',
						value: 'other'
					}
				]
			}
		},
		{
			label: '头像',
			prop: 'avatarUrl',
			group: 'base',
			component: {
				name: 'cl-upload'
			}
		},
		{
			label: '账号',
			group: 'base',
			prop: 'account',
			component: {
				name: 'el-input'
			}
		},
		// 动态配置，新增显示、编辑隐藏
		() => {
			return () => {
				return {
					label: '密码',
					group: 'base',
					prop: 'password',
					hidden: Upsert.value?.mode == 'update', // 通过 mode 参数判断
					component: {
						name: 'el-input',
						props: {
							type: 'password'
						}
					}
				};
			};
		},
		{
			group: 'base',
			prop: 'user',
			component: {
				name: 'cl-form-card',
				props: {
					label: '用户信息（多层级展示）'
				}
			},
			children: [
				{
					label: '姓名',
					prop: 'name',
					required: true,
					component: {
						name: 'el-input'
					}
				},
				{
					label: '存款',
					prop: 'wages',
					component: {
						name: 'el-input-number'
					}
				}
			]
		},
		{
			group: 'base',
			prop: 'contact',
			component: {
				name: 'cl-form-card',
				props: {
					label: '联系信息',
					expand: false
				}
			},
			children: [
				{
					label: '手机号',
					prop: 'phone',
					component: {
						name: 'el-input'
					}
				},
				{
					label: '省市区',
					prop: 'pca',
					group: 'base',
					component: {
						name: 'cl-distpicker'
					}
				}
			]
		},
		{
			group: 'other',
			label: '工作',
			prop: 'occupation',
			component: {
				name: 'el-tree-select',
				props: {
					data: dict.get('occupation'),
					checkStrictly: true
				}
			}
		},
		{
			group: 'other',
			label: '身份证照片',
			prop: 'idCardPic',
			component: {
				name: 'cl-upload',
				props: {
					isSpace: true,
					size: [200, 300]
				}
			}
		}
	],

	// 详情钩子
	onInfo(data, { next, done }) {
		// 继续请求 info 接口，可以带其他自定义参数
		// next({
		// 	id: data.id,
		//	status: 1
		// });

		// 使用其他接口
		// service.demo.goods.info({ id: data.id }).then((res) => {
		// 	done(res);
		// });

		// 直接取列表的数据返回
		done(data);
	},

	// 提交钩子
	onSubmit(data, { next, close, done }) {
		console.log('onSubmit', data);
		// 继续请求 update/add 接口
		next(data);

		// 自定义接口
		// service.demo.goods
		// 	.update(data)
		// 	.then(() => {
		// 		ElMessage.success("保存成功");

		// 		// 操作完，刷新列表
		// 		refresh();

		// 		// 关闭窗口
		// 		close();
		// 	})
		// 	.catch((err) => {
		// 		ElMessage.error(err.message);

		// 		// 关闭加载状态
		// 		done();
		// 	});
	},

	// 打开后，数据加载完，onInfo 之后
	onOpened(data) {
		if (Upsert.value?.mode != 'info') {
			ElMessage.info('编辑中');
		}
	},

	// 关闭钩子
	onClose(action, done) {
		if (Upsert.value?.mode == 'update') {
			if (action == 'close') {
				return ElMessageBox.confirm('还没填完，确定关闭不？', '提示', {
					type: 'warning'
				})
					.then(() => {
						done();
						ElMessage.info('好吧');
					})
					.catch(() => {
						ElMessage.success('请继续编辑');
					});
			}
		}

		done();
	}
});

// 表格
const Table = useTable({
	columns: [
		{
			type: 'selection',
			width: 60
		},
		// 展开列
		{
			label: '展开',
			type: 'expand',
			prop: 'detail',
			width: 60
		},
		{
			label: '头像',
			prop: 'avatar',
			width: 100,
			component: {
				name: 'cl-image',
				props: {
					size: 40
				}
			}
		},
		{
			label: '姓名',
			prop: 'name',
			minWidth: 120
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140,

			// 带搜索组件
			search: {
				component: {
					name: 'el-input',
					props: {
						placeholder: '搜索手机号'
					}
				}
			}
		},
		{
			label: '账号',
			prop: 'account',
			minWidth: 150
		},
		{
			label: '存款(元)',
			prop: 'wages',
			minWidth: 150,
			sortable: 'desc' // 默认倒序
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			dictColor: true,
			minWidth: 150,
			dictAllLevels: true, // 显示所有等级

			// 带搜索组件
			search: {
				component: {
					name: 'cl-select',
					props: {
						options: dict.get('occupation')
					}
				}
			}
		},
		{
			label: '状态',
			orderNum: 2,
			prop: 'status',
			minWidth: 100,
			component: {
				name: 'cl-switch'
			}
		},
		{
			label: '出生年月',
			orderNum: 1,
			minWidth: 165,
			prop: 'createTime',
			sortable: 'custom',
			search: {
				component: {
					name: 'cl-date-picker',
					props: {
						type: 'date',
						valueFormat: 'YYYY-MM-DD',
						placeholder: '搜索日期'
					}
				}
			}
		},
		{
			type: 'op',
			width: 340,
			// 静态配置按钮
			// buttons: ["info", "edit", "delete"],
			// 动态配置按钮
			buttons({ scope }) {
				return [
					'info',
					'edit',
					'delete',
					{
						label: '自定义',
						onClick() {
							ElMessage.info(`他是：${scope.row.name}`);
						}
					}
				];
			}
		}
	]
});

// 合计
function onSummaryMethod() {
	// 添加自定义列组件后
	return ['合计', '', ...refs.columnCustom.summary(subData)];
}

// 高级搜索
const AdvSearch = useAdvSearch({
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
			hook: {
				bind: 'string'
			},
			component: {
				name: 'el-select',
				options: dict.get('occupation')
			}
		}
	]
});

// 搜索
const Search = useSearch({
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
		}
	]
});

</script>

```

## 起步

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />

			<cl-flex1 />

			<cl-search-key />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
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
		// test 为测试数据模式，详细说明移步到 service 例子
		service: 'test'
	},
	app => {
		//【很重要】首次请求，数据一并添加到请求参数中
		app.refresh({
			size: 10,
			status: 1
		});
	}
);

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			type: 'selection'
		},
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
	]
});

</script>

```

## 修改文案 / 接口

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />

			<cl-flex1 />

			<cl-search-key />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
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
		//【很重要】配置 service，如：service.base.sys.user
		service: 'test',

		//【很重要】字典配置，文案和请求方法等
		dict: {
			// 修改请求
			// 比如说默认列表请求的是 page 接口，可以修改成 getUserList 等等，这取决于后端有没有这个接口。
			api: {
				list: 'list',
				add: 'add',
				update: 'update',
				delete: 'delete',
				info: 'info',
				page: 'page'
			},

			// 修改文案
			label: {
				op: '操作',
				add: '添加',
				delete: '移除',
				multiDelete: '批量移除',
				update: '修改',
				refresh: '刷新',
				info: '详情'
			}
		}
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
			type: 'selection'
		},
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
	]
});

</script>

```

## 事件监听

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />

			<cl-flex1 />

			<cl-search-key />
		</cl-row>

		<cl-row>
			<cl-table ref="Table">
				<!-- 自定义按钮 -->
				<template #slot-btn="{ scope }">
					<el-button @click="onEvent(scope.row)">自定义事件</el-button>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { useCool } from '/@/cool';
import { ElMessage } from 'element-plus';

const { service } = useCool();
const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		// 配置 service
		service: 'test',

		//【很重要】监听刷新事件，每次调用 Crud.value.refresh() 会触发
		onRefresh(params, { next }) {
			// 默认使用 next(params)，也可以自己对数据进行处理
			next({
				...params,
				status: 1
			});
		},

		// 监听删除事件，点击删除按钮触发
		onDelete(selection, { next }) {
			// 传入 ids，批量删除多个数据
			next({
				ids: selection.map(e => e.id)
			});
		}
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
			type: 'selection'
		},
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
			width: 300,
			buttons: ['edit', 'delete', 'slot-btn']
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
	]
});

// 调用 Crud 方法
function onEvent(row: any) {
	ElMessage.info('自定义打开新增');

	// 打开新增表单
	Crud.value?.rowAdd();

	// 打开编辑表单
	// Crud.value?.rowEdit(row);

	// 打开删除提示框
	// Crud.value?.rowDelete(row);

	// 获取已请求的参数
	// Crud.value?.getParams();
}

</script>

```

## 选择表格

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表格组件 -->
	<cl-form ref="Form" />
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import UserSelect from '/$/user/components/user-select.vue';

const { service } = useCool();
const Form = useForm();

const columns = [
	{
		label: '头像',
		prop: 'headImg',
		component: {
			name: 'cl-avatar'
		}
	},
	{
		label: '昵称',
		prop: 'nickName'
	},
	{
		label: '创建时间',
		prop: 'createTime'
	}
];

function open() {
	Form.value?.open({
		width: '800px',
		title: '选择表格',
		items: [
			{
				label: '多选 - default',
				prop: 'a',
				value: [],
				component: {
					vm: UserSelect,
					props: {
						multiple: true
					}
				},
				span: 12
			},
			{
				label: '单选 - default',
				prop: 'b',
				component: {
					name: 'cl-select-table',
					props: {
						pickerType: 'default',
						multiple: false,
						columns,
						service: service.base.sys.user
					}
				},
				span: 12
			},
			{
				label: '多选 - text',
				prop: 'c',
				value: [],
				component: {
					name: 'cl-select-table',
					props: {
						pickerType: 'text',
						multiple: true,
						columns,
						service: service.base.sys.user
					}
				},
				span: 12
			},
			{
				label: '单选 - text',
				prop: 'd',
				component: {
					name: 'cl-select-table',
					props: {
						pickerType: 'text',
						multiple: false,
						columns,
						service: service.base.sys.user
					}
				},
				span: 12
			},
			{
				label: '多选 - table',
				prop: 'e',
				value: [],
				component: {
					name: 'cl-select-table',
					props: {
						pickerType: 'table',
						multiple: true,
						columns,
						service: service.base.sys.user
					}
				}
			}
		]
	});
}
</script>

```

## Service 配置

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />

			<cl-flex1 />

			<cl-search-key />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useDict } from '/$/dict';

//【很重要】service 是所有请求的集合，是一个对象（刷新页面和保存代码会自动读取后端的所有接口）
const { service, route } = useCool();
console.log('service', service);

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		//【很重要】配置 service，如：service.base.sys.user
		// 不需要到具体的方法，如：service.base.sys.user.page，这是错误的！

		// 实际用法
		// service: service.base.sys.user,

		// 测试示例
		service: 'test'

		// 自定义配置1，添加本地 service 文件。
		// 【很重要】参考 /src/modules/demo/service/test.ts
		// 【很重要】必须放在目录 modules/*/service/ 下，才会自动注入到 service 中
		// service: service.test

		// 自定义配置2，针对一些特殊场景
		// service: {
		// 	page(params: any) {
		// 		// params 请求参数
		// 		//【很重要】必须返回一个 Promise 格式
		// 		return Promise.resolve({
		// 			list: [],
		// 			pagination: {
		// 				total: 1,
		// 				page: 1,
		// 				size: 20
		// 			}
		// 		});
		// 	}

		// 	// add、delete、update、info、list 也是如此配置
		// }
	},
	app => {
		// 首次调用刷新接口。在弹窗的情况下可以注释，用 Crud.value?.refresh() 方式手动调用
		app.refresh();

		// 带参数
		// app.refresh({
		// 	userId: route.query.id
		// });
	}
);

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			type: 'selection'
		},
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
	]
});

</script>

```

## 选择成员

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表格组件 -->
	<cl-form ref="Form" />
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '选择成员',
		items: [
			{
				label: '单选',
				prop: 'userId',
				component: {
					name: 'cl-user-select',
					props: {
						multiple: false,
						onChange(val) {
							console.log(val);
						}
					}
				},
				required: true
			},
			{
				label: '多选',
				prop: 'userIds',
				component: {
					name: 'cl-user-select',
					props: {
						multiple: true,
						onChange(val) {
							console.log(val);
						}
					}
				},
				required: true
			}
		]
	});
}
</script>

```