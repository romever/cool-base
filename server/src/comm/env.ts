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
 * 是否本地开发环境（pnpm dev 时 NODE_ENV=local），判断规则与 Midway 一致
 */
export function isLocalEnv(): boolean {
  return (process.env.MIDWAY_SERVER_ENV || process.env.NODE_ENV) === 'local';
}
