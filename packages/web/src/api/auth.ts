import axios from 'axios';

// 使用环境变量中的 API 地址，默认为空字符串（使用相对路径）
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true, // 携带 cookie
});

export { api };

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// 注册
export const register = async (data: RegisterData) => {
  const response = await api.post<{ user: User }>('/api/auth/register', data);
  return response.data;
};

// 登录
export const login = async (data: LoginData) => {
  const response = await api.post<{ user: User }>('/api/auth/login', data);
  return response.data;
};

// 获取当前用户
export const getCurrentUser = async () => {
  const response = await api.get<{ user: User }>('/api/auth/me');
  return response.data;
};

// 登出
export const logout = async () => {
  const response = await api.post<{ success: boolean }>('/api/auth/logout');
  return response.data;
};
