export default {
	// 根地址：生产环境管理端和后端同域部署，由 nginx 把 /api 转发到后端
	get host() {
		return location.origin;
	},

	// 请求地址
	get baseUrl() {
		const mode = import.meta.env.MODE;

		if (mode == 'static') {
			return location.origin;
		} else {
			return '/api';
		}
	}
};
