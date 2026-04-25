import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

// AI任务类型
export type AITask =
  | 'finance-parse'      // 智能记账解析
  | 'daily-briefing'     // 每日简报生成
  | 'study-summary'      // 学习内容摘要生成
  | 'exercise-recommend' // 运动推荐
  | 'general-chat';      // 通用聊天

// AI提供商类型
export type AIProvider = 'openai' | 'anthropic' | 'huggingface' | 'local' | 'fallback';

// AI请求接口
export interface AIRequest {
  task: AITask;
  input: string;
  context?: Record<string, any>;
  options?: {
    provider?: AIProvider;
    maxTokens?: number;
    temperature?: number;
  };
}

// AI响应接口
export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: AIProvider;
  latency: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 财务解析结果
export interface FinanceParseResult {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: string;
  note?: string;
  date?: string;
}

// 统一的AI处理接口
export const processAI = async (request: AIRequest): Promise<AIResponse> => {
  const response = await api.post<AIResponse>('/api/ai/process', request);
  return response.data;
};

// 智能记账解析
export const parseFinanceText = async (text: string): Promise<FinanceParseResult> => {
  const response = await api.post<AIResponse>('/api/ai/finance/parse', { text });

  if (!response.data.success) {
    throw new Error(response.data.error || '记账文本解析失败');
  }

  return response.data.data as FinanceParseResult;
};

// 获取每日简报
export const getDailyBriefing = async (): Promise<string> => {
  const response = await api.get<AIResponse>('/api/ai/daily-briefing');

  if (!response.data.success) {
    throw new Error(response.data.error || '每日简报生成失败');
  }

  return response.data.data as string;
};

// 生成学习内容摘要
export const generateStudySummary = async (content: string, title?: string, type?: string): Promise<string> => {
  const response = await api.post<AIResponse>('/api/ai/study/summary', { content, title, type });

  if (!response.data.success) {
    throw new Error(response.data.error || '学习内容摘要生成失败');
  }

  return response.data.data as string;
};

// 获取运动推荐
export const getExerciseRecommendation = async (options?: {
  intensity?: string;
  duration?: string;
  location?: string;
}): Promise<string> => {
  const response = await api.get<AIResponse>('/api/ai/exercise/recommend', { params: options });

  if (!response.data.success) {
    throw new Error(response.data.error || '运动推荐生成失败');
  }

  return response.data.data as string;
};

// 获取可用的AI提供商
export const getAIProviders = async () => {
  const response = await api.get<{ providers: Array<{
    name: AIProvider;
    enabled: boolean;
    priority: number;
    hasApiKey: boolean;
  }> }>('/api/ai/providers');
  return response.data.providers;
};

// 测试AI服务连接
export const testAIConnection = async (): Promise<AIResponse> => {
  const response = await api.get<AIResponse>('/api/ai/test');
  return response.data;
};