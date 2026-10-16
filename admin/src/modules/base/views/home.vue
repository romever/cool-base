<template>
	<div class="view-home">
		<div class="title">{{ app.info.name }}</div>
		<div class="desc">{{ user.info?.nickName || user.info?.username }}，{{ $t('欢迎回来') }}</div>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'home'
});

import { useBase } from '/$/base';

// 首页占位视图，具体业务应用按需替换为自己的首页
const { app, user } = useBase();
</script>

<style lang="scss" scoped>
.view-home {
	height: 100%;
	padding: 40px;
	background-color: var(--el-bg-color);
	border-radius: 6px;

	.title {
		font-size: 24px;
		font-weight: bold;
		margin-bottom: 12px;
	}

	.desc {
		color: var(--el-text-color-secondary);
	}
}
</style>
