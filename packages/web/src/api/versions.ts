import axios from 'axios';

// 使用环境变量中的 API 地址，默认为空字符串（使用相对路径）
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true, // 携带 cookie
});

export interface NoteVersion {
  id: number;
  noteId: number;
  title: string;
  content: string;
  tags: string[];
  version: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  description?: string;  // 版本描述（可选）
}

// 获取版本列表参数
export interface GetVersionsParams {
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'version';
  order?: 'asc' | 'desc';
}

// 创建版本参数
export interface CreateVersionData {
  description?: string;
}

// 恢复版本参数
export interface RestoreVersionData {
  versionId: number;
  createNew?: boolean;  // true: 创建新版本，false: 覆盖当前版本
}

// 获取笔记的所有历史版本
export const getNoteVersions = async (
  noteId: number,
  params?: GetVersionsParams
): Promise<NoteVersion[]> => {
  const response = await api.get<NoteVersion[]>(`/api/notes/${noteId}/versions`, { params });
  return response.data;
};

// 获取特定历史版本
export const getNoteVersion = async (
  noteId: number,
  versionId: number
): Promise<NoteVersion> => {
  const response = await api.get<NoteVersion>(`/api/notes/${noteId}/versions/${versionId}`);
  return response.data;
};

// 创建新版本（手动创建，可选描述）
export const createVersion = async (
  noteId: number,
  data?: CreateVersionData
): Promise<NoteVersion> => {
  const response = await api.post<NoteVersion>(`/api/notes/${noteId}/versions`, data);
  return response.data;
};

// 恢复到特定历史版本
export const restoreVersion = async (
  noteId: number,
  data: RestoreVersionData
): Promise<{ note: any; version: NoteVersion | null }> => {
  const response = await api.post<{ note: any; version: NoteVersion | null }>(
    `/api/notes/${noteId}/restore`,
    data
  );
  return response.data;
};

// 删除历史版本
export const deleteVersion = async (
  noteId: number,
  versionId: number
): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(
    `/api/notes/${noteId}/versions/${versionId}`
  );
  return response.data;
};

// 自动创建版本（在保存笔记时调用）
export const autoCreateVersion = async (noteId: number): Promise<NoteVersion> => {
  return createVersion(noteId);
};