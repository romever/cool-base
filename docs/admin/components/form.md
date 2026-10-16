# cl-form 示例

通用表单：布局、分组、联动显隐、校验、自定义组件、内嵌 CRUD。

示例按场景分节，先看目录，再用 `## 小节名` 搜索定位，不需要通读全文。示例中 `service: 'test'` 是本地模拟数据，真实页面换成 `service.模块.实体`。

目录：

- 层级显示
- 组件渲染
- select-labels
- select-status
- select-work
- select-work2
- 参数配置
- 内嵌CRUD
- 组件禁用
- 组件事件
- 分组显示
- 隐藏/显示
- 布局
- 起步
- 选项框配置
- 插件的使用
- 必填项配置
- 添加/删除表单项

## 层级显示

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '层级显示',
		items: [
			{
				label: '姓名',
				prop: 'name',
				component: {
					name: 'el-input'
				}
			},
			{
				label: '年龄',
				prop: 'age',
				value: 18,
				component: {
					name: 'el-input-number'
				}
			},

			// 基础信息
			{
				component: {
					//【很重要】使用 cl-form-card 组件渲染，也可以使用自定义
					name: 'cl-form-card',
					props: {
						// 标题
						label: '基础信息',
						// 是否展开，默认 true
						expand: true
					}
				},
				children: [
					{
						label: '账号',
						prop: 'account',
						component: {
							name: 'el-input'
						}
					},
					{
						label: '密码',
						prop: 'password',
						component: {
							name: 'el-input'
						}
					}
				]
			},

			// 其他信息
			{
				component: {
					name: 'cl-form-card',
					props: {
						label: '其他信息',
						expand: false
					}
				},
				children: [
					{
						label: '身份证',
						prop: 'idcard',
						component: {
							name: 'el-input'
						}
					},
					{
						label: '学校',
						prop: 'school',
						component: {
							name: 'el-input'
						}
					},
					{
						label: '专业',
						prop: 'major',
						component: {
							name: 'el-input'
						}
					}
				]
			}
		],
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 组件渲染

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form">
		<!-- 年龄插槽 -->
		<template #slot-age="{ scope }">
			<!-- scope 为表单值 -->
			<el-input-number v-model="scope.age" :min="18" :max="100"></el-input-number>
		</template>
	</cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { ElMessage } from 'element-plus';
import SelectWork from './select-work2.vue';
import SelectLabels from './select-labels.vue';
import SelectStatus from './select-status.vue';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '组件配置',

		items: [
			{
				label: '昵称',
				prop: 'name',
				// 组件配置方式1：标签名（方便，但是不建议组件全局注册）
				value: '神仙',
				component: {
					// 必须是“全局注册”的组件名，如 element-plus 的 el-input、el-date-picker 等
					name: 'el-input'
				}
			},
			{
				label: '手机号',
				prop: 'phone',
				value: '13255022000',
				component: {
					name: 'el-input',
					// 自定义插槽
					slots: {
						prepend() {
							return '+86';
						}
					}
				}
			},
			{
				label: '年龄',
				prop: 'age',
				// 组件配置方式2：插槽（万能，就是代码多写点）
				value: 18,
				component: {
					// 必须是 "slot-" 开头
					name: 'slot-age'
				}
			},
			// -- start 组件配置方式3：组件实例（不想全局注册，但又想组件化）
			{
				label: '工作',
				prop: 'work',
				value: '设计',
				component: {
					// 双向绑定
					vm: SelectWork
				}
			},
			{
				label: '标签',
				prop: 'labels',
				value: ['多金', '深情'],
				component: {
					// scope[prop]绑定
					vm: SelectLabels
				}
			},
			{
				label: '状态',
				prop: 'status',
				value: 1,
				component: {
					// useForm 绑定
					vm: SelectStatus
				}
			}
			// -- end
		],
		on: {
			submit(data, { close }) {
				ElMessage.info(
					`${data.name || '无名'}（${data.age || 18}岁）工作：${data.work || '无'}`
				);
				close();
			}
		}
	});
}
</script>

```

## select-labels

```vue
<template>
	<!--【很重要】直接绑定表单值 scope[prop] -->
	<!-- !符号，只是为了类型提示不错误 -->
	<el-select v-model="scope[prop!]" multiple>
		<el-option
			v-for="(item, index) in list"
			:key="index"
			:label="item.label"
			:value="item.label"
		/>
	</el-select>
</template>

<!--【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-labels'
});

import { ref } from 'vue';

const props = defineProps({
	scope: null, // 表单值
	prop: String // 表单项配置的 prop
});

// 选项列表
const list = ref<{ label: string; value: string }[]>([
	{
		label: '帅气',
		value: '帅气' // 测试直接使用label，真实情况可能是1，2，3，4或者id
	},
	{
		label: '多金',
		value: '多金'
	},
	{
		label: '深情',
		value: '深情'
	}
]);
</script>

```

## select-status

```vue
<template>
	<!--【很重要】直接绑定status，或者使用 form[prop!] -->
	<el-radio-group v-model="form.status">
		<el-radio v-for="(item, index) in list" :key="index" :value="item.value">
			{{ item.label }}
		</el-radio>
	</el-radio-group>
</template>

<!--【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-status'
});

import { useForm } from '@cool-vue/crud';
import { computed, ref } from 'vue';

const props = defineProps({
	scope: null, // 表单值
	prop: String // 表单项配置的 prop
});

// 使用 useForm，能直接获取到上级的表单实例，
// 比如操作表单的 Form.value?.submit、Form.value?.close等
// 获取表单值，Form.value?.form
const Form = useForm();

// 表单值，包一层不会太难受
const form = computed(() => Form.value?.form || {});

// 选项列表
const list = ref<{ label: string; value: number }[]>([
	{
		label: '很好',
		value: 1
	},
	{
		label: '不舒服',
		value: 2
	},
	{
		label: '要嘎了',
		value: 3
	}
]);
</script>

```

## select-work

```vue
<template>
	<el-select v-model="active" @change="onChange">
		<el-option
			v-for="(item, index) in list"
			:key="index"
			:label="item.label"
			:value="item.label"
		/>
	</el-select>
</template>

<!-- 【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-work'
});

import { ref, watch } from 'vue';

const props = defineProps({
	modelValue: String
});

const emit = defineEmits(['update:modelValue', 'change']);

//【很重要】绑定值
// 这种方式虽然麻烦，但是可扩展性高，一些复杂的数据结构可以按这种方式绑定值
const active = ref();

// 选项列表
const list = ref<{ label: string; value: string }[]>([
	{
		label: '倒茶',
		value: '倒茶' // 测试直接使用label，真实情况可能是1，2，3，4或者id
	},
	{
		label: '设计',
		value: '设计'
	},
	{
		label: '开发',
		value: '开发'
	}
]);

//【很重要】更新绑定值，表单提交才能得到选择后的
function onChange(val: string) {
	emit('update:modelValue', val);
	emit('change', val);
}

//【很重要】使用监听的方式，避免表单打开数据是异步获取的情况
watch(
	() => props.modelValue,
	val => {
		// 设置选中的值
		active.value = val;
	},
	{
		immediate: true
	}
);
</script>

```

## select-work2

```vue
<template>
	<el-select v-model="active">
		<el-option
			v-for="(item, index) in list"
			:key="index"
			:label="item.label"
			:value="item.label"
		/>
	</el-select>
</template>

<!-- 【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-work2'
});

import { ref, useModel } from 'vue';

const props = defineProps({
	modelValue: String
});

//【很重要】绑定值，使用 useModel 的方式双向绑定
const active = useModel(props, 'modelValue');

// 选项列表
const list = ref<{ label: string; value: string }[]>([
	{
		label: '倒茶',
		value: '倒茶' // 测试直接使用label，真实情况可能是1，2，3，4或者id
	},
	{
		label: '设计',
		value: '设计'
	},
	{
		label: '开发',
		value: '开发'
	}
]);
</script>

```

## 参数配置

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form">
		<!-- 按钮插槽 -->
		<template #slot-btns>
			<el-button type="danger">按钮插槽</el-button>
		</template>
	</cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { ElMessage } from 'element-plus';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '参数配置',

		// 打开是否重置表单
		isReset: false,

		// 默认表单值
		form: {
			nickName: '神仙都没用'
		},

		// 表单配置
		props: {
			// 标签宽度
			labelWidth: '120px',

			// 标签位置
			labelPosition: 'top'
		},

		// 窗口的高。配置后，在窗口内部滚动。默认整个页面滚动
		height: '60vh',

		// 窗口的宽，默认 50%
		width: '60%',

		// 窗口设置
		dialog: {
			// 是否隐藏头部
			hideHeader: false,

			// 顶部操作按钮，默认["fullscreen", "close"]
			// fullscreen 全屏
			// close 关闭
			controls: ['close']
		},

		// 底部操作按钮
		op: {
			// 默认靠右布局
			justify: 'flex-end',

			// 保存按钮文字
			saveButtonText: '提交',

			// 关闭按钮文字
			closeButtonText: '关闭',

			// 是否隐藏
			hidden: false,

			// 按钮配置
			buttons: [
				// 自定义
				{
					label: '自定义按钮',
					onClick() {
						ElMessage.success('自定义按钮点击');
					}
				},
				// close 关闭
				'close',
				// save 保存
				'save',
				// 插槽使用，配合 template，往上看 cl-form 组件
				'slot-btns'
			]
		},

		// 表单项配置
		items: [
			{
				label: '昵称',
				prop: 'nickName',
				component: {
					name: 'el-input'
				}
			}
		],

		// 事件
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 内嵌CRUD

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form">
		<template #slot-crud>
			<cl-crud ref="Crud" border>
				<cl-row>
					<!-- 刷新按钮 -->
					<cl-refresh-btn />
					<!-- 新增按钮 -->
					<cl-add-btn />
					<!-- 删除按钮 -->
					<cl-multi-delete-btn />
					<cl-flex1 />
					<!-- 关键字搜索 -->
					<cl-search-key placeholder="搜索姓名、手机号" />
				</cl-row>

				<cl-row>
					<!-- 数据表格 -->
					<cl-table ref="Table" />
				</cl-row>

				<cl-row>
					<cl-flex1 />
					<!-- 分页控件 -->
					<cl-pagination />
				</cl-row>

				<!-- 新增、编辑 -->
				<cl-upsert ref="Upsert" />
			</cl-crud>
		</template>
	</cl-form>
</template>

<script setup lang="ts">
import { useCrud, useForm, useTable, useUpsert } from '@cool-vue/crud';

// cl-upsert
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
			label: '创建时间',
			prop: 'createTime',
			component: {
				name: 'el-date-picker'
			}
		}
	]
});

// cl-table
const Table = useTable({
	autoHeight: false,
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
			type: 'op'
		}
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh({
			size: 10
		});
	}
);

const Form = useForm();

function open() {
	Form.value?.open({
		title: '内嵌CRUD',
		props: {
			labelPosition: 'top'
		},
		dialog: {
			height: '70vh',
			width: '1000px'
		},
		items: [
			{
				label: '姓名',
				prop: 'name',
				component: {
					name: 'el-input',
					props: {
						placeholder: '请填写姓名'
					}
				},
				rules: {
					required: true,
					message: '姓名不能为空'
				}
			},
			{
				label: '内嵌 cl-crud',
				component: {
					name: 'slot-crud'
				}
			}
		],
		on: {
			submit() {
				Form.value?.close();
			}
		}
	});
}
</script>

```

## 组件禁用

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '组件禁用',
		items: [
			{
				label: '账号',
				prop: 'account',
				component: {
					name: 'el-input',
					props: {
						// 设置 boolean 值控制组件的禁用状态（前提是组件支持这个参数，element 的组件几乎都有）
						disabled: true
					}
				}
			},
			{
				label: '密码',
				prop: 'password',
				component: {
					name: 'el-input'
				}
			}
		],
		on: {
			open() {
				// 通用 setProps 方法去设置 disabled, 1.5s后禁用
				setTimeout(() => {
					Form.value?.setProps('password', { disabled: true });
				}, 1500);
			},

			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 组件事件

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { ElMessage } from 'element-plus';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '组件事件',
		items: [
			{
				label: '账号',
				prop: 'account',
				component: {
					name: 'el-input',
					props: {
						// 组件内 emit 的用 on[name] 接收，如 onChange、onInput、onBlur 等
						// 前提是组件内有触发事件
						onBlur() {
							ElMessage.info('账号检查中');
						}
					}
				}
			},
			{
				label: '是否实名',
				prop: 'status',
				value: 1,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '关闭',
							value: 0
						},
						{
							label: '开启',
							value: 1
						}
					],
					props: {
						// 值改变事件
						onChange(val: number) {
							if (val == 1) {
								// 显示表单项
								Form.value?.showItem('idcard');
							} else {
								// 隐藏表单项
								Form.value?.hideItem('idcard');
								// 清空值
								Form.value?.setForm('idcard', undefined);
							}
						}
					}
				}
			},
			{
				label: '身份证',
				prop: 'idcard',
				component: {
					name: 'el-input'
				}
			}
		],
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 分组显示

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '分组显示',
		items: [
			{
				//【很重要】必须为 tabs
				type: 'tabs',
				props: {
					// 分组样式
					type: 'card',
					// 分组列表，必须是 { label, value } 的数组格式
					labels: [
						{
							label: '基础信息', // 标题
							value: 'base' // 唯一标识
						},
						{
							label: '认证信息',
							value: 'auth'
						}
					]
				}
			},
			// 基础信息
			{
				group: 'base', // 标识
				label: '账号',
				prop: 'account',
				required: true,
				component: {
					name: 'el-input'
				}
			},
			{
				group: 'base', // 标识
				label: '密码',
				prop: 'password',
				required: true,
				component: {
					name: 'el-input'
				}
			},

			// 其他信息 group = other
			{
				group: 'auth', // 标识
				label: '身份证',
				prop: 'idcard',
				required: true,
				component: {
					name: 'el-input'
				}
			},
			{
				group: 'auth', // 标识
				label: '学校',
				prop: 'school',
				component: {
					name: 'el-input'
				}
			},
			{
				group: 'auth', // 标识
				label: '专业',
				prop: 'major',
				component: {
					name: 'el-input'
				}
			}
		],
		on: {
			//【提示】当第一组验证通过后，会自动切换到下一组展示，直到全部通过才可提交
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 隐藏/显示

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '隐藏/显示',
		items: [
			{
				label: '状态',
				prop: 'status',
				value: 0,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '关闭',
							value: 0
						},
						{
							label: '开启',
							value: 1
						}
					]
				}
			},
			{
				label: '账号',
				prop: 'account',
				component: {
					name: 'el-input'
				}
			},
			{
				//【很重要】是否隐藏
				hidden({ scope }) {
					// scope 为表单值
					// 返回一个 boolean 来控制当前表单项的隐藏/显示
					return scope.status != 1;
				},
				label: '密码',
				prop: 'password',
				component: {
					name: 'el-input'
				}
			}
		],
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 布局

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '布局',
		items: [
			{
				//【span】参考文档：https://element-plus.gitee.io/zh-CN/component/layout.html
				// 使用 1/24 分栏，默认 24
				span: 12,
				label: '昵称',
				prop: 'nickname',
				component: {
					name: 'el-input'
				}
			},
			{
				span: 12,
				label: '手机号',
				prop: 'phone',
				component: {
					name: 'el-input',
					props: {
						maxlength: 11
					}
				}
			},
			{
				//【flex】使宽度不填充满
				flex: false,
				label: '标签',
				prop: 'label',
				component: {
					name: 'el-input'
				}
			},
			{
				label: '状态',
				prop: 'status',
				value: 1,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '开启',
							value: 1
						},
						{
							label: '关闭',
							value: 0
						}
					]
				}
			},
			{
				label: '备注',
				prop: 'remark',
				component: {
					name: 'el-input',
					props: {
						type: 'textarea',
						rows: 4
					}
				}
			}
		],
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 起步

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<!--【很重要】ref 一定要对应 useForm 定义的值 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="tsx">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '起步',

		items: [
			{
				label: '昵称',
				// 绑定值的标识，表单提交及回显会自动根据 prop 获取对应的值
				prop: 'nickname',
				// 组件绑定
				component: {
					// 必须是“全局注册”的组件名，如 element-plus 的 el-input、el-date-picker 等
					name: 'el-input',

					// 绑定的组件参数配置，如 clearable、placeholder 等
					// 组件内 emit 的用 on[name] 接收，如 onChange、onInput、onBlur 等
					props: {
						placeholder: '请输入昵称',
						clearable: true,
						onChange(value: string) {}
					}
				}
			},
			{
				prop: 'age',
				component: {
					name: 'el-input-number'
				},
				// 默认值，第一次打开有效
				value: 18
			}
		],
		on: {
			// 打开时触发
			open() {
				console.log(Form.value?.validateField);
			},

			// 关闭时触发。当配置该方法时，关闭事件会被阻断，使用 done() 关闭窗口
			close(action, done) {
				// action 为关闭窗口的触发动作 "save" | "close"
				// done 关闭事件
				done();
			},

			// 提交时触发
			submit(data, { done, close }) {
				// data 为表单值
				// done 关闭加载事件、但不关闭窗口
				// close 关闭窗口

				close();
			}
		}
	});
}
</script>

```

## 选项框配置

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { computed, reactive } from 'vue';

const Form = useForm();

// 觉得麻烦就 any，如 { user: [] as any[] }
const options = reactive<{ [key: string]: { label: string; value: any }[] }>({
	user: []
});

function open() {
	Form.value?.open({
		title: '选项框配置',
		items: [
			{
				label: '下拉框',
				prop: 'select',
				component: {
					name: 'el-select',
					props: {
						clearable: true // 可清除
					},
					options: [
						{
							label: 'javascript',
							value: 1
						},
						{
							label: 'vue',
							value: 2
						},
						{
							label: 'html',
							value: 3
						},
						{
							label: 'css',
							value: 4
						}
					]
				}
			},
			{
				label: '单选框',
				prop: 'radio',
				value: 1,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '手机',
							value: 1
						},
						{
							label: '电脑',
							value: 2
						},
						{
							label: '电视',
							value: 3
						}
					]
				}
			},
			{
				label: '多选框',
				prop: 'checkbox',
				value: [2, 3],
				component: {
					name: 'el-checkbox-group',
					options: [
						{
							label: '咖啡',
							value: 1
						},
						{
							label: '汉堡',
							value: 2
						},
						{
							label: '炸鸡',
							value: 3
						},
						{
							label: '奶茶',
							value: 4
						}
					]
				}
			},
			{
				label: '动态配置1',
				prop: 'd1',
				component: {
					name: 'el-select',
					// 动态设置方法1，在 on.open 事件配置 options
					options: []
				}
			},
			{
				label: '动态配置2',
				prop: 'd2',
				component: {
					name: 'el-select',
					// 动态设置方法2，使用 computed 更新 options
					options: computed(() => options.user)
				}
			}
		],
		on: {
			open() {
				// 模拟 1.5s 后取的数据
				setTimeout(() => {
					// 动态设置方法1，使用 setOptions 方法设置
					// d1 为 prop 值
					Form.value?.setOptions('d1', [
						{
							label: '😊',
							value: 1
						},
						{
							label: '😭',
							value: 2
						},
						{
							label: '😘',
							value: 3
						}
					]);

					// 动态设置方法2，直接设置 options.user，由 computed 更新
					options.user = [
						{
							label: '💰',
							value: 1
						},
						{
							label: '🚗',
							value: 2
						}
					];
				}, 1500);
			},
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 插件的使用

```vue
<template>
	<el-button @click="open('manager')">管理者</el-button>
	<el-button @click="open('user')">用户</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { setRole } from './role';

const Form = useForm();

function open(role: string) {
	Form.value?.open(
		{
			title: '插件的使用',

			items: [
				{
					label: '姓名',
					prop: 'name',
					required: true,
					component: {
						name: 'el-input'
					}
				},
				{
					// 自定义参数 role，匹配插件传入的角色
					role: 'user',
					label: '面试职位',
					prop: 'work',
					value: 1,
					component: {
						name: 'el-radio-group',
						options: [
							{
								label: '前端开发',
								value: 1
							},
							{
								label: '后端开发',
								value: 2
							},
							{
								label: 'UI设计',
								value: 3
							}
						]
					}
				},
				{
					role: 'user',
					label: '期望薪资',
					prop: 'salary',
					value: 5000,
					component: {
						name: 'el-input-number',
						props: {
							min: 2000,
							max: 100000
						}
					}
				},
				{
					role: 'manager',
					label: '入职时间',
					prop: 'date',
					component: {
						name: 'el-date-picker'
					}
				},
				{
					role: 'manager',
					label: '负责人',
					prop: 'head',
					component: {
						name: 'el-input'
					}
				}
			],
			on: {
				submit(data, { done, close }) {
					close();
				}
			}
		},
		[
			// 自定义插件，角色权限控制
			setRole(role)
		]
	);
}
</script>

```

## 必填项配置

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form"></cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '必填项配置',
		items: [
			{
				label: '昵称',
				prop: 'nickname',
				component: {
					name: 'el-input'
				},
				// 是否必填，默认判断绑定值是否空
				required: true
			},
			{
				label: '手机号',
				prop: 'phone',
				component: {
					name: 'el-input',
					props: {
						maxlength: 11
					}
				},
				// 自定义规则
				// 基础用法可参考：https://element-plus.gitee.io/zh-CN/component/form.html
				// 高级用法可参考：https://github.com/yiminghe/async-validator
				rules: [
					{
						required: true,
						validator: (rule, value, callback) => {
							if (value === '') {
								callback(new Error('手机号不能为空'));
							} else if (!/^1[3456789]\d{9}$/.test(value)) {
								callback(new Error('手机号格式错误'));
							} else {
								callback();
							}
						}
					}
				]
			}
		],
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 添加/删除表单项

```vue
<template>
	<el-button @click="open">预览</el-button>

	<!-- 自定义表单组件 -->
	<cl-form ref="Form">
		<template #slot-cert="{ scope }">
			<div class="cert">
				<!--【很重要】prop、rules 配置格式如下 -->
				<el-form-item
					v-for="(item, index) in scope.cert"
					:key="index"
					:label="`证书${index + 1}`"
					:prop="`cert.${index}.label`"
					:rules="{
						message: `请填写证书${index + 1}`,
						required: true
					}"
				>
					<div class="row">
						<!-- 输入框 -->
						<el-input v-model="item.label" placeholder="请填写证书"></el-input>

						<!-- 删除行 -->
						<el-icon @click="rowDel(index)">
							<delete />
						</el-icon>
					</div>
				</el-form-item>

				<!-- 添加行 -->
				<el-row type="flex" justify="end">
					<el-button @click="rowAdd()">添加证书</el-button>
				</el-row>
			</div>
		</template>
	</cl-form>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { Delete } from '@element-plus/icons-vue';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '添加/删除表单项',
		items: [
			{
				label: '昵称',
				prop: 'nickname',
				component: {
					name: 'el-input'
				},
				required: true
			},
			{
				prop: 'cert',
				//【很重要】默认数据格式，以实际业务为主。
				value: [
					{
						label: ''
					}
				],
				component: {
					name: 'slot-cert'
				}
			}
		],
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}

function rowAdd() {
	Form.value?.form.cert.push({
		label: ''
	});
}

function rowDel(index: number) {
	Form.value?.form.cert.splice(index, 1);
}
</script>

<style lang="scss" scoped>
.cert {
	.row {
		display: flex;
		align-items: center;

		.el-input {
			flex: 1;
			margin-right: 10px;
		}

		.el-icon {
			cursor: pointer;

			&:hover {
				color: red;
			}
		}
	}
}
</style>

```