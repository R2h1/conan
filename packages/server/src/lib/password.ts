import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * 哈希密码
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
