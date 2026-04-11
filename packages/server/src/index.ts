import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client/index.js';
import authRoutes from './routes/auth.js';
import ideaRoutes from './routes/ideas.js';
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
  const user: any = request.user;

  const noteCount = await prisma.note.count({ where: { userId: user.userId } });
  const ideaCount = await prisma.idea.count({ where: { userId: user.userId } });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekNotes = await prisma.note.count({
    where: { userId: user.userId, createdAt: { gte: oneWeekAgo } },
  });

  return { notes: noteCount, ideas: ideaCount, weekNotes, toolUses: 0 };
});

// 注册灵感路由
fastify.register(ideaRoutes);

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

// 获取所有笔记（支持搜索和标签筛选）- 需要认证
fastify.get('/api/notes', async (request, reply) => {
  await requireAuth(request, reply);

  const user: any = request.user;
  const { search, tag } = request.query as { search?: string; tag?: string };

  const where: any = { userId: user.userId };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }
  if (tag) {
    where.tags = { contains: tag };
  }
  const notes = await prisma.note.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });
  // 将 tags 字符串转回数组
  return notes.map((n: any) => ({
    ...n,
    tags: n.tags ? n.tags.split(',') : [],
  }));
});

// 获取单个笔记 - 需要认证
fastify.get('/api/notes/:id', async (request, reply) => {
  await requireAuth(request, reply);

  const user: any = request.user;
  const { id } = request.params as { id: string };

  const note = await prisma.note.findFirst({
    where: { id: Number(id), userId: user.userId },
  });

  if (!note) return reply.status(404).send({ error: '笔记不存在' });
  return { ...note, tags: note.tags ? note.tags.split(',') : [] };
});

// 获取相关笔记（基于标签匹配）- 需要认证
fastify.get('/api/notes/:id/related', async (request, reply) => {
  await requireAuth(request, reply);

  const user: any = request.user;
  const { id } = request.params as { id: string };

  // 获取当前笔记
  const currentNote = await prisma.note.findFirst({
    where: { id: Number(id), userId: user.userId },
  });

  if (!currentNote) return reply.status(404).send({ error: '笔记不存在' });

  const currentTags = currentNote.tags ? currentNote.tags.split(',') : [];

  if (currentTags.length === 0) {
    // 如果没有标签，返回最近的笔记
    const notes = await prisma.note.findMany({
      where: {
        id: { not: Number(id) },
        userId: user.userId,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });
    return notes.map((n: any) => ({
      ...n,
      tags: n.tags ? n.tags.split(',') : [],
    }));
  }

  // 查找有相同标签的笔记
  const notes = await prisma.note.findMany({
    where: {
      id: { not: Number(id) },
      userId: user.userId,
      tags: {
        contains: currentTags.join(','),
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  // 计算匹配度（匹配标签数量）
  const relatedNotes = notes.map((n: any) => {
    const noteTags = n.tags ? n.tags.split(',') : [];
    const matchCount = currentTags.filter((t) => noteTags.includes(t)).length;
    return {
      ...n,
      tags: n.tags ? n.tags.split(',') : [],
      matchScore: matchCount,
    };
  });

  // 按匹配度排序
  return relatedNotes.sort((a, b) => b.matchScore - a.matchScore);
});

// 创建笔记 - 需要认证
fastify.post('/api/notes', async (request, reply) => {
  await requireAuth(request, reply);

  const user: any = request.user;
  const { title, content, tags } = request.body as {
    title: string;
    content: string;
    tags: string[];
  };

  const note = await prisma.note.create({
    data: {
      title,
      content,
      tags: tags.join(','),
      userId: user.userId,
    },
  });
  return { ...note, tags };
});

// 更新笔记 - 需要认证
fastify.put('/api/notes/:id', async (request, reply) => {
  await requireAuth(request, reply);

  const user: any = request.user;
  const { id } = request.params as { id: string };
  const { title, content, tags } = request.body as {
    title: string;
    content: string;
    tags: string[];
  };

  // 验证笔记属于当前用户
  const existingNote = await prisma.note.findFirst({
    where: { id: Number(id), userId: user.userId },
  });

  if (!existingNote) {
    return reply.status(404).send({ error: '笔记不存在' });
  }

  const note = await prisma.note.update({
    where: { id: Number(id) },
    data: {
      title,
      content,
      tags: tags.join(','),
      updatedAt: new Date(),
    },
  });
  return { ...note, tags };
});

// 删除笔记 - 需要认证
fastify.delete('/api/notes/:id', async (request, reply) => {
  await requireAuth(request, reply);

  const user: any = request.user;
  const { id } = request.params as { id: string };

  const existingNote = await prisma.note.findFirst({
    where: { id: Number(id), userId: user.userId },
  });

  if (!existingNote) {
    return reply.status(404).send({ error: '笔记不存在' });
  }

  await prisma.note.delete({ where: { id: Number(id) } });
  return { success: true };
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
