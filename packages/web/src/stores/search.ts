import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToast } from '@/components/ui/toast';

export interface SearchResult {
  id: number;
  type: 'tool';
  title: string;
  description: string;
  icon?: string;
  url: string;
  data?: any; // 原始数据，用于跳转等
}

export const useSearchStore = defineStore('search', () => {
  const { toast } = useToast();

  // 状态
  const open = ref(false);
  const query = ref('');
  const results = ref<SearchResult[]>([]);
  const loading = ref(false);
  const selectedIndex = ref(0);

  // 工具列表（本地搜索）
  const tools = ref([
    {
      id: 1,
      name: 'JSON 格式化',
      description: '格式化、压缩和校验 JSON 数据',
      icon: 'code',
      url: '/app/tools?tab=json',
    },
    {
      id: 2,
      name: '时间戳转换',
      description: 'Unix 时间戳与日期时间互相转换',
      icon: 'clock',
      url: '/app/tools?tab=timestamp',
    },
    {
      id: 3,
      name: 'Base64 编解码',
      description: 'Base64 编码和解码',
      icon: 'file-text',
      url: '/app/tools?tab=base64',
    },
    {
      id: 4,
      name: 'URL 编解码',
      description: 'URL 编码和解码',
      icon: 'link',
      url: '/app/tools?tab=url',
    },
    {
      id: 5,
      name: 'HTML 实体转义',
      description: 'HTML 特殊字符转义和还原',
      icon: 'file-code',
      url: '/app/tools?tab=html',
    },
    {
      id: 6,
      name: '哈希计算',
      description: 'MD5, SHA-1, SHA-256, SHA-512 哈希',
      icon: 'hash',
      url: '/app/tools?tab=hash',
    },
    {
      id: 7,
      name: 'UUID 生成',
      description: '生成 UUID v4',
      icon: 'key',
      url: '/app/tools?tab=uuid',
    },
    {
      id: 8,
      name: '颜色转换',
      description: 'HEX, RGB, HSL 颜色格式转换',
      icon: 'palette',
      url: '/app/tools?tab=color',
    },
  ]);

  // 计算属性
  const selectedResult = computed(() => {
    if (results.value.length === 0 || selectedIndex.value < 0) return null;
    return results.value[selectedIndex.value];
  });

  const hasResults = computed(() => results.value.length > 0);

  // 操作方法
  const toggle = () => {
    open.value = !open.value;
    if (open.value) {
      query.value = '';
      results.value = [];
      selectedIndex.value = 0;
    }
  };

  const openSearch = () => {
    open.value = true;
    query.value = '';
    results.value = [];
    selectedIndex.value = 0;
  };

  const close = () => {
    open.value = false;
  };

  // 搜索函数（防抖在组件中处理）
  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      results.value = [];
      return;
    }

    loading.value = true;
    try {
      const searchResults: SearchResult[] = [];

      // 添加工具结果（本地搜索）
      const matchedTools = tools.value.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      matchedTools.forEach((tool) => {
        searchResults.push({
          id: tool.id,
          type: 'tool',
          title: tool.name,
          description: tool.description,
          icon: tool.icon,
          url: tool.url,
          data: tool,
        });
      });

      results.value = searchResults;
      selectedIndex.value = searchResults.length > 0 ? 0 : -1;
    } catch (error) {
      console.error('搜索失败:', error);
      toast({
        title: '搜索失败',
        description: '无法完成搜索，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      loading.value = false;
    }
  };

  // 键盘导航
  const selectNext = () => {
    if (results.value.length === 0) return;
    if (selectedIndex.value < 0) {
      selectedIndex.value = 0;
    } else {
      selectedIndex.value = (selectedIndex.value + 1) % results.value.length;
    }
  };

  const selectPrevious = () => {
    if (results.value.length === 0) return;
    if (selectedIndex.value < 0) {
      selectedIndex.value = results.value.length - 1;
    } else {
      selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length;
    }
  };

  const select = (index: number) => {
    if (index >= 0 && index < results.value.length) {
      selectedIndex.value = index;
    }
  };

  const selectCurrent = () => {
    const result = selectedResult.value;
    if (result) {
      // 这里应该触发路由跳转，由组件处理
      return result;
    }
    return null;
  };

  // 清空结果
  const clearResults = () => {
    results.value = [];
    selectedIndex.value = 0;
  };

  return {
    // 状态
    open,
    query,
    results,
    loading,
    selectedIndex,

    // 计算属性
    selectedResult,
    hasResults,

    // 方法
    toggle,
    openSearch,
    close,
    search,
    selectNext,
    selectPrevious,
    select,
    selectCurrent,
    clearResults,
  };
});