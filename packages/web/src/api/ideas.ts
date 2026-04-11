import axios from 'axios';

// 使用环境变量中的 API 地址，默认为本地后端
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // 携带 cookie
});

export interface Idea {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetIdeasParams {
  category?: string;
  priority?: string;
  completed?: boolean;
  tag?: string;
  sort?: 'newest' | 'oldest' | 'priority';
}

// 获取灵感列表（支持筛选和排序）
export const getIdeas = async (params?: GetIdeasParams) => {
  const response = await api.get<Idea[]>('/api/ideas', { params });
  return response.data;
};

// 获取单个灵感
export const getIdea = async (id: number) => {
  const response = await api.get<Idea>(`/api/ideas/${id}`);
  return response.data;
};

// 创建灵感
export const createIdea = async (data: {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}) => {
  const response = await api.post<Idea>('/api/ideas', data);
  return response.data;
};

// 更新灵感
export const updateIdea = async (
  id: number,
  data: Partial<{
    title: string;
    content: string;
    category?: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
  }>,
) => {
  const response = await api.put<Idea>(`/api/ideas/${id}`, data);
  return response.data;
};

// 删除灵感
export const deleteIdea = async (id: number) => {
  const response = await api.delete(`/api/ideas/${id}`);
  return response.data;
};

// 切换完成状态
export const toggleIdea = async (id: number) => {
  const response = await api.patch<Idea>(`/api/ideas/${id}/toggle`);
  return response.data;
};
