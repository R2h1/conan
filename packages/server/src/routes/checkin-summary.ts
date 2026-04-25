import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

export default async function checkinSummaryRoutes(fastify: FastifyInstance) {
  // 获取月视图打卡日历数据
  fastify.get('/api/checkin/calendar', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { year, month } = request.query as { year?: string; month?: string };

    // 默认当前年月
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();

    // 计算月份的开始和结束日期
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0); // 当月最后一天

    // 获取该月份的所有打卡摘要
    const summaries = await prisma.checkinSummary.findMany({
      where: {
        userId: user.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 转换为日历格式
    const calendarData: Record<string, any> = {};
    summaries.forEach(summary => {
      const dateStr = summary.date.toISOString().split('T')[0];
      calendarData[dateStr] = {
        hasFinance: summary.hasFinance,
        hasExercise: summary.hasExercise,
        hasStudy: summary.hasStudy,
        date: summary.date,
      };
    });

    // 生成完整的日历数据（包括没有记录的日期）
    const daysInMonth = endDate.getDate();
    const fullCalendar = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const summary = calendarData[dateStr];

      fullCalendar.push({
        date: dateStr,
        day,
        hasFinance: summary?.hasFinance || false,
        hasExercise: summary?.hasExercise || false,
        hasStudy: summary?.hasStudy || false,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }

    // 获取统计数据
    const monthStats = {
      totalDays: daysInMonth,
      financeDays: summaries.filter(s => s.hasFinance).length,
      exerciseDays: summaries.filter(s => s.hasExercise).length,
      studyDays: summaries.filter(s => s.hasStudy).length,
      fullyCheckedDays: summaries.filter(s => s.hasFinance && s.hasExercise && s.hasStudy).length,
    };

    return {
      year: targetYear,
      month: targetMonth + 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      calendar: fullCalendar,
      stats: monthStats,
    };
  });

  // 获取打卡统计概览
  fastify.get('/api/checkin/stats/overview', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 最近两个月
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    // 获取打卡摘要
    const summaries = await prisma.checkinSummary.findMany({
      where: {
        userId: user.userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 获取详细记录用于统计
    const [financeRecords, exerciseRecords, studyRecords] = await Promise.all([
      prisma.financeRecord.findMany({
        where: {
          userId: user.userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.exerciseRecord.findMany({
        where: {
          userId: user.userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.studyRecord.findMany({
        where: {
          userId: user.userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

    // 财务统计
    const financeStats = {
      totalIncome: financeRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0),
      totalExpense: financeRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0),
      categoryBreakdown: {} as Record<string, number>,
      accountBreakdown: {} as Record<string, number>,
    };

    financeRecords.forEach(record => {
      const amount = record.type === 'expense' ? -record.amount : record.amount;

      // 分类统计
      if (record.category) {
        financeStats.categoryBreakdown[record.category] =
          (financeStats.categoryBreakdown[record.category] || 0) + amount;
      }

      // 账户统计
      if (record.account) {
        financeStats.accountBreakdown[record.account] =
          (financeStats.accountBreakdown[record.account] || 0) + amount;
      }
    });

    // 运动统计
    const exerciseStats = {
      totalDuration: exerciseRecords.reduce((sum, r) => sum + r.duration, 0),
      totalDistance: exerciseRecords.reduce((sum, r) => sum + (r.distance || 0), 0),
      totalCalories: exerciseRecords.reduce((sum, r) => sum + (r.calories || 0), 0),
      typeBreakdown: {} as Record<string, { duration: number; count: number }>,
    };

    exerciseRecords.forEach(record => {
      if (record.type) {
        if (!exerciseStats.typeBreakdown[record.type]) {
          exerciseStats.typeBreakdown[record.type] = { duration: 0, count: 0 };
        }
        exerciseStats.typeBreakdown[record.type].duration += record.duration;
        exerciseStats.typeBreakdown[record.type].count += 1;
      }
    });

    // 学习统计
    const studyStats = {
      totalDuration: studyRecords.reduce((sum, r) => sum + r.duration, 0),
      totalPages: studyRecords.reduce((sum, r) => sum + (r.pages || 0), 0),
      typeBreakdown: {} as Record<string, { duration: number; count: number }>,
      contentBreakdown: {} as Record<string, { duration: number; count: number; progress: number }>,
    };

    studyRecords.forEach(record => {
      // 类型统计
      const typeKey = record.type;
      if (!studyStats.typeBreakdown[typeKey]) {
        studyStats.typeBreakdown[typeKey] = { duration: 0, count: 0 };
      }
      studyStats.typeBreakdown[typeKey].duration += record.duration;
      studyStats.typeBreakdown[typeKey].count += 1;

      // 内容统计
      if (record.content) {
        if (!studyStats.contentBreakdown[record.content]) {
          studyStats.contentBreakdown[record.content] = { duration: 0, count: 0, progress: 0 };
        }
        studyStats.contentBreakdown[record.content].duration += record.duration;
        studyStats.contentBreakdown[record.content].count += 1;
        studyStats.contentBreakdown[record.content].progress = Math.max(
          studyStats.contentBreakdown[record.content].progress,
          record.progress || 0
        );
      }
    });

    // 打卡连续性统计
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    summaries.sort((a, b) => a.date.getTime() - b.date.getTime());

    summaries.forEach((summary, index) => {
      const hasAny = summary.hasFinance || summary.hasExercise || summary.hasStudy;
      if (hasAny) {
        if (lastDate) {
          const dayDiff = Math.floor((summary.date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        lastDate = summary.date;
        maxStreak = Math.max(maxStreak, tempStreak);

        // 如果是今天或昨天，更新当前连续打卡
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const summaryDateStr = summary.date.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (summaryDateStr === todayStr || summaryDateStr === yesterdayStr) {
          currentStreak = tempStreak;
        }
      }
    });

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: {
        totalDays: summaries.length,
        financeDays: summaries.filter(s => s.hasFinance).length,
        exerciseDays: summaries.filter(s => s.hasExercise).length,
        studyDays: summaries.filter(s => s.hasStudy).length,
        fullyCheckedDays: summaries.filter(s => s.hasFinance && s.hasExercise && s.hasStudy).length,
        currentStreak,
        maxStreak,
      },
      finance: financeStats,
      exercise: exerciseStats,
      study: studyStats,
    };
  });
}