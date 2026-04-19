<script setup lang="ts">
import { computed } from 'vue';
import { useSearchStore, type SearchResult } from '@/stores/search';
import { FileText, Lightbulb, Wrench, ExternalLink } from 'lucide-vue-next';

interface Props {
  result: SearchResult;
  index: number;
  groupOffset: number;
}

const props = defineProps<Props>();
const searchStore = useSearchStore();

// 计算全局索引
const globalIndex = computed(() => props.groupOffset + props.index);

// 是否被选中
const isSelected = computed(() => searchStore.selectedIndex === globalIndex.value);

// 图标映射
const iconMap = {
  note: FileText,
  idea: Lightbulb,
  tool: Wrench,
};

// 类型标签
const typeLabel = computed(() => {
  switch (props.result.type) {
    case 'note':
      return '笔记';
    case 'idea':
      return '灵感';
    case 'tool':
      return '工具';
    default:
      return '未知';
  }
});

// 处理点击
const handleClick = () => {
  searchStore.select(globalIndex.value);
  searchStore.close(); // 点击后关闭搜索面板
  emit('select', props.result);
};

const emit = defineEmits<{
  (e: 'select', result: any): void;
}>();
</script>

<template>
  <div
    :class="[
      'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border',
      isSelected
        ? 'bg-accent border-accent-foreground/20'
        : 'hover:bg-accent/50 border-transparent',
    ]"
    @click="handleClick"
    @mouseenter="searchStore.select(globalIndex)"
  >
    <!-- 图标 -->
    <div
      :class="[
        'p-2 rounded-md',
        result.type === 'note' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
        result.type === 'idea' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
        'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
      ]"
    >
      <component :is="iconMap[result.type]" class="h-4 w-4" />
    </div>

    <!-- 内容 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <div class="font-medium truncate" v-html="result.title" />
        <div class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          {{ typeLabel }}
        </div>
      </div>
      <div class="text-sm text-muted-foreground truncate mt-1">
        {{ result.description }}
      </div>
    </div>

    <!-- 选中指示器 -->
    <div v-if="isSelected" class="text-primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- 外部链接图标 -->
    <ExternalLink class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
</template>