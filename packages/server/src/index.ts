import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: true }); // 开发时允许所有，生产可限制

// 获取所有笔记（支持搜索和标签筛选）
fastify.get('/api/notes', async (request, reply) => {
  const { search, tag } = request.query as { search?: string; tag?: string };
  const where: any = {};
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
  return notes.map((n) => ({ ...n, tags: n.tags ? n.tags.split(',') : [] }));
});

// 获取单个笔记
fastify.get('/api/notes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const note = await prisma.note.findUnique({ where: { id: Number(id) } });
  if (!note) return reply.status(404).send({ error: 'Not found' });
  return { ...note, tags: note.tags ? note.tags.split(',') : [] };
});

// 创建笔记
fastify.post('/api/notes', async (request, reply) => {
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
    },
  });
  return { ...note, tags };
});

// 更新笔记
fastify.put('/api/notes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { title, content, tags } = request.body as {
    title: string;
    content: string;
    tags: string[];
  };
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

// 删除笔记
fastify.delete('/api/notes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
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
