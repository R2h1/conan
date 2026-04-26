<template>
  <div class="space-y-3">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="group relative flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer animate-fade-in"
      :class="getItemClasses(item.type)"
      :style="{ animationDelay: `${index * 50}ms` }"
      @click="handleClick(item)"
    >
      <!-- 时间线指示器 -->
      <div class="relative">
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          :class="getPulseClasses(item.type)"
        ></div>
        <div
          class="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          :class="getIconContainerClasses(item.type)"
        >
          <component
            :is="item.icon"
            class="h-5 w-5 transition-all duration-300"
            :class="getIconClasses(item.type)"
          />
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 min-w-0 space-y-1">
        <div class="flex items-center justify-between">
          <p class="font-semibold truncate group-hover:text-primary transition-colors">
            {{ item.title }}
          </p>
          <span
            class="text-xs px-2 py-0.5 rounded-full transition-all duration-300 group-hover:scale-105"
            :class="getTimeBadgeClasses(item.type)"
          >
            {{ item.time }}
          </span>
        </div>
        <p class="text-sm text-muted-foreground line-clamp-1">{{ item.description }}</p>

        <!-- 类型标签 -->
        <div class="flex items-center gap-2">
          <span
            class="text-xs px-2 py-0.5 rounded-full transition-all duration-300 group-hover:scale-105"
            :class="getTypeBadgeClasses(item.type)"
          >
            {{ getTypeLabel(item.type) }}
          </span>
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
        </div>
      </div>

      <!-- 悬停箭头 -->
      <div
        class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
        :class="getArrowClasses(item.type)"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="!items.length"
      class="text-center py-8 rounded-xl border-2 border-dashed border-muted hover:border-primary/30 transition-all duration-300 group cursor-pointer"
      @click="$emit('empty-click')"
    >
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3 group-hover:scale-110 transition-transform">
        <svg class="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <p class="text-muted-foreground mb-2">暂无最近访问记录</p>
      <p class="text-sm text-muted-foreground/70">点击开始你的探索之旅</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RecentItem {
  id: string;
  title: string;
  description: string;
  time: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  href?: string;
  type: string;
}

interface Props {
  items: RecentItem[];
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'click', item: RecentItem): void;
  (e: 'empty-click'): void;
}>();

const handleClick = (item: RecentItem) => {
  emit('click', item);
};

// 根据类型获取项目类名
const getItemClasses = (type: string) => {
  const base = 'border';
  const typeClasses: Record<string, string> = {
    note: 'bg-gradient-to-r from-primary/3 to-primary/1 border-primary/10 hover:border-primary/30',
    idea: 'bg-gradient-to-r from-warm-50/30 to-warm-10/30 border-warm-200/30 hover:border-warm-400/30 dark:from-warm-800/20 dark:to-warm-800/10',
    tool: 'bg-gradient-to-r from-secondary/3 to-secondary/1 border-secondary/10 hover:border-secondary/30',
    checkin: 'bg-gradient-to-r from-accent/3 to-accent/1 border-accent/10 hover:border-accent/30',
    dashboard: 'bg-gradient-to-r from-blue-50/30 to-blue-10/30 border-blue-200/30 hover:border-blue-400/30',
  };
  return `${base} ${typeClasses[type] || 'bg-card border-border hover:border-primary/20'}`;
};

// 脉冲效果类名
const getPulseClasses = (type: string) => {
  const typeClasses: Record<string, string> = {
    note: 'bg-primary/20 animate-pulse',
    idea: 'bg-warm-400/20 animate-pulse',
    tool: 'bg-secondary/20 animate-pulse',
    checkin: 'bg-accent/20 animate-pulse',
    dashboard: 'bg-blue-400/20 animate-pulse',
  };
  return typeClasses[type] || 'bg-primary/20 animate-pulse';
};

// 图标容器类名
const getIconContainerClasses = (type: string) => {
  const typeClasses: Record<string, string> = {
    note: 'bg-primary/10 text-primary',
    idea: 'bg-warm-200 text-warm-600 dark:bg-warm-800/40 dark:text-warm-400',
    tool: 'bg-secondary/10 text-secondary',
    checkin: 'bg-accent/10 text-accent',
    dashboard: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  };
  return typeClasses[type] || 'bg-primary/10 text-primary';
};

// 图标类名
const getIconClasses = (type: string) => {
  const typeClasses: Record<string, string> = {
    note: 'text-primary',
    idea: 'text-warm-600 dark:text-warm-400',
    tool: 'text-secondary',
    checkin: 'text-accent',
    dashboard: 'text-blue-600 dark:text-blue-400',
  };
  return typeClasses[type] || 'text-primary';
};

// 时间徽章类名
const getTimeBadgeClasses = (type: string) => {
  const typeClasses: Record<string, string> = {
    note: 'bg-primary/10 text-primary',
    idea: 'bg-warm-200 text-warm-600 dark:bg-warm-800/40 dark:text-warm-400',
    tool: 'bg-secondary/10 text-secondary',
    checkin: 'bg-accent/10 text-accent',
    dashboard: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  };
  return typeClasses[type] || 'bg-primary/10 text-primary';
};

// 类型徽章类名
const getTypeBadgeClasses = (type: string) => {
  const typeClasses: Record<string, string> = {
    note: 'bg-primary/5 text-primary border border-primary/20',
    idea: 'bg-warm-50 text-warm-600 border border-warm-200 dark:bg-warm-800/30 dark:text-warm-400',
    tool: 'bg-secondary/5 text-secondary border border-secondary/20',
    checkin: 'bg-accent/5 text-accent border border-accent/20',
    dashboard: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return typeClasses[type] || 'bg-primary/5 text-primary border border-primary/20';
};

// 箭头类名
const getArrowClasses = (type: string) => {
  const typeClasses: Record<string, string> = {
    note: 'text-primary',
    idea: 'text-warm-600',
    tool: 'text-secondary',
    checkin: 'text-accent',
    dashboard: 'text-blue-500',
  };
  return typeClasses[type] || 'text-primary';
};

// 获取类型标签
const getTypeLabel = (type: string) => {
  const typeLabels: Record<string, string> = {
    note: '笔记',
    idea: '灵感',
    tool: '工具',
    checkin: '打卡',
    dashboard: '仪表盘',
  };
  return typeLabels[type] || '其他';
};
</script>
