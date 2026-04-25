import { PrismaClient } from '@prisma/client/index.js';

const prisma = new PrismaClient();

interface WechatMessage {
  msgtype: string;
  text?: {
    content: string;
  };
  markdown?: {
    content: string;
  };
}

export class WechatService {
  /**
   * 发送企业微信消息
   */
  static async sendMessage(webhookUrl: string, message: WechatMessage): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('发送企业微信消息失败:', error);
      return false;
    }
  }

  /**
   * 发送每日打卡提醒
   */
  static async sendDailyReminder(webhookUrl: string, user: { name?: string; email?: string; userId: number }): Promise<boolean> {
    try {
      // 获取用户今日打卡状态
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [financeCount, exerciseCount, studyCount] = await Promise.all([
        prisma.financeRecord.count({
          where: {
            userId: user.userId,
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),
        prisma.exerciseRecord.count({
          where: {
            userId: user.userId,
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),
        prisma.studyRecord.count({
          where: {
            userId: user.userId,
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),
      ]);

      const hasFinance = financeCount > 0;
      const hasExercise = exerciseCount > 0;
      const hasStudy = studyCount > 0;

      // 计算连续打卡天数
      const streak = await this.calculateStreak(user.userId);

      const message: WechatMessage = {
        msgtype: 'markdown',
        markdown: {
          content: `# 📅 每日打卡提醒

**用户**: ${user.name || user.email || `用户${user.userId}`}
**时间**: ${new Date().toLocaleString('zh-CN')}

## 今日打卡情况
${hasFinance ? '✅' : '⭕'} **财务记账**: ${hasFinance ? '已完成' : '未完成'}
${hasExercise ? '✅' : '⭕'} **运动记录**: ${hasExercise ? '已完成' : '未完成'}
${hasStudy ? '✅' : '⭕'} **学习阅读**: ${hasStudy ? '已完成' : '未完成'}

## 📊 连续打卡
**当前连续打卡**: ${streak.current}天
**最长连续打卡**: ${streak.longest}天

## 💡 建议
${!hasFinance ? '- 记得记录今日的财务收支\n' : ''}${!hasExercise ? '- 别忘了记录运动情况\n' : ''}${!hasStudy ? '- 抽时间学习或阅读吧\n' : ''}${hasFinance && hasExercise && hasStudy ? '- 太棒了！今天已经完成所有打卡任务！继续保持！\n' : ''}

> 打开 [Conan](http://localhost:5173/app/checkin) 开始打卡`,
        },
      };

      return await this.sendMessage(webhookUrl, message);
    } catch (error) {
      console.error('生成每日提醒失败:', error);
      return false;
    }
  }

  /**
   * 发送连续打卡成就通知
   */
  static async sendStreakAchievement(webhookUrl: string, user: { name?: string; email?: string; userId: number }, streak: number): Promise<boolean> {
    let achievement = '';
    if (streak === 3) achievement = '🎉 **连续打卡3天**！良好的开始！';
    else if (streak === 7) achievement = '🏆 **连续打卡7天**！第一周达成！';
    else if (streak === 14) achievement = '🌟 **连续打卡14天**！习惯正在形成！';
    else if (streak === 21) achievement = '🔥 **连续打卡21天**！习惯养成！';
    else if (streak === 30) achievement = '🚀 **连续打卡30天**！月度成就！';
    else if (streak === 100) achievement = '🎊 **连续打卡100天**！百日成就！';
    else if (streak % 50 === 0) achievement = `📊 **连续打卡${streak}天**！继续加油！`;

    if (!achievement) return false;

    const message: WechatMessage = {
      msgtype: 'markdown',
      markdown: {
        content: `# ${achievement}

**用户**: ${user.name || user.email || `用户${user.userId}`}
**成就**: 连续打卡${streak}天
**时间**: ${new Date().toLocaleString('zh-CN')}

## 🎯 保持动力
坚持打卡不仅能培养好习惯，还能通过数据看到自己的成长轨迹！

> 查看 [打卡统计](http://localhost:5173/app/checkin/stats) 了解更多`,
      },
    };

    return await this.sendMessage(webhookUrl, message);
  }

  /**
   * 发送异常消费提醒
   */
  static async sendAbnormalSpendingAlert(
    webhookUrl: string,
    user: { name?: string; email?: string; userId: number },
    record: { amount: number; category: string; date: string; note?: string }
  ): Promise<boolean> {
    const message: WechatMessage = {
      msgtype: 'markdown',
      markdown: {
        content: `# ⚠️ 异常消费提醒

**用户**: ${user.name || user.email || `用户${user.userId}`}
**时间**: ${new Date(record.date).toLocaleDateString('zh-CN')}

## 💰 消费详情
**金额**: ${record.amount.toFixed(2)}元
**分类**: ${record.category}
${record.note ? `**备注**: ${record.note}\n` : ''}

## 📈 消费分析
这笔消费金额较大，请注意控制预算。

> 查看 [财务记录](http://localhost:5173/app/checkin/finance) 了解更多`,
      },
    };

    return await this.sendMessage(webhookUrl, message);
  }

  /**
   * 计算用户连续打卡天数
   */
  static async calculateStreak(userId: number): Promise<{ current: number; longest: number }> {
    try {
      // 获取所有打卡记录（财务、运动、学习）
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dates = new Set<string>();

      // 获取最近30天的记录
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [financeRecords, exerciseRecords, studyRecords] = await Promise.all([
        prisma.financeRecord.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo },
          },
          select: { date: true },
        }),
        prisma.exerciseRecord.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo },
          },
          select: { date: true },
        }),
        prisma.studyRecord.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo },
          },
          select: { date: true },
        }),
      ]);

      // 收集所有有打卡的日期
      [...financeRecords, ...exerciseRecords, ...studyRecords].forEach(record => {
        const date = new Date(record.date);
        date.setHours(0, 0, 0, 0);
        dates.add(date.toISOString().split('T')[0]);
      });

      // 计算连续打卡天数
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // 检查今天是否有打卡
      const todayStr = today.toISOString().split('T')[0];
      const hasToday = dates.has(todayStr);

      // 从昨天开始往前检查
      const dateToCheck = new Date(today);
      if (!hasToday) {
        dateToCheck.setDate(dateToCheck.getDate() - 1); // 如果今天没打卡，从昨天开始
      }

      while (true) {
        const dateStr = dateToCheck.toISOString().split('T')[0];
        if (dates.has(dateStr)) {
          currentStreak++;
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
          if (dateToCheck < new Date(thirtyDaysAgo)) {
            break;
          }
        }

        dateToCheck.setDate(dateToCheck.getDate() - 1);
        if (dateToCheck < new Date(thirtyDaysAgo)) {
          break;
        }
      }

      return {
        current: currentStreak,
        longest: longestStreak,
      };
    } catch (error) {
      console.error('计算连续打卡天数失败:', error);
      return { current: 0, longest: 0 };
    }
  }
}