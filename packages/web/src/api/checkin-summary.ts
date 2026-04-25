import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

export interface CalendarDay {
  date: string;
  day: number;
  hasFinance: boolean;
  hasExercise: boolean;
  hasStudy: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface CalendarData {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  calendar: CalendarDay[];
  stats: {
    totalDays: number;
    financeDays: number;
    exerciseDays: number;
    studyDays: number;
    fullyCheckedDays: number;
  };
}

export interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  categoryBreakdown: Record<string, number>;
  accountBreakdown: Record<string, number>;
}

export interface ExerciseStats {
  totalDuration: number;
  totalDistance: number;
  totalCalories: number;
  typeBreakdown: Record<string, { duration: number; count: number }>;
}

export interface StudyStats {
  totalDuration: number;
  totalPages: number;
  typeBreakdown: Record<string, { duration: number; count: number }>;
  contentBreakdown: Record<string, { duration: number; count: number; progress: number }>;
}

export interface CheckinOverview {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalDays: number;
    financeDays: number;
    exerciseDays: number;
    studyDays: number;
    fullyCheckedDays: number;
    currentStreak: number;
    maxStreak: number;
  };
  finance: FinanceStats;
  exercise: ExerciseStats;
  study: StudyStats;
}

// 获取月视图日历数据
export const getCalendarData = async (params?: {
  year?: string;
  month?: string;
}): Promise<CalendarData> => {
  const response = await api.get<CalendarData>('/api/checkin/calendar', { params });
  return response.data;
};

// 获取打卡统计概览
export const getCheckinOverview = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CheckinOverview> => {
  const response = await api.get<CheckinOverview>('/api/checkin/stats/overview', { params });
  return response.data;
};