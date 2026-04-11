import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

interface IdeaBody {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export default async function ideaRoutes(fastify: FastifyInstance) {
  // 获取所有灵感（支持筛选和排序）
  fastify.get('/api/ideas', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const query = request.query as {
      category?: string;
      priority?: string;
      completed?: string;
      tag?: string;
      sort?: string;
    };

    const where: any = { userId: user.userId };

    // 筛选条件
    if (query.category) {
      where.category = query.category;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.completed !== undefined) {
      where.completed = query.completed === 'true';
    }
    if (query.tag) {
      where.tags = { contains: query.tag };
    }

    // 排序
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'priority') {
      orderBy = { priority: 'desc' }; // high > medium > low
    } else if (query.sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const ideas = await prisma.idea.findMany({
      where,
      orderBy,
    });

    // 将 tags 字符串转回数组
    return ideas.map((i: any) => ({
      ...i,
      tags: i.tags ? i.tags.split(',') : [],
    }));
  });

  // 获取单个灵感
  fastify.get('/api/ideas/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const idea = await prisma.idea.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!idea) {
      return reply.status(404).send({ error: '灵感不存在' });
    }

    return { ...idea, tags: idea.tags ? idea.tags.split(',') : [] };
  });

  // 创建灵感
  fastify.post('/api/ideas', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { title, content, category, tags, priority, completed } = request.body as IdeaBody;

    if (!title || !content) {
      return reply.status(400).send({ error: '标题和内容不能为空' });
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        content,
        category: category || null,
        tags: (tags || []).join(','),
        priority: priority || 'medium',
        completed: completed || false,
        userId: user.userId,
      },
    });

    return { ...idea, tags };
  });

  // 更新灵感
  fastify.put('/api/ideas/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };
    const { title, content, category, tags, priority, completed } = request.body as IdeaBody;

    // 验证灵感属于当前用户
    const existingIdea = await prisma.idea.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingIdea) {
      return reply.status(404).send({ error: '灵感不存在' });
    }

    const idea = await prisma.idea.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        category: category || null,
        tags: (tags || []).join(','),
        priority: priority || 'medium',
        completed: completed !== undefined ? completed : existingIdea.completed,
        updatedAt: new Date(),
      },
    });

    return { ...idea, tags };
  });

  // 删除灵感
  fastify.delete('/api/ideas/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const existingIdea = await prisma.idea.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingIdea) {
      return reply.status(404).send({ error: '灵感不存在' });
    }

    await prisma.idea.delete({ where: { id: Number(id) } });
    return { success: true };
  });

  // 切换完成状态
  fastify.patch('/api/ideas/:id/toggle', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const existingIdea = await prisma.idea.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingIdea) {
      return reply.status(404).send({ error: '灵感不存在' });
    }

    const idea = await prisma.idea.update({
      where: { id: Number(id) },
      data: {
        completed: !existingIdea.completed,
        updatedAt: new Date(),
      },
    });

    return { ...idea, tags: idea.tags ? idea.tags.split(',') : [] };
  });
}
