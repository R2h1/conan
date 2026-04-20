import axios from 'axios';
import { createVersion } from './versions.js';

// 使用环境变量中的 API 地址，默认为空字符串（使用相对路径）
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true, // 携带 cookie
});

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// 获取笔记列表（支持搜索、标签筛选和收藏筛选）
export const getNotes = async (params?: { search?: string; tag?: string; favorite?: boolean }) => {
  const response = await api.get<Note[]>('/api/notes', { params });
  return response.data;
};

// 获取单个笔记
export const getNote = async (id: number) => {
  const response = await api.get<Note>(`/api/notes/${id}`);
  return response.data;
};

// 创建笔记（自动创建第一个版本）
export const createNote = async (data: {
  title: string;
  content: string;
  tags: string[];
}) => {
  const response = await api.post<Note>('/api/notes', data);
  // 创建第一个版本
  const note = response.data;
  await createVersion(note.id, { description: '初始版本' });
  return note;
};

// 更新笔记（自动创建新版本）
export const updateNote = async (
  id: number,
  data: Partial<{ title: string; content: string; tags: string[] }>,
) => {
  const response = await api.put<Note>(`/api/notes/${id}`, data);
  // 创建新版本
  const note = response.data;
  await createVersion(id, { description: '保存更新' });
  return note;
};

// 删除笔记
export const deleteNote = async (id: number) => {
  const response = await api.delete(`/api/notes/${id}`);
  return response.data;
};

// 获取相关笔记
export interface RelatedNote extends Note {
  matchScore?: number;
}

export const getRelatedNotes = async (id: number): Promise<RelatedNote[]> => {
  const response = await api.get<RelatedNote[]>(`/api/notes/${id}/related`);
  return response.data;
};

// 切换笔记收藏状态
export const toggleFavorite = async (id: number, favorite?: boolean): Promise<Note> => {
  const response = await api.patch<Note>(`/api/notes/${id}/favorite`, { favorite });
  return response.data;
};

// 获取收藏笔记（辅助函数）
export const getFavoriteNotes = async (): Promise<Note[]> => {
  return getNotes({ favorite: true });
};

// 扩展的更新笔记函数，支持版本描述
export const updateNoteWithVersion = async (
  id: number,
  data: Partial<{ title: string; content: string; tags: string[] }>,
  description?: string
): Promise<Note> => {
  const response = await api.put<Note>(`/api/notes/${id}`, data);
  // 创建新版本
  const note = response.data;
  await createVersion(id, { description });
  return note;
};

// 批量创建版本（用于迁移现有数据）
export const createVersionsForNotes = async (noteIds: number[]): Promise<void> => {
  for (const noteId of noteIds) {
    await createVersion(noteId, { description: '初始历史版本' });
  }
};
