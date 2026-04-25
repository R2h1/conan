import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

export interface CheckinPreference {
  id: number;
  userId: number;
  remindTime?: string; // "08:00"
  financeCategories?: string[];
  exerciseTypes?: string[];
  studyContentList?: string[];
  aiEnabled: boolean;
  wechatEnabled: boolean;
  wechatWebhook?: string;
  createdAt: string;
  updatedAt: string;
}

// 获取用户偏好设置
export const getCheckinPreference = async (): Promise<CheckinPreference> => {
  const response = await api.get<CheckinPreference>('/api/checkin/preference');
  return response.data;
};

// 更新用户偏好设置
export const updateCheckinPreference = async (
  data: Partial<CheckinPreference>
): Promise<CheckinPreference> => {
  const response = await api.put<CheckinPreference>('/api/checkin/preference', data);
  return response.data;
};

// 测试企业微信Webhook连接
export const testWechatWebhook = async (webhookUrl: string): Promise<{ success: boolean; message?: string; error?: string; details?: string }> => {
  const response = await api.post('/api/checkin/preference/test-wechat-webhook', { webhookUrl });
  return response.data;
};