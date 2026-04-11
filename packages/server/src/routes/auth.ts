import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/password.js';

const prisma = new PrismaClient();

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  // 注册
  fastify.post('/api/auth/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    const { name, email, password } = request.body;

    // 验证必填字段
    if (!name || !email || !password) {
      return reply.status(400).send({ error: '姓名、邮箱和密码不能为空' });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return reply.status(400).send({ error: '邮箱已被注册' });
      }
      if (existingUser.name === name) {
        return reply.status(400).send({ error: '用户名已被使用' });
      }
    }

    // 哈希密码并创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 生成 JWT token
    const token = fastify.jwt.sign({ userId: user.id, email: user.email });

    // 设置 HTTP-Only Cookie（signed 必须为 true，与 JWT 插件配置一致）
    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      signed: true,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  });

  // 登录
  fastify.post('/api/auth/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: '邮箱和密码不能为空' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({ error: '邮箱或密码错误' });
    }

    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      return reply.status(401).send({ error: '邮箱或密码错误' });
    }

    // 生成 JWT token
    const token = fastify.jwt.sign({ userId: user.id, email: user.email });

    // 设置 HTTP-Only Cookie（signed 必须为 true，与 JWT 插件配置一致）
    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      signed: true,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  });

  // 登出
  fastify.post('/api/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('token', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
    });
    return { success: true };
  });
}
