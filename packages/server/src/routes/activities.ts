import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

// 活动类型定义
type ActivityType = 'dashboard' | 'note' | 'idea' | 'tool';

interface ActivityCreateRequest {
  type: ActivityType;
  title: string;
  description: string;
  icon?: string;
  resourceId?: number;
}

export default async function activitiesRoutes(fastify: FastifyInstance) {
  // 记录用户活动
  fastify.post<{ Body: ActivityCreateRequest }>('/api/activities', async (request, reply) => {
    await requireAuth(request, reply);
    const user: any = request.user;

    const { type, title, description, icon, resourceId } = request.body;

    // 验证必要字段
    if (!type || !title || !description) {
      return reply.status(400).send({ error: '缺少必要字段: type, title, description' });
    }

    // 验证活动类型
    const validTypes = ['dashboard', 'note', 'idea', 'tool'];
    if (!validTypes.includes(type)) {
      return reply.status(400).send({ error: `无效的活动类型，必须是: ${validTypes.join(', ')}` });
    }

    try {
      // 创建活动记录
      const activity = await prisma.recentActivity.create({
        data: {
          userId: user.userId,
          type,
          title,
          description,
          icon: icon || getDefaultIcon(type),
          resourceId,
        },
      });

      return { activity };
    } catch (error) {
      console.error('记录活动失败:', error);
      return reply.status(500).send({ error: '记录活动失败' });
    }
  });

  // 获取用户最近活动（最近5条）
  fastify.get('/api/activities/recent', async (request, reply) => {
    await requireAuth(request, reply);
    const user: any = request.user;

    try {
      const activities = await prisma.recentActivity.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          icon: true,
          resourceId: true,
          createdAt: true,
        },
      });

      // 格式化返回数据
      const formattedActivities = activities.map(activity => ({
        id: activity.id.toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        icon: activity.icon,
        resourceId: activity.resourceId,
        time: formatTimeAgo(activity.createdAt),
        createdAt: activity.createdAt,
      }));

      return { activities: formattedActivities };
    } catch (error) {
      console.error('获取最近活动失败:', error);
      return reply.status(500).send({ error: '获取最近活动失败' });
    }
  });

  // 获取用户所有活动（支持分页）
  fastify.get<{ Querystring: { page?: string; limit?: string } }>('/api/activities', async (request, reply) => {
    await requireAuth(request, reply);
    const user: any = request.user;

    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '20');
    const skip = (page - 1) * limit;

    try {
      const [activities, total] = await Promise.all([
        prisma.recentActivity.findMany({
          where: { userId: user.userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.recentActivity.count({
          where: { userId: user.userId },
        }),
      ]);

      return {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取活动列表失败:', error);
      return reply.status(500).send({ error: '获取活动列表失败' });
    }
  });

  // 删除活动记录
  fastify.delete<{ Params: { id: string } }>('/api/activities/:id', async (request, reply) => {
    await requireAuth(request, reply);
    const user: any = request.user;
    const { id } = request.params;

    try {
      // 验证活动属于当前用户
      const activity = await prisma.recentActivity.findFirst({
        where: { id: parseInt(id), userId: user.userId },
      });

      if (!activity) {
        return reply.status(404).send({ error: '活动记录不存在' });
      }

      await prisma.recentActivity.delete({
        where: { id: parseInt(id) },
      });

      return { message: '活动记录已删除' };
    } catch (error) {
      console.error('删除活动记录失败:', error);
      return reply.status(500).send({ error: '删除活动记录失败' });
    }
  });
}

// 根据活动类型获取默认图标
function getDefaultIcon(type: ActivityType): string {
  const iconMap: Record<ActivityType, string> = {
    dashboard: 'LayoutDashboard',
    note: 'BookOpen',
    idea: 'Lightbulb',
    tool: 'Wrench',
  };
  return iconMap[type] || 'Circle';
}

// 格式化时间为"X小时前"等
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}