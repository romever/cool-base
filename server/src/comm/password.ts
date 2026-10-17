import * as bcrypt from 'bcryptjs';

// bcrypt 计算成本，每 +1 耗时翻倍
const SALT_ROUNDS = 10;

/**
 * 生成密码哈希（自带随机盐）
 */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 校验明文密码与哈希是否匹配
 */
export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
