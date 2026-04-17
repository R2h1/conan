import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  ring: string;
}

export interface Theme {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  colors: ThemeColors;
  description?: string;
  icon?: string;
}

// 预设主题列表
const PRESET_THEMES: Theme[] = [
  {
    id: 'blue',
    name: '蓝色主题',
    type: 'preset',
    description: '专业蓝色风格',
    icon: '🔵',
    colors: {
      primary: '221.2 83.2% 53.3%',
      primaryHover: '221.2 83.2% 48%',
      ring: '221.2 83.2% 53.3%',
    },
  },
  {
    id: 'green',
    name: '绿色主题',
    type: 'preset',
    description: '清新绿色风格',
    icon: '🌿',
    colors: {
      primary: '142.1 76.2% 36.3%',
      primaryHover: '142.1 76.2% 31.3%',
      ring: '142.1 76.2% 36.3%',
    },
  },
  {
    id: 'purple',
    name: '紫色主题',
    type: 'preset',
    description: '创意紫色风格',
    icon: '🌀',
    colors: {
      primary: '262.1 83.3% 57.8%',
      primaryHover: '262.1 83.3% 52.8%',
      ring: '262.1 83.3% 57.8%',
    },
  },
  {
    id: 'orange',
    name: '橙色主题',
    type: 'preset',
    description: '活力橙色风格',
    icon: '🍊',
    colors: {
      primary: '24.6 95% 53.1%',
      primaryHover: '24.6 95% 48.1%',
      ring: '24.6 95% 53.1%',
    },
  },
  {
    id: 'pink',
    name: '粉红主题',
    type: 'preset',
    description: '浪漫粉红风格',
    icon: '🌸',
    colors: {
      primary: '346.8 77.2% 49.8%',
      primaryHover: '346.8 77.2% 44.8%',
      ring: '346.8 77.2% 49.8%',
    },
  },
  {
    id: 'cyan',
    name: '青色主题',
    type: 'preset',
    description: '科技青色风格',
    icon: '💠',
    colors: {
      primary: '188.7 94.5% 42.7%',
      primaryHover: '188.7 94.5% 37.7%',
      ring: '188.7 94.5% 42.7%',
    },
  },
];

// 从 localStorage 读取保存的主题设置
const STORAGE_KEY = 'conan-theme';
const DEFAULT_THEME_ID = 'blue';

export const useThemeStore = defineStore('theme', () => {
  // 当前主题 ID
  const currentThemeId = ref<string>(DEFAULT_THEME_ID);

  // 深色模式状态（独立于主题）
  const isDarkMode = ref<boolean>(false);

  // 加载初始化状态
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { themeId, darkMode } = JSON.parse(saved);
        if (themeId && PRESET_THEMES.some(t => t.id === themeId)) {
          currentThemeId.value = themeId;
        }
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

  // 当前主题对象
  const currentTheme = computed<Theme>(() => {
    return PRESET_THEMES.find(t => t.id === currentThemeId.value) || PRESET_THEMES[0];
  });

  // 所有可用主题
  const availableThemes = computed<Theme[]>(() => PRESET_THEMES);

  /**
   * 切换主题
   */
  const setTheme = (themeId: string) => {
    const theme = PRESET_THEMES.find(t => t.id === themeId);
    if (!theme) {
      console.warn(`Theme ${themeId} not found`);
      return;
    }

    currentThemeId.value = themeId;
    applyThemeToDOM(theme);
    saveToStorage();
  };

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
   * 重置为主题（只重置主题颜色，保持深色模式状态）
   */
  const resetToDefault = () => {
    setTheme(DEFAULT_THEME_ID);
  };

  /**
   * 将主题应用到 DOM
   */
  const applyThemeToDOM = (theme: Theme) => {
    const root = document.documentElement;

    // 设置 data-theme 属性
    if (theme.id === DEFAULT_THEME_ID) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme.id);
    }

    // 应用主题颜色变量
    const { colors } = theme;
    // 映射属性名：primaryHover -> --primary-hover
    const cssVarMapping: Record<string, string> = {
      primary: 'primary',
      primaryHover: 'primary-hover',
      ring: 'ring'
    };

    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = `--${cssVarMapping[key] || key}`;
      root.style.setProperty(cssVarName, value);
    });
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
        themeId: currentThemeId.value,
        darkMode: isDarkMode.value,
      }));
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  /**
   * 初始化应用主题到 DOM
   */
  const initializeTheme = () => {
    // 应用当前主题
    applyThemeToDOM(currentTheme.value);

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

  // 监听主题变化，自动应用到 DOM
  watch(currentThemeId, (newThemeId) => {
    const theme = PRESET_THEMES.find(t => t.id === newThemeId);
    if (theme) {
      applyThemeToDOM(theme);
    }
  });

  // 监听深色模式变化，自动应用到 DOM
  watch(isDarkMode, (newValue) => {
    applyDarkModeToDOM(newValue);
  });

  return {
    // 状态
    currentThemeId,
    currentTheme,
    isDarkMode,
    availableThemes,

    // 方法
    setTheme,
    toggleDarkMode,
    resetToDefault,
    initializeTheme,
    loadInitialState,
  };
});

// 导出预设主题列表供其他组件使用
export { PRESET_THEMES, DEFAULT_THEME_ID };