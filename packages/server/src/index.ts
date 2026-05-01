import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client/index.js';
import authRoutes from './routes/auth.js';
import activitiesRoutes from './routes/activities.js';
import aiGatewayRoutes from './routes/ai-gateway.js';
import { requireAuth } from './plugins/auth-middleware.js';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

// 先注册 cookie（必须在 cors 之前）
fastify.register(cookie, {
  secret: process.env.JWT_SECRET || 'min-32-char-secret-key-for-dev',
});

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// 注册 JWT 插件（添加 cookie 配置以自动从 cookie 读取 token）
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'min-32-char-secret-key-for-dev',
  cookie: {
    cookieName: 'token',
    signed: true, // 使用 cookie secret 签名
  },
  sign: {
    expiresIn: '7d',
  },
});

// 注册认证路由
fastify.register(authRoutes);

// 获取统计数据 - 需要认证
fastify.get('/api/stats', async (request, reply) => {
  await requireAuth(request, reply);
  // 笔记功能已移除，返回默认值
  return { notes: 0, weekNotes: 0, toolUses: 0 };
});


// 注册活动记录路由
fastify.register(activitiesRoutes);
fastify.register(aiGatewayRoutes);
// 获取当前用户信息
fastify.get('/api/auth/me', async (request, reply) => {
  try {
    await request.jwtVerify();
    const user: any = request.user;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true },
    });

    if (!dbUser) {
      return reply.status(404).send({ error: '用户不存在' });
    }

    return { user: dbUser };
  } catch (error) {
    return reply.status(401).send({ error: '未授权' });
  }
});


const start = async () => {
  try {

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
