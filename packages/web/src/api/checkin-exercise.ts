import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

export interface ExerciseRecord {
  id: number;
  type: string;
  duration: number;
  distance?: number;
  calories?: number;
  heartRate?: number;
  note?: string;
  date: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseStats {
  summary: {
    totalDuration: number;
    totalDistance: number;
    totalCalories: number;
    recordCount: number;
    averageDuration: number;
  };
  types: Array<{
    name: string;
    duration: number;
    count: number;
    averageDuration: number;
    distance: number;
    calories: number;
    percentage: number;
  }>;
  dailyTrend: Array<{
    date: string;
    duration: number;
    distance: number;
    calories: number;
    count: number;
  }>;
}

// 获取运动记录列表
export const getExerciseRecords = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  minDuration?: string;
  maxDuration?: string;
}) => {
  const response = await api.get<ExerciseRecord[]>('/api/checkin/exercise', { params });
  return response.data;
};

// 获取单条运动记录
export const getExerciseRecord = async (id: number) => {
  const response = await api.get<ExerciseRecord>(`/api/checkin/exercise/${id}`);
  return response.data;
};

// 创建运动记录
export const createExerciseRecord = async (data: {
  type: string;
  duration: number;
  distance?: number;
  calories?: number;
  heartRate?: number;
  note?: string;
  date: string;
}) => {
  const response = await api.post<ExerciseRecord>('/api/checkin/exercise', data);
  return response.data;
};

// 更新运动记录
export const updateExerciseRecord = async (
  id: number,
  data: Partial<{
    type: string;
    duration: number;
    distance?: number;
    calories?: number;
    heartRate?: number;
    note?: string;
    date: string;
  }>
) => {
  const response = await api.put<ExerciseRecord>(`/api/checkin/exercise/${id}`, data);
  return response.data;
};

// 删除运动记录
export const deleteExerciseRecord = async (id: number) => {
  const response = await api.delete(`/api/checkin/exercise/${id}`);
  return response.data;
};

// 获取运动统计
export const getExerciseStats = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get<ExerciseStats>('/api/checkin/exercise/stats', { params });
  return response.data;
};