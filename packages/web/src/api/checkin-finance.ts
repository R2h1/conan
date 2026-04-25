import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

export interface FinanceRecord {
  id: number;
  type: string;
  amount: number;
  category: string;
  account: string;
  note?: string;
  tags?: string[];
  date: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceStats {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    recordCount: number;
  };
  categories: Array<{
    name: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  accounts: Array<{
    name: string;
    balance: number;
    income: number;
    expense: number;
  }>;
  dailyTrend: Array<{
    date: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}

// 获取财务记录列表
export const getFinanceRecords = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  category?: string;
  account?: string;
  minAmount?: string;
  maxAmount?: string;
}) => {
  const response = await api.get<FinanceRecord[]>('/api/checkin/finance', { params });
  return response.data;
};

// 获取单条财务记录
export const getFinanceRecord = async (id: number) => {
  const response = await api.get<FinanceRecord>(`/api/checkin/finance/${id}`);
  return response.data;
};

// 创建财务记录
export const createFinanceRecord = async (data: {
  type: string;
  amount: number;
  category: string;
  account: string;
  note?: string;
  tags?: string[];
  date: string;
}) => {
  const response = await api.post<FinanceRecord>('/api/checkin/finance', data);
  return response.data;
};

// 更新财务记录
export const updateFinanceRecord = async (
  id: number,
  data: Partial<{
    type: string;
    amount: number;
    category: string;
    account: string;
    note?: string;
    tags?: string[];
    date: string;
  }>
) => {
  const response = await api.put<FinanceRecord>(`/api/checkin/finance/${id}`, data);
  return response.data;
};

// 删除财务记录
export const deleteFinanceRecord = async (id: number) => {
  const response = await api.delete(`/api/checkin/finance/${id}`);
  return response.data;
};

// 获取财务统计
export const getFinanceStats = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get<FinanceStats>('/api/checkin/finance/stats', { params });
  return response.data;
};