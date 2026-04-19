import axios from 'axios';

// 使用环境变量中的 API 地址，默认为空字符串（使用相对路径）
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true, // 携带 cookie
});

export interface TagCloudItem {
  name: string;
  count: number;
  noteCount: number;
  ideaCount: number;
  type: 'note' | 'idea' | 'both';
}

export interface TagCloudResponse {
  tags: TagCloudItem[];
}

/**
 * 获取标签云数据
 * @param limit 返回标签数量限制，默认50
 * @param minCount 最小出现次数，默认1
 */
export const getTagCloud = async (params?: { limit?: number; minCount?: number }): Promise<TagCloudItem[]> => {
  const response = await api.get<TagCloudResponse>('/api/tags/cloud', { params });
  return response.data.tags;
};

/**
 * 获取热门标签（前10个）
 */
export const getPopularTags = async (): Promise<TagCloudItem[]> => {
  return getTagCloud({ limit: 10 });
};