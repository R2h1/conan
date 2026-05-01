import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

// 活动类型
export type ActivityType = 'dashboard' | 'tool';

// 活动记录请求接口
export interface ActivityCreateRequest {
  type: ActivityType;
  title: string;
  description: string;
  icon?: string;
  resourceId?: number;
}

// 活动记录响应接口
export interface ActivityResponse {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  icon?: string;
  resourceId?: number;
  time: string;
  createdAt: string;
}

// 记录用户活动
export const recordActivity = async (activity: ActivityCreateRequest) => {
  const response = await api.post<{ activity: any }>('/api/activities', activity);
  return response.data;
};

// 获取用户最近活动（最近5条）
export const getRecentActivities = async (): Promise<ActivityResponse[]> => {
  const response = await api.get<{ activities: ActivityResponse[] }>('/api/activities/recent');
  return response.data.activities;
};

// 记录页面访问活动
export const recordPageVisit = (page: string, title?: string) => {
  const pageMap: Record<string, { type: ActivityType; title: string; description: string; icon: string }> = {
    '/app': {
      type: 'dashboard',
      title: '仪表盘',
      description: '访问了仪表盘页面',
      icon: 'LayoutDashboard',
    },
    '/app/tools': {
      type: 'tool',
      title: '工具集',
      description: '访问了工具集页面',
      icon: 'Wrench',
    },
  };

  const pageConfig = pageMap[page];
  if (pageConfig) {
    // 异步记录，不等待响应（避免阻塞页面加载）
    recordActivity(pageConfig).catch((error) => {
      console.warn('记录页面访问活动失败:', error);
    });
  }
};