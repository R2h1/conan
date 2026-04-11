import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * 强制认证中间件 - 未登录返回 401
 * JWT 插件会自动从 cookie 或 Authorization header 中提取 token
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({ error: '未授权' });
  }
}

/**
 * 可选认证中间件 - 不强制要求登录
 */
export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    // 忽略错误，不强制要求登录
  }
}
