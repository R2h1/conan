import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

export interface StudyRecord {
  id: number;
  type: 'study' | 'read';
  content: string;
  duration: number;
  pages?: number;
  progress?: number;
  noteId?: number;
  summary?: string;
  date: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: number;
    title: string;
  };
}

export interface StudyStats {
  summary: {
    totalDuration: number;
    totalPages: number;
    recordCount: number;
    averageDuration: number;
  };
  types: Array<{
    name: string;
    duration: number;
    count: number;
    averageDuration: number;
    pages: number;
    percentage: number;
  }>;
  contents: Array<{
    name: string;
    duration: number;
    count: number;
    progress: number;
    averageDuration: number;
  }>;
  dailyTrend: Array<{
    date: string;
    duration: number;
    pages: number;
    count: number;
  }>;
}

// 获取学习记录列表
export const getStudyRecords = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  content?: string;
  minDuration?: string;
  maxDuration?: string;
  minProgress?: string;
  maxProgress?: string;
}) => {
  const response = await api.get<StudyRecord[]>('/api/checkin/study', { params });
  return response.data;
};

// 获取单条学习记录
export const getStudyRecord = async (id: number) => {
  const response = await api.get<StudyRecord>(`/api/checkin/study/${id}`);
  return response.data;
};

// 创建学习记录
export const createStudyRecord = async (data: {
  type: 'study' | 'read';
  content: string;
  duration: number;
  pages?: number;
  progress?: number;
  noteId?: number;
  summary?: string;
  date: string;
}) => {
  const response = await api.post<StudyRecord>('/api/checkin/study', data);
  return response.data;
};

// 更新学习记录
export const updateStudyRecord = async (
  id: number,
  data: Partial<{
    type: 'study' | 'read';
    content: string;
    duration: number;
    pages?: number;
    progress?: number;
    noteId?: number;
    summary?: string;
    date: string;
  }>
) => {
  const response = await api.put<StudyRecord>(`/api/checkin/study/${id}`, data);
  return response.data;
};

// 删除学习记录
export const deleteStudyRecord = async (id: number) => {
  const response = await api.delete(`/api/checkin/study/${id}`);
  return response.data;
};

// 获取学习统计
export const getStudyStats = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
}) => {
  const response = await api.get<StudyStats>('/api/checkin/study/stats', { params });
  return response.data;
};