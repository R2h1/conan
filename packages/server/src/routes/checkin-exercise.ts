import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

interface ExerciseRecordBody {
  type: string;
  duration: number;
  distance?: number;
  calories?: number;
  heartRate?: number;
  note?: string;
  date: string;
}

export default async function checkinExerciseRoutes(fastify: FastifyInstance) {
  // 获取所有运动记录（支持日期范围、类型筛选）
  fastify.get('/api/checkin/exercise', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const query = request.query as {
      startDate?: string;
      endDate?: string;
      type?: string;
      minDuration?: string;
      maxDuration?: string;
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

    // 排序：默认按日期降序
    const orderBy: any = { date: 'desc' };

    const records = await prisma.exerciseRecord.findMany({
      where,
      orderBy,
    });

    return records;
  });

  // 获取单条运动记录
  fastify.get('/api/checkin/exercise/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const record = await prisma.exerciseRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!record) {
      return reply.status(404).send({ error: '运动记录不存在' });
    }

    return record;
  });

  // 创建运动记录
  fastify.post('/api/checkin/exercise', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { type, duration, distance, calories, heartRate, note, date } = request.body as ExerciseRecordBody;

    // 验证必填字段
    if (!type || !duration || !date) {
      return reply.status(400).send({ error: '类型、时长和日期不能为空' });
    }

    // 验证时长为正数
    if (duration <= 0) {
      return reply.status(400).send({ error: '时长必须大于0' });
    }

    const record = await prisma.exerciseRecord.create({
      data: {
        type,
        duration,
        distance: distance || null,
        calories: calories || null,
        heartRate: heartRate || null,
        note: note || null,
        date: new Date(date),
        userId: user.userId,
      },
    });

    // 更新CheckinSummary
    await updateCheckinSummary(user.userId, new Date(date), 'exercise', true);

    return record;
  });

  // 更新运动记录
  fastify.put('/api/checkin/exercise/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };
    const { type, duration, distance, calories, heartRate, note, date } = request.body as ExerciseRecordBody;

    // 验证记录属于当前用户
    const existingRecord = await prisma.exerciseRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingRecord) {
      return reply.status(404).send({ error: '运动记录不存在' });
    }

    // 如果日期改变，更新CheckinSummary
    const oldDate = existingRecord.date;
    const newDate = new Date(date);
    const dateChanged = oldDate.getTime() !== newDate.getTime();

    const record = await prisma.exerciseRecord.update({
      where: { id: Number(id) },
      data: {
        type,
        duration,
        distance: distance || null,
        calories: calories || null,
        heartRate: heartRate || null,
        note: note || null,
        date: newDate,
        updatedAt: new Date(),
      },
    });

    // 如果日期改变，更新两个日期的CheckinSummary
    if (dateChanged) {
      await updateCheckinSummary(user.userId, oldDate, 'exercise', false);
      await updateCheckinSummary(user.userId, newDate, 'exercise', true);
    }

    return record;
  });

  // 删除运动记录
  fastify.delete('/api/checkin/exercise/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const existingRecord = await prisma.exerciseRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingRecord) {
      return reply.status(404).send({ error: '运动记录不存在' });
    }

    await prisma.exerciseRecord.delete({ where: { id: Number(id) } });

    // 检查当天是否还有其他运动记录，更新CheckinSummary
    const sameDayCount = await prisma.exerciseRecord.count({
      where: {
        userId: user.userId,
        date: {
          gte: new Date(existingRecord.date.getFullYear(), existingRecord.date.getMonth(), existingRecord.date.getDate()),
          lt: new Date(existingRecord.date.getFullYear(), existingRecord.date.getMonth(), existingRecord.date.getDate() + 1),
        },
      },
    });

    await updateCheckinSummary(user.userId, existingRecord.date, 'exercise', sameDayCount > 0);

    return { success: true };
  });

  // 获取运动统计
  fastify.get('/api/checkin/exercise/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const query = request.query as {
      startDate?: string;
      endDate?: string;
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

    const records = await prisma.exerciseRecord.findMany({
      where,
    });

    // 计算统计数据
    let totalDuration = 0;
    let totalDistance = 0;
    let totalCalories = 0;
    const typeStats = new Map<string, { duration: number; count: number; distance: number; calories: number }>();

    records.forEach(record => {
      totalDuration += record.duration;
      totalDistance += record.distance || 0;
      totalCalories += record.calories || 0;

      // 统计类型
      const type = record.type;
      const stats = typeStats.get(type) || { duration: 0, count: 0, distance: 0, calories: 0 };
      stats.duration += record.duration;
      stats.count += 1;
      stats.distance += record.distance || 0;
      stats.calories += record.calories || 0;
      typeStats.set(type, stats);
    });

    const typeArray = Array.from(typeStats.entries()).map(([name, stats]) => ({
      name,
      duration: stats.duration,
      count: stats.count,
      averageDuration: stats.duration / stats.count,
      distance: stats.distance,
      calories: stats.calories,
      percentage: (stats.duration / totalDuration) * 100,
    }));

    // 计算每日趋势（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.exerciseRecord.groupBy({
      by: ['date'],
      where: {
        userId: user.userId,
        date: { gte: thirtyDaysAgo },
      },
      _sum: {
        duration: true,
        distance: true,
        calories: true,
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
      distance: day._sum.distance || 0,
      calories: day._sum.calories || 0,
      count: day._count.id,
    }));

    return {
      summary: {
        totalDuration,
        totalDistance,
        totalCalories,
        recordCount: records.length,
        averageDuration: records.length > 0 ? totalDuration / records.length : 0,
      },
      types: typeArray.sort((a, b) => b.duration - a.duration),
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