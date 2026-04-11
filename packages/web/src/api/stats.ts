import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

export interface Stats {
  notes: number;
  ideas: number;
  weekNotes: number;
  toolUses: number;
}

// 获取统计数据
export const getStats = async () => {
  const response = await api.get<Stats>('/api/stats');
  return response.data;
};
