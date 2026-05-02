import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

// 从 localStorage 读取保存的深色模式设置
const STORAGE_KEY = 'conan-theme';

export const useThemeStore = defineStore('theme', () => {
  // 深色模式状态
  const isDarkMode = ref<boolean>(false);

  // 加载初始化状态
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { darkMode } = JSON.parse(saved);
        if (typeof darkMode === 'boolean') {
          isDarkMode.value = darkMode;
        }
      }
    } catch (e) {
      console.warn('Failed to load theme from localStorage:', e);
    }
  };

  // 初始化加载
  loadInitialState();

  /**
   * 切换深色模式
   */
  const toggleDarkMode = (enabled?: boolean) => {
    const newValue = enabled !== undefined ? enabled : !isDarkMode.value;
    isDarkMode.value = newValue;
    applyDarkModeToDOM(newValue);
    saveToStorage();
  };

  /**
   * 将深色模式应用到 DOM
   */
  const applyDarkModeToDOM = (enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  /**
   * 保存到 localStorage
   */
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        darkMode: isDarkMode.value,
      }));
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  /**
   * 初始化应用深色模式到 DOM
   */
  const initializeTheme = () => {
    // 应用深色模式
    applyDarkModeToDOM(isDarkMode.value);

    // 监听系统深色模式偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只在用户未手动设置深色模式时跟随系统
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        toggleDarkMode(e.matches);
      }
    };

    prefersDark.addEventListener('change', handleSystemThemeChange);

    // 清理函数
    return () => {
      prefersDark.removeEventListener('change', handleSystemThemeChange);
    };
  };

  // 监听深色模式变化，自动应用到 DOM
  watch(isDarkMode, (newValue) => {
    applyDarkModeToDOM(newValue);
  });

  return {
    // 状态
    isDarkMode,

    // 方法
    toggleDarkMode,
    initializeTheme,
    loadInitialState,
  };
});