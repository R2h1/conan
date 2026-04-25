import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

interface CheckinPreferenceBody {
  remindTime?: string; // "08:00"
  financeCategories?: string[]; // JSON 数组
  exerciseTypes?: string[]; // JSON 数组
  studyContentList?: string[]; // JSON 数组
  aiEnabled?: boolean;
  wechatEnabled?: boolean;
  wechatWebhook?: string;
}

export default async function checkinPreferenceRoutes(fastify: FastifyInstance) {
  // 获取用户偏好设置
  fastify.get('/api/checkin/preference', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;

    try {
      // 查找或创建默认偏好设置
      let preference = await prisma.checkinPreference.findUnique({
        where: { userId: user.userId },
      });

      if (!preference) {
        // 创建默认偏好设置
        preference = await prisma.checkinPreference.create({
          data: {
            userId: user.userId,
            remindTime: '08:00',
            financeCategories: JSON.stringify(['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他']),
            exerciseTypes: JSON.stringify(['跑步', '游泳', '健身', '瑜伽', '骑行', '步行', '其他']),
            studyContentList: JSON.stringify([]),
            aiEnabled: true,
            wechatEnabled: false,
            wechatWebhook: null,
          },
        });
      }

      // 解析JSON字符串为数组
      const response = {
        ...preference,
        financeCategories: preference.financeCategories ? JSON.parse(preference.financeCategories) : [],
        exerciseTypes: preference.exerciseTypes ? JSON.parse(preference.exerciseTypes) : [],
        studyContentList: preference.studyContentList ? JSON.parse(preference.studyContentList) : [],
      };

      return response;
    } catch (error) {
      console.error('获取偏好设置失败:', error);
      return reply.status(500).send({ error: '获取偏好设置失败' });
    }
  });

  // 更新用户偏好设置
  fastify.put('/api/checkin/preference', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const body = request.body as CheckinPreferenceBody;

    try {
      // 验证提醒时间格式 (HH:mm)
      if (body.remindTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(body.remindTime)) {
        return reply.status(400).send({ error: '提醒时间格式应为 HH:mm' });
      }

      // 验证企业微信Webhook URL格式
      if (body.wechatWebhook && !body.wechatWebhook.startsWith('https://qyapi.weixin.qq.com/cgi-bin/webhook/send')) {
        return reply.status(400).send({ error: '企业微信Webhook URL格式不正确' });
      }

      // 查找现有偏好设置
      const existingPreference = await prisma.checkinPreference.findUnique({
        where: { userId: user.userId },
      });

      const data: any = {
        remindTime: body.remindTime,
        aiEnabled: body.aiEnabled,
        wechatEnabled: body.wechatEnabled,
        wechatWebhook: body.wechatWebhook,
        updatedAt: new Date(),
      };

      // 处理JSON数组字段
      if (body.financeCategories !== undefined) {
        data.financeCategories = JSON.stringify(body.financeCategories);
      }

      if (body.exerciseTypes !== undefined) {
        data.exerciseTypes = JSON.stringify(body.exerciseTypes);
      }

      if (body.studyContentList !== undefined) {
        data.studyContentList = JSON.stringify(body.studyContentList);
      }

      let preference;
      if (existingPreference) {
        // 更新现有设置
        preference = await prisma.checkinPreference.update({
          where: { userId: user.userId },
          data,
        });
      } else {
        // 创建新设置
        preference = await prisma.checkinPreference.create({
          data: {
            userId: user.userId,
            remindTime: body.remindTime || '08:00',
            financeCategories: JSON.stringify(body.financeCategories || ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他']),
            exerciseTypes: JSON.stringify(body.exerciseTypes || ['跑步', '游泳', '健身', '瑜伽', '骑行', '步行', '其他']),
            studyContentList: JSON.stringify(body.studyContentList || []),
            aiEnabled: body.aiEnabled !== undefined ? body.aiEnabled : true,
            wechatEnabled: body.wechatEnabled || false,
            wechatWebhook: body.wechatWebhook || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // 解析JSON字符串为数组返回
      const response = {
        ...preference,
        financeCategories: preference.financeCategories ? JSON.parse(preference.financeCategories) : [],
        exerciseTypes: preference.exerciseTypes ? JSON.parse(preference.exerciseTypes) : [],
        studyContentList: preference.studyContentList ? JSON.parse(preference.studyContentList) : [],
      };

      return response;
    } catch (error) {
      console.error('更新偏好设置失败:', error);
      return reply.status(500).send({ error: '更新偏好设置失败' });
    }
  });

  // 测试企业微信Webhook连接
  fastify.post('/api/checkin/preference/test-wechat-webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);

    const user: any = request.user;
    const body = request.body as { webhookUrl: string };

    try {
      const webhookUrl = body.webhookUrl;

      if (!webhookUrl.startsWith('https://qyapi.weixin.qq.com/cgi-bin/webhook/send')) {
        return reply.status(400).send({ error: '企业微信Webhook URL格式不正确' });
      }

      // 发送测试消息
      const testMessage = {
        msgtype: 'text',
        text: {
          content: `测试消息: 您的Conan打卡系统Webhook连接成功！\n时间: ${new Date().toLocaleString('zh-CN')}\n用户: ${user.email || user.name || user.userId}`,
        },
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage),
      });

      if (response.ok) {
        return { success: true, message: 'Webhook连接测试成功' };
      } else {
        const errorText = await response.text();
        return reply.status(400).send({
          success: false,
          error: `Webhook连接失败: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }
    } catch (error) {
      console.error('测试Webhook失败:', error);
      return reply.status(500).send({
        success: false,
        error: '测试Webhook失败',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}