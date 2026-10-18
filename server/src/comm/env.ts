/**
 * 读取必填的环境变量，缺失时直接抛错，阻止服务以不安全的默认值启动
 * @param name 变量名
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }
  return value;
}

/**
 * 是否开发环境（本地开发 local、测试 test / unittest），环境名的取法和范围与 Midway 一致
 */
export function isDevEnv(): boolean {
  const env = process.env.MIDWAY_SERVER_ENV || process.env.NODE_ENV;
  return ['local', 'test', 'unittest'].includes(env);
}
