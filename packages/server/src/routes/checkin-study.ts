import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

interface StudyRecordBody {
  type: 'study' | 'read';
  content: string;
  duration: number;
  pages?: number;
  progress?: number;
  noteId?: number;
  summary?: string;
  date: string;
}

export default async function checkinStudyRoutes(fastify: FastifyInstance) {
  // 获取所有学习阅读记录（支持日期范围、类型、内容筛选）
  fastify.get('/api/checkin/study', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const query = request.query as {
      startDate?: string;
      endDate?: string;
      type?: string;
      content?: string;
      minDuration?: string;
      maxDuration?: string;
      minProgress?: string;
      maxProgress?: string;
    };

    const where: any = { userId: user.userId };

    // 日期范围筛选
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    // 类型筛选
    if (query.type) {
      where.type = query.type;
    }

    // 内容搜索
    if (query.content) {
      where.content = { contains: query.content };
    }

    // 时长范围筛选
    if (query.minDuration || query.maxDuration) {
      where.duration = {};
      if (query.minDuration) {
        where.duration.gte = parseInt(query.minDuration);
      }
      if (query.maxDuration) {
        where.duration.lte = parseInt(query.maxDuration);
      }
    }

    // 进度范围筛选
    if (query.minProgress || query.maxProgress) {
      where.progress = {};
      if (query.minProgress) {
        where.progress.gte = parseFloat(query.minProgress);
      }
      if (query.maxProgress) {
        where.progress.lte = parseFloat(query.maxProgress);
      }
    }

    // 排序：默认按日期降序
    const orderBy: any = { date: 'desc' };

    const records = await prisma.studyRecord.findMany({
      where,
      orderBy,
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return records.map(record => ({
      ...record,
      note: record.note ? { id: record.note.id, title: record.note.title } : null,
    }));
  });

  // 获取单条学习阅读记录
  fastify.get('/api/checkin/study/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const record = await prisma.studyRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
    });

    if (!record) {
      return reply.status(404).send({ error: '学习记录不存在' });
    }

    return {
      ...record,
      note: record.note ? { id: record.note.id, title: record.note.title } : null,
    };
  });

  // 创建学习阅读记录
  fastify.post('/api/checkin/study', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { type, content, duration, pages, progress, noteId, summary, date } = request.body as StudyRecordBody;

    // 验证必填字段
    if (!type || !content || !duration || !date) {
      return reply.status(400).send({ error: '类型、内容、时长和日期不能为空' });
    }

    // 验证时长为正数
    if (duration <= 0) {
      return reply.status(400).send({ error: '时长必须大于0' });
    }

    // 验证类型
    if (!['study', 'read'].includes(type)) {
      return reply.status(400).send({ error: '类型必须是study或read' });
    }

    // 验证noteId存在（如果提供）
    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId: user.userId },
      });
      if (!note) {
        return reply.status(404).send({ error: '关联的笔记不存在' });
      }
    }

    const record = await prisma.studyRecord.create({
      data: {
        type,
        content,
        duration,
        pages: pages || null,
        progress: progress || null,
        noteId: noteId || null,
        summary: summary || null,
        date: new Date(date),
        userId: user.userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // 更新CheckinSummary
    await updateCheckinSummary(user.userId, new Date(date), 'study', true);

    return {
      ...record,
      note: record.note ? { id: record.note.id, title: record.note.title } : null,
    };
  });

  // 更新学习阅读记录
  fastify.put('/api/checkin/study/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };
    const { type, content, duration, pages, progress, noteId, summary, date } = request.body as StudyRecordBody;

    // 验证记录属于当前用户
    const existingRecord = await prisma.studyRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingRecord) {
      return reply.status(404).send({ error: '学习记录不存在' });
    }

    // 验证noteId存在（如果提供）
    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId: user.userId },
      });
      if (!note) {
        return reply.status(404).send({ error: '关联的笔记不存在' });
      }
    }

    // 如果日期改变，更新CheckinSummary
    const oldDate = existingRecord.date;
    const newDate = new Date(date);
    const dateChanged = oldDate.getTime() !== newDate.getTime();

    const record = await prisma.studyRecord.update({
      where: { id: Number(id) },
      data: {
        type,
        content,
        duration,
        pages: pages || null,
        progress: progress || null,
        noteId: noteId || null,
        summary: summary || null,
        date: newDate,
        updatedAt: new Date(),
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // 如果日期改变，更新两个日期的CheckinSummary
    if (dateChanged) {
      await updateCheckinSummary(user.userId, oldDate, 'study', false);
      await updateCheckinSummary(user.userId, newDate, 'study', true);
    }

    return {
      ...record,
      note: record.note ? { id: record.note.id, title: record.note.title } : null,
    };
  });

  // 删除学习阅读记录
  fastify.delete('/api/checkin/study/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const existingRecord = await prisma.studyRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingRecord) {
      return reply.status(404).send({ error: '学习记录不存在' });
    }

    await prisma.studyRecord.delete({ where: { id: Number(id) } });

    // 检查当天是否还有其他学习记录，更新CheckinSummary
    const sameDayCount = await prisma.studyRecord.count({
      where: {
        userId: user.userId,
        date: {
          gte: new Date(existingRecord.date.getFullYear(), existingRecord.date.getMonth(), existingRecord.date.getDate()),
          lt: new Date(existingRecord.date.getFullYear(), existingRecord.date.getMonth(), existingRecord.date.getDate() + 1),
        },
      },
    });

    await updateCheckinSummary(user.userId, existingRecord.date, 'study', sameDayCount > 0);

    return { success: true };
  });

  // 获取学习统计
  fastify.get('/api/checkin/study/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const query = request.query as {
      startDate?: string;
      endDate?: string;
      type?: string;
    };

    const where: any = { userId: user.userId };

    // 日期范围筛选
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    // 类型筛选
    if (query.type) {
      where.type = query.type;
    }

    const records = await prisma.studyRecord.findMany({
      where,
    });

    // 计算统计数据
    let totalDuration = 0;
    let totalPages = 0;
    const typeStats = new Map<string, { duration: number; count: number; pages: number }>();
    const contentStats = new Map<string, { duration: number; count: number; progress: number }>();

    records.forEach(record => {
      totalDuration += record.duration;
      totalPages += record.pages || 0;

      // 统计类型
      const type = record.type;
      const typeStat = typeStats.get(type) || { duration: 0, count: 0, pages: 0 };
      typeStat.duration += record.duration;
      typeStat.count += 1;
      typeStat.pages += record.pages || 0;
      typeStats.set(type, typeStat);

      // 统计内容
      const content = record.content;
      const contentStat = contentStats.get(content) || { duration: 0, count: 0, progress: 0 };
      contentStat.duration += record.duration;
      contentStat.count += 1;
      contentStat.progress = Math.max(contentStat.progress, record.progress || 0);
      contentStats.set(content, contentStat);
    });

    const typeArray = Array.from(typeStats.entries()).map(([name, stats]) => ({
      name,
      duration: stats.duration,
      count: stats.count,
      averageDuration: stats.duration / stats.count,
      pages: stats.pages,
      percentage: (stats.duration / totalDuration) * 100,
    }));

    const contentArray = Array.from(contentStats.entries()).map(([name, stats]) => ({
      name,
      duration: stats.duration,
      count: stats.count,
      progress: stats.progress,
      averageDuration: stats.duration / stats.count,
    }));

    // 计算每日趋势（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.studyRecord.groupBy({
      by: ['date'],
      where: {
        userId: user.userId,
        date: { gte: thirtyDaysAgo },
      },
      _sum: {
        duration: true,
        pages: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const dailyTrend = dailyStats.map(day => ({
      date: day.date,
      duration: day._sum.duration || 0,
      pages: day._sum.pages || 0,
      count: day._count.id,
    }));

    return {
      summary: {
        totalDuration,
        totalPages,
        recordCount: records.length,
        averageDuration: records.length > 0 ? totalDuration / records.length : 0,
      },
      types: typeArray.sort((a, b) => b.duration - a.duration),
      contents: contentArray.sort((a, b) => b.duration - a.duration),
      dailyTrend,
    };
  });
}

// 更新打卡日历摘要（从checkin-finance.ts复制）
async function updateCheckinSummary(
  userId: number,
  date: Date,
  field: 'finance' | 'exercise' | 'study',
  hasRecord: boolean
) {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  try {
    await prisma.checkinSummary.upsert({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
      update: {
        [`has${field.charAt(0).toUpperCase() + field.slice(1)}`]: hasRecord,
        updatedAt: new Date(),
      },
      create: {
        userId,
        date: dayStart,
        [`has${field.charAt(0).toUpperCase() + field.slice(1)}`]: hasRecord,
      },
    });
  } catch (error) {
    console.error(`Failed to update CheckinSummary for ${field}:`, error);
  }
}