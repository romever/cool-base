# cl-table 示例

表格：列配置、字典、格式化、操作栏、右键菜单、插槽、合计等。

示例按场景分节，先看目录，再用 `## 小节名` 搜索定位，不需要通读全文。示例中 `service: 'test'` 是本地模拟数据，真实页面换成 `service.模块.实体`。

目录：

- 起步
- 多级表头
- 自定义列展示
- 组件渲染
- user-info
- 右键菜单
- 字典匹配
- 数据格式化
- 隐藏/显示
- 操作栏
- 插件的使用
- 行编辑
- 表头搜索
- 多选框数据
- 插槽的使用
- 合并行或列
- 表尾合计行

## 起步

```vue
<template>
	<!--【很重要】需要包含在 cl-crud 组件内 -->
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 参数文档查看：https://element-plus.org/zh-CN/component/table.html#table-%E5%B1%9E%E6%80%A7 -->
			<cl-table ref="Table" stripe></cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		// 测试数据，移步到 cl-crud 例子查看
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

// cl-table 配置
const Table = useTable({
	// 是否自动计算表格高度，表格高度等于减去上区域和下区域的高度
	//【很重要】在弹窗或者上级不确定高度中，设置 autoHeight: false，避免显示异常。也可以手动设置最大高度 maxHeight: 500
	autoHeight: false,

	// 右键菜单，移步到右键菜单示例中查看
	contextMenu: ['refresh'],

	// 列配置，点击 columns 查看描述
	// 更多配置查看 el-table-column 文档，https://element-plus.org/zh-CN/component/table.html#table-column-%E5%B1%9E%E6%80%A7
	columns: [
		{
			// 是否为多选框操作列
			type: 'selection'

			// 是否为序号列
			// type: "index"
		},
		{
			// 表头标题
			label: '姓名',

			// 绑定值
			prop: 'name',

			// 最小宽度
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
			// 字典匹配，移步到字典示例中查看
			dict: dict.get('occupation'),
			minWidth: 140
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			// 是否排序，desc, asc
			sortable: 'desc'
		}
	]
});

</script>

```

## 多级表头

```vue
<template>
	<cl-crud ref="Crud">
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
import { useCrud, useTable } from '@cool-vue/crud';
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
			label: '用户信息',
			prop: 'baseInfo',
			minWidth: 250,

			// 配置 children 参数
			children: [
				{
					label: '姓名',
					prop: 'name',
					minWidth: 140
				},
				{
					label: '手机号',
					prop: 'phone',
					minWidth: 140
				}
			]
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

</script>

```

## 自定义列展示

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!--【很重要】组件配置，设置为 Table 的 columns，也可以自定义 -->
			<cl-column-custom :columns="Table?.columns" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table"></cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
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
			label: '状态',
			prop: 'status',
			dict: [
				{
					label: '启用',
					value: 1,
					type: 'success'
				},
				{
					label: '禁用',
					value: 0,
					type: 'danger'
				}
			],
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

</script>

```

## 组件渲染

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table"></cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { ElMessage } from 'element-plus';
import UserInfo from './user-info.vue';

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
			type: 'selection'
		},
		{
			label: '姓名',
			prop: 'name',
			minWidth: 140,

			//【很重要】组件实例方式渲染
			component: {
				vm: UserInfo
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140,

			//【很重要】组件名方式渲染
			component: {
				// 组件名，组件必须全局注册了
				name: 'el-input',

				// 传入参数
				props: {
					onChange(val) {
						ElMessage.info(val);
					}
				}
			}
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

</script>

```

## user-info

```vue
<template>
	<div class="user-info">
		<cl-avatar :size="36" />

		<div class="det">
			<p>{{ scope?.name }}</p>
		</div>
	</div>
</template>

<!-- name 必须填写且唯一 -->
<script setup lang="ts">
defineOptions({
	name: 'user-info'
});

const props = defineProps({
	prop: String, // 列配置的 prop
	scope: null // 列数据
});
</script>

<style lang="scss" scoped>
.user-info {
	display: flex;
	align-items: center;

	.det {
		flex: 1;
		margin-left: 10px;
		text-align: left;
	}
}
</style>

```

## 右键菜单

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table"></cl-table>
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
import { ElMessage } from 'element-plus';
import { EditPen, MoreFilled } from '@element-plus/icons-vue';

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

	// 右键菜单配置，为 [] 时则不显示内容
	contextMenu: [
		'refresh', // 刷新
		'check', // 选择行
		'edit', // 弹出编辑框
		'delete', // 弹出删除提示
		'info', // 弹出详情
		'order-desc', // 使列倒序
		'order-asc', // 使列升序
		{
			label: '禁用状态',
			disabled: true
		},
		{
			label: '带图标',
			prefixIcon: EditPen,
			suffixIcon: MoreFilled
		},
		{
			label: '超出隐藏，看我有很多字非常多',
			ellipsis: true
		},
		{
			label: '多层级',
			children: [
				{
					label: 'A',
					children: [
						{
							label: 'A-1',
							callback(done) {
								ElMessage.success('点击了A-1');
								done();
							}
						}
					]
				},
				{
					label: 'B'
				},
				{
					label: 'C'
				}
			]
		},
		// row 行数据
		// column 列属性
		// event 事件对象
		(row, column, event) => {
			// 必须返回一个对象
			return {
				label: '自定义2',
				callback(done) {
					ElMessage.info('获取中');

					setTimeout(() => {
						ElMessage.success('Ta 是' + row.name);

						// 关闭右键菜单，只有在用到 callback 方法时才需要
						done();
					}, 500);
				}
			};
		}
	],

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
		}
	]
});

// cl-upsert 配置，详细移步到 cl-upsert 示例查看
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

## 字典匹配

```vue
<template>
	<cl-crud ref="Crud">
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
import { useCrud, useTable } from '@cool-vue/crud';
import { computed, onMounted, reactive } from 'vue';
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

const options = reactive({
	occupation: [] as { label: string; value: any }[]
});

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

			//【很重要】字典匹配
			// 使用字典模块的 get 方法绑定，菜单地址 /dict/list
			dict: dict.get('occupation'),

			// 是否使用不同颜色区分
			dictColor: true,

			minWidth: 140
		},
		{
			label: '等级',
			prop: 'occupation',

			//【很重要】动态匹配列表的情况，使用 computed
			dict: computed(() => options.occupation),

			minWidth: 140
		},
		{
			label: '状态',
			prop: 'status',

			// 自定义匹配列表
			dict: [
				{
					label: '启用',
					value: 1,
					type: 'success'
				},
				{
					label: '禁用',
					value: 0,
					type: 'danger'
				}
			],

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

// 页面加载后异步获取选项，dict 会随 options 响应式更新
onMounted(() => {
	// 模拟接口获取数据
	setTimeout(() => {
		options.occupation = [
			{
				label: 'A',
				value: 0
			},
			{
				label: 'B',
				value: 1
			},
			{
				label: 'C',
				value: 2
			},
			{
				label: 'D',
				value: 3
			},
			{
				label: 'E',
				value: 4
			},
			{
				label: 'F',
				value: 5
			}
		];
	}, 1500);
});
</script>

```

## 数据格式化

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="tsx">
import { useCrud, useTable } from '@cool-vue/crud';

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
			minWidth: 140,
			formatter(row) {
				return '📱' + row.phone;
			}
		},
		{
			label: '用户信息',
			minWidth: 200,
			// tsx 方式渲染
			// 【很重要】使用 tsx 语法时，script 的 lang 一定要设置为 tsx
			formatter(row) {
				// row 为当前行数据
				return (
					<el-row>
						<cl-avatar size={30} />
						<el-text style={{ marginLeft: '10px' }}>{row.name}</el-text>
					</el-row>
				);
			}
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		}
	]
});

</script>

```

## 隐藏/显示

```vue
<template>
	<cl-crud ref="Crud">
		<!--配置一个 tab -->
		<el-tabs v-model="active">
			<el-tab-pane label="员工" name="user"></el-tab-pane>
			<el-tab-pane label="企业" name="company"></el-tab-pane>
		</el-tabs>

		<cl-row>
			<!-- 使用方法 showColumn 显示 -->
			<el-button @click="showColumn('account')">显示账号</el-button>

			<!-- 使用方法 hideColumn 隐藏 -->
			<el-button @click="hideColumn('account')">隐藏账号</el-button>
		</cl-row>

		<cl-row>
			<cl-table ref="Table"></cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
import { computed, ref } from 'vue';
import { useDict } from '/$/dict';

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		// 测试数据，移步到 cl-crud 例子查看
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

const active = ref('user');

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			label: 'ID',
			prop: 'id',
			minWidth: 140,

			//【很重要】配置 hidden 参数，格式为 boolean 或者 Vue.ComputedRef<boolean>
			hidden: computed(() => {
				return active.value != 'company';
			})
		},
		{
			label: '账号',
			prop: 'account',
			minWidth: 140,
			hidden: true // 默认 false
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
		}
	]
});

function showColumn(prop: string) {
	Table.value?.showColumn(prop);
}

function hideColumn(prop: string) {
	Table.value?.hideColumn(prop);
}
</script>

```

## 操作栏

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table">
				<!-- 插槽的渲染方式 #[component.name] -->
				<template #slot-btns="{ scope }">
					<el-button
						@click="
							() => {
								ElMessage.info(scope.row.name);
							}
						"
						>插槽按钮</el-button
					>
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
			//【很重要】type 必须是 op
			type: 'op',

			width: 410, // 宽度

			//【很重要】操作按钮配置，edit 和 info 必须搭配 cl-upsert 实现
			// edit 编辑，预先获取 service 的 info 接口数据，并带入 cl-upsert 的表单值中
			// info 详情，cl-upsert 内的组件全部传入 disabled 参数
			// delete 删除，调用 service 的 delete 接口删除行数据
			buttons: [
				{
					label: '编辑',
					type: 'primary',
					onClick({ scope }) {
						ElMessage.info(scope.row.name);
					}
				},
				{
					label: '删除',
					type: 'danger',
					onClick({ scope }) {
						ElMessage.info(scope.row.name);
					}
				},
				{
					label: '更多',
					type: 'success',
					children: [
						{
							label: '查看',
							onClick({ scope }) {
								ElMessage.info(scope.row.name);
							}
						},
						{
							label: '禁用',
							onClick({ scope }) {
								ElMessage.info(scope.row.name);
							}
						}
					]
				},
				{
					name: 'slot-btns'
				}
			]
		}
	]
});

// cl-upsert 配置，详细移步到 cl-upsert 示例查看
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
					tree: true, // 树形方式选择
					checkStrictly: true, // 任意层级都能点
					options: dict.get('occupation') // 使用字典数据
				}
			}
		}
	]
});

</script>

```

## 插件的使用

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="tsx">
import { useCrud, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { merge } from 'lodash-es';
import { defineComponent } from 'vue';

// 插件：列标签匹配，方便多个列表公用同一个组件
function setColumn(): ClTable.Plugin {
	const columns = {
		UserInfo: {
			label: '用户信息',
			minWidth: 200,
			component: {
				vm: defineComponent({
					name: 'user-info',

					props: {
						scope: null
					},

					setup(props) {
						return () => {
							return (
								<div>
									<p>{props.scope.name}</p>
									<p>{props.scope.phone}</p>
								</div>
							);
						};
					}
				})
			}
		}
	} as { [key: string]: DeepPartial<ClTable.Column> };

	return ({ exposed }) => {
		function deep(arr: ClTable.Column[]) {
			arr.forEach(e => {
				if (e.tag) {
					merge(e, columns[e.tag]);
				}
				deep(e.children || []);
			});
		}

		deep(exposed.columns);
	};
}

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
			type: 'selection'
		},
		{
			tag: 'UserInfo'
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
	],

	//【很重要】配置插件
	plugins: [setColumn()]
});

</script>

```

## 行编辑

```vue
<template>
	<cl-crud ref="Crud">
		<el-text class="mb-4" tag="p">点击姓名、手机号可以进行编辑</el-text>

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
import { useCrud, useTable } from '@cool-vue/crud';
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
			minWidth: 140,
			// 【很重要】行编辑，默认 el-input
			edit: true
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140,
			// 【很重要】行编辑，开启、关闭
			edit: {
				enable: true
			}
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140,
			edit: {
				enable: true,
				// 【很重要】行编辑，组件配置
				component: {
					name: 'cl-select',
					props: {
						options: dict.get('occupation'),
						tree: true
					}
				}
			}
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc',
			// 【很重要】行编辑，组件配置
			edit: {
				enable: true,
				component: {
					name: 'el-date-picker',
					props: {
						type: 'date',
						valueFormat: 'YYYY-MM-DD'
					}
				}
			}
		},
		{
			type: 'op',
			buttons: ['delete']
		}
	],

	//【很重要】行编辑插件
	plugins: [Plugins.Table.rowEdit()]
});

</script>

```

## 表头搜索

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="tsx">
import { useCrud, useTable } from '@cool-vue/crud';
import { useDict } from '/$/dict';
import { Plus } from '@element-plus/icons-vue';

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
			minWidth: 140,

			//【很重要】搜索参数配置
			search: {
				isInput: false, // 默认false，是否输入框模式
				value: '', // 默认值
				refreshOnChange: true, // 默认false，搜索时刷新数据，service 的 page 接口请求参数为 { page: 1, [绑定的prop]: 输入值 }
				// 自定义渲染组件
				component: {
					name: 'el-input',
					props: {
						placeholder: '搜索姓名'
					}
				}
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140,

			//【很重要】搜索参数配置
			search: {
				// 是否显示搜索图标
				icon: () => <Plus />,

				// 自定义渲染组件
				component: {
					name: 'el-input',
					props: {
						placeholder: '搜索手机号',

						// 自定义 change 事件
						onChange(val) {
							Crud.value?.refresh({
								page: 1,
								phone: val
							});
						}
					}
				}
			}
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140,

			//【很重要】搜索参数配置
			search: {
				// 是否显示搜索图标
				icon: () => <cl-svg name="icon-app" size={13} />,
				// 自定义渲染组件
				component: {
					name: 'cl-select',
					props: {
						placeholder: '搜索工作',
						options: dict.get('occupation')
					}
				}
			}
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		}
	]
});

</script>

```

## 多选框数据

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<el-button @click="selectRow">选中2行</el-button>
			<el-button :disabled="Table?.selection.length == 0" @click="clear">
				取消选择
			</el-button>
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<el-text>已选 {{ Table?.selection.length }} 人</el-text>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
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
	contextMenu: ['refresh', 'check'],

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
		}
	]
});

function selectRow() {
	const [a, b] = Table.value?.data || [];

	// 选中2个
	Table.value?.toggleRowSelection(a);
	Table.value?.toggleRowSelection(b);
}

function clear() {
	Table.value?.clearSelection();
}

</script>

```

## 插槽的使用

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table">
				<!--【很重要】必须与 prop 名保持一致，格式：column-[prop] -->
				<template #column-name="{ scope }">
					<cl-row type="flex" align="middle">
						<cl-avatar :size="36" :style="{ marginRight: '10px' }" />
						<el-text>{{ scope.row.name }}</el-text>
					</cl-row>
				</template>

				<template #column-phone="{ scope }"> 📱{{ scope.row.phone }} </template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
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
			headerAlign: 'left',
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

</script>

```

## 合并行或列

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table" :span-method="onSpanMethod" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
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
			label: '存款',
			prop: 'wages',
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

interface SpanMethodProps {
	row: any;
	column: any;
	rowIndex: number;
	columnIndex: number;
}

function onSpanMethod({ row, column, rowIndex, columnIndex }: SpanMethodProps) {
	// 根据实际业务需求调整返回值 { rowspan, colspan }
	if (columnIndex === 0) {
		if (rowIndex % 2 === 0) {
			return {
				rowspan: 2,
				colspan: 1
			};
		} else {
			return {
				rowspan: 0,
				colspan: 0
			};
		}
	}
}

</script>

```

## 表尾合计行

```vue
<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-table ref="Table" show-summary :summary-method="getSummaries" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
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
			label: '存款',
			prop: 'wages',
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

function getSummaries() {
	return ['合计', '$' + Table.value?.data.reduce((a, b) => a + b.wages, 0)];
}

</script>

```