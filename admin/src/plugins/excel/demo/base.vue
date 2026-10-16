<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />

			<cl-flex1 />

			<!-- 导入 -->
			<cl-import-btn template="/用户导入模版.xlsx" :on-submit="onImpSubmit" />

			<!-- 导出 -->
			<cl-export-btn :columns="Table?.columns" />
		</cl-row>

		<cl-row>
			<!-- 表格 -->
			<cl-table ref="Table" :auto-height="false" />
		</cl-row>

		<cl-row>
			<cl-flex1 />

			<!-- 分页 -->
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script lang="tsx" setup>
import { useCrud, useTable } from '@cool-vue/crud';
import { ElMessage } from 'element-plus';

// 工作选项
const occupation = [
	{ label: '研发', value: 1 },
	{ label: '产品', value: 2 },
	{ label: '设计', value: 3 },
	{ label: '运营', value: 4 }
];

// crud
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh({ size: 10 });
	}
);

// 表格
const Table = useTable({
	columns: [
		{
			label: '姓名',
			prop: 'name'
		},
		{
			label: '手机号',
			prop: 'phone'
		},
		{
			label: '账号',
			prop: 'account'
		},
		{
			label: '存款(元)',
			prop: 'wages'
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: occupation
		}
	]
});

function onImpSubmit(data: { list: any[]; file: File }, { done, close }: any) {
	close();
	ElMessage.success(`已提交${data.list.length}条数据`);
}
</script>
