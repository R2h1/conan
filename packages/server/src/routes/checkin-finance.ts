import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

interface FinanceRecordBody {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: string;
  note?: string;
  date: string;
  tags?: string[];
}

export default async function checkinFinanceRoutes(fastify: FastifyInstance) {
  // 获取所有财务记录（支持日期范围、类型、分类筛选）
  fastify.get('/api/checkin/finance', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const query = request.query as {
      startDate?: string;
      endDate?: string;
      type?: string;
      category?: string;
      minAmount?: string;
      maxAmount?: string;
      tag?: string;
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

    // 分类筛选
    if (query.category) {
      where.category = query.category;
    }

    // 金额范围筛选
    if (query.minAmount || query.maxAmount) {
      where.amount = {};
      if (query.minAmount) {
        where.amount.gte = parseFloat(query.minAmount);
      }
      if (query.maxAmount) {
        where.amount.lte = parseFloat(query.maxAmount);
      }
    }

    // 标签筛选
    if (query.tag) {
      where.tags = { contains: query.tag };
    }

    // 排序：默认按日期降序
    const orderBy: any = { date: 'desc' };

    const records = await prisma.financeRecord.findMany({
      where,
      orderBy,
    });

    // 将 tags 字符串转回数组
    return records.map((record: any) => ({
      ...record,
      tags: record.tags ? record.tags.split(',') : [],
    }));
  });

  // 获取单条财务记录
  fastify.get('/api/checkin/finance/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };

    const record = await prisma.financeRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!record) {
      return reply.status(404).send({ error: '财务记录不存在' });
    }

    return { ...record, tags: record.tags ? record.tags.split(',') : [] };
  });

  // 创建财务记录
  fastify.post('/api/checkin/finance', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { type, amount, category, account, note, date, tags } = request.body as FinanceRecordBody;

    // 验证必填字段
    if (!type || !amount || !category || !account || !date) {
      return reply.status(400).send({ error: '类型、金额、分类、账户和日期不能为空' });
    }

    // 验证金额为正数
    if (amount <= 0) {
      return reply.status(400).send({ error: '金额必须大于0' });
    }

    // 验证类型
    if (!['income', 'expense'].includes(type)) {
      return reply.status(400).send({ error: '类型必须是income或expense' });
    }

    const record = await prisma.financeRecord.create({
      data: {
        type,
        amount,
        category,
        account,
        note: note || null,
        date: new Date(date),
        tags: (tags || []).join(','),
        userId: user.userId,
      },
    });

    // 更新CheckinSummary
    await updateCheckinSummary(user.userId, new Date(date), 'finance', true);

    return { ...record, tags };
  });

  // 更新财务记录
  fastify.put('/api/checkin/finance/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { id } = request.params as { id: string };
    const { type, amount, category, account, note, date, tags } = request.body as FinanceRecordBody;

    // 验证记录属于当前用户
    const existingRecord = await prisma.financeRecord.findFirst({
      where: { id: Number(id), userId: user.userId },
    });

    if (!existingRecord) {
      return reply.status(404).send({ error: '财务记录不存在' });
    }

    // 如果日期改变，更新CheckinSummary
    const oldDate = existingRecord.date;
    const newDate = new Date(date);
    const dateChanged = oldDate.getTime() !== newDate.getTime();

    const record = await prisma.financeRecord.update({
      where: { id: Number(id) },
      data: {
        type,
        amount,
        category,
        account,
        note: note || null,
        date: newDate,
        tags: (tags || []).join(','),
        updatedAt: new Date(),
      },
    });

    // 如果日期改变，更新两个日期的CheckinSummary
    if (dateChanged) {
      await updateCheckinSummary(user.userId, oldDate, 'finance', false);
      await updateCheckinSummary(user.userId, newDate, 'finance', true);
    }

    return { ...record, tags };
  });

  // 删除财务记录

fastify.delete('/api/checkin/finance/:id', async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);

  const user: any = request.user;
  const { id } = request.params as { id: string };

  const existingRecord = await prisma.financeRecord.findFirst({
    where: { id: Number(id), userId: user.userId },
  });

  if (!existingRecord) {
    return reply.status(404).send({ error: '财务记录不存在' });
  }

  await prisma.financeRecord.delete({ where: { id: Number(id) } });

  // 检查当天是否还有其他财务记录，更新CheckinSummary
  const sameDayCount = await prisma.financeRecord.count({
    where: {
      userId: user.userId,
      date: {
        gte: new Date(existingRecord.date.getFullYear(), existingRecord.date.getMonth(), existingRecord.date.getDate()),
        lt: new Date(existingRecord.date.getFullYear(), existingRecord.date.getMonth(), existingRecord.date.getDate() + 1),
      },
    },
  });

  await updateCheckinSummary(user.userId, existingRecord.date, 'finance', sameDayCount > 0);

  return { success: true };
  });

  // 获取财务统计
  fastify.get('/api/checkin/finance/stats', async (request: FastifyRequest, reply: FastifyReply) => {
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

  const records = await prisma.financeRecord.findMany({
  where,
  });

  // 计算统计数据
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryStats = new Map<string, { income: number; expense: number; total: number }>();

  records.forEach(record => {
  if (record.type === 'income') {
  totalIncome += record.amount;
  } else {
  totalExpense += record.amount;
  }

  // 统计分类
  const category = record.category;
  const stats = categoryStats.get(category) || { income: 0, expense: 0, total: 0 };
  if (record.type === 'income') {
  stats.income += record.amount;
  } else {
  stats.expense += record.amount;
  }
  stats.total += record.amount;
  categoryStats.set(category, stats);
  });

  const netBalance = totalIncome - totalExpense;
  const categoryArray = Array.from(categoryStats.entries()).map(([name, stats]) => ({
  name,
  income: stats.income,
  expense: stats.expense,
  total: stats.total,
  percentage: (stats.total / (totalIncome + totalExpense)) * 100,
  }));

  return {
  summary: {
  totalIncome,
  totalExpense,
  netBalance,
  recordCount: records.length,
  },
  categories: categoryArray.sort((a, b) => b.total - a.total),
  };
  });
}

  // 更新打卡日历摘要
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