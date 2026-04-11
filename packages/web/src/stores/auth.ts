import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser, type User, type LoginData, type RegisterData } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  /**
   * 初始化检查用户登录状态
   */
  async function fetchUser() {
    try {
      const data = await getCurrentUser();
      user.value = data.user;
      return data.user;
    } catch (e) {
      user.value = null;
      throw e; // 抛出错误，让调用者知道未登录
    }
  }

  /**
   * 注册
   */
  async function register(data: RegisterData) {
    loading.value = true;
    error.value = null;
    try {
      const result = await registerApi(data);
      user.value = result.user;
      return result;
    } catch (e: any) {
      error.value = e.response?.data?.error || '注册失败';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 登录
   */
  async function login(data: LoginData) {
    loading.value = true;
    error.value = null;
    try {
      const result = await loginApi(data);
      user.value = result.user;
      return result;
    } catch (e: any) {
      error.value = e.response?.data?.error || '登录失败';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      await logoutApi();
    } finally {
      user.value = null;
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout,
  };
});
