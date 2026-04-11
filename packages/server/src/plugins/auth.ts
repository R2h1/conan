import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

export default fp(async function (fastify) {
  // 注册 cookie 插件
  fastify.register(cookie, {
    secret: process.env.JWT_SECRET || 'min-32-char-secret-key-for-dev',
  });

  // 注册 JWT 插件
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'min-32-char-secret-key-for-dev',
    sign: {
      expiresIn: '7d',
    },
    cookie: {
      cookieName: 'token',
      signed: true,
    },
  });

  // 装饰器：获取当前用户
  fastify.decorate('getCurrentUser', async function (request: any) {
    try {
      await request.jwtVerify();
      return request.user;
    } catch (error) {
      return null;
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    getCurrentUser: (request: any) => Promise<any>;
  }
}
