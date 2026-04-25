import schedule from 'node-schedule';
import { PrismaClient } from '@prisma/client/index.js';
import { WechatService } from './wechat-service.js';

const prisma = new PrismaClient();

export class SchedulerService {
  private static instance: SchedulerService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * 初始化调度器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 初始化打卡系统调度器...');

    // 每日提醒任务 - 每分钟检查一次
    schedule.scheduleJob('*/1 * * * *', async () => {
      await this.checkDailyReminders();
    });

    // 连续打卡成就检查 - 每小时检查一次
    schedule.scheduleJob('0 * * * *', async () => {
      await this.checkStreakAchievements();
    });

    // 异常消费检查 - 每30分钟检查一次
    schedule.scheduleJob('*/30 * * * *', async () => {
      await this.checkAbnormalSpending();
    });

    this.isInitialized = true;
    console.log('✅ 打卡系统调度器初始化完成');
  }

  /**
   * 检查每日提醒
   */
  private async checkDailyReminders(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // 查找需要发送提醒的用户
      const users = await prisma.user.findMany({
        where: {
          checkinPreference: {
            wechatEnabled: true,
            wechatWebhook: { not: null },
            remindTime: { not: null },
          },
        },
        include: {
          checkinPreference: true,
        },
      });

      for (const user of users) {
        if (!user.checkinPreference?.remindTime || !user.checkinPreference?.wechatWebhook) {
          continue;
        }

        // 检查是否到了提醒时间（允许±1分钟误差）
        const remindTime = user.checkinPreference.remindTime;
        if (this.isTimeMatch(currentTime, remindTime, 1)) {
          console.log(`⏰ 发送每日提醒给用户 ${user.name || user.email} (${user.id})`);

          const success = await WechatService.sendDailyReminder(
            user.checkinPreference.wechatWebhook!,
            { name: user.name, email: user.email, userId: user.id }
          );

          if (success) {
            console.log(`✅ 每日提醒发送成功: ${user.name || user.email}`);
          } else {
            console.error(`❌ 每日提醒发送失败: ${user.name || user.email}`);
          }
        }
      }
    } catch (error) {
      console.error('检查每日提醒失败:', error);
    }
  }

  /**
   * 检查连续打卡成就
   */
  private async checkStreakAchievements(): Promise<void> {
    try {
      // 查找启用微信提醒的用户
      const users = await prisma.user.findMany({
        where: {
          checkinPreference: {
            wechatEnabled: true,
            wechatWebhook: { not: null },
          },
        },
        include: {
          checkinPreference: true,
        },
      });

      for (const user of users) {
        if (!user.checkinPreference?.wechatWebhook) {
          continue;
        }

        // 计算连续打卡天数
        const streak = await WechatService.calculateStreak(user.id);

        // 检查是否达到成就里程碑
        const milestones = [3, 7, 14, 21, 30, 50, 100];
        for (const milestone of milestones) {
          if (streak.current === milestone) {
            console.log(`🏆 用户 ${user.name || user.email} 达到连续打卡 ${milestone} 天成就`);

            const success = await WechatService.sendStreakAchievement(
              user.checkinPreference.wechatWebhook!,
              { name: user.name, email: user.email, userId: user.id },
              milestone
            );

            if (success) {
              console.log(`✅ 成就通知发送成功: ${user.name || user.email}`);
            } else {
              console.error(`❌ 成就通知发送失败: ${user.name || user.email}`);
            }
            break; // 只发送一个成就通知
          }
        }
      }
    } catch (error) {
      console.error('检查连续打卡成就失败:', error);
    }
  }

  /**
   * 检查异常消费
   */
  private async checkAbnormalSpending(): Promise<void> {
    try {
      // 查找过去24小时的大额消费（超过1000元）
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const largeExpenses = await prisma.financeRecord.findMany({
        where: {
          type: 'expense',
          amount: { gt: 1000 },
          date: { gte: twentyFourHoursAgo },
        },
        include: {
          user: {
            include: {
              checkinPreference: true,
            },
          },
        },
      });

      for (const expense of largeExpenses) {
        if (!expense.user.checkinPreference?.wechatEnabled || !expense.user.checkinPreference?.wechatWebhook) {
          continue;
        }

        console.log(`💰 发现异常消费: 用户 ${expense.user.name || expense.user.email}, 金额 ${expense.amount}元`);

        const success = await WechatService.sendAbnormalSpendingAlert(
          expense.user.checkinPreference.wechatWebhook!,
          { name: expense.user.name, email: expense.user.email, userId: expense.user.id },
          {
            amount: expense.amount,
            category: expense.category,
            date: expense.date.toISOString(),
            note: expense.note || undefined,
          }
        );

        if (success) {
          console.log(`✅ 异常消费提醒发送成功: ${expense.user.name || expense.user.email}`);
        } else {
          console.error(`❌ 异常消费提醒发送失败: ${expense.user.name || expense.user.email}`);
        }
      }
    } catch (error) {
      console.error('检查异常消费失败:', error);
    }
  }

  /**
   * 检查时间是否匹配（允许误差分钟数）
   */
  private isTimeMatch(currentTime: string, targetTime: string, toleranceMinutes: number): boolean {
    try {
      const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
      const [targetHours, targetMinutes] = targetTime.split(':').map(Number);

      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      const targetTotalMinutes = targetHours * 60 + targetMinutes;

      return Math.abs(currentTotalMinutes - targetTotalMinutes) <= toleranceMinutes;
    } catch (error) {
      console.error('时间匹配检查失败:', error);
      return false;
    }
  }

  /**
   * 停止所有调度任务
   */
  stop(): void {
    schedule.gracefulShutdown();
    this.isInitialized = false;
    console.log('🛑 打卡系统调度器已停止');
  }
}