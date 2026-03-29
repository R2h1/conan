import axios from 'axios';

// 使用环境变量中的 API 地址，默认为本地后端
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 获取笔记列表（支持搜索和标签筛选）
export const getNotes = async (params?: { search?: string; tag?: string }) => {
  const response = await api.get<Note[]>('/api/notes', { params });
  return response.data;
};

// 获取单个笔记
export const getNote = async (id: number) => {
  const response = await api.get<Note>(`/api/notes/${id}`);
  return response.data;
};

// 创建笔记
export const createNote = async (data: {
  title: string;
  content: string;
  tags: string[];
}) => {
  const response = await api.post<Note>('/api/notes', data);
  return response.data;
};

// 更新笔记
export const updateNote = async (
  id: number,
  data: Partial<{ title: string; content: string; tags: string[] }>,
) => {
  const response = await api.put<Note>(`/api/notes/${id}`, data);
  return response.data;
};

// 删除笔记
export const deleteNote = async (id: number) => {
  const response = await api.delete(`/api/notes/${id}`);
  return response.data;
};
