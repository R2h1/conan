<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <RouterLink
      v-for="(action, index) in actions"
      :key="action.label"
      :to="action.href"
      class="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      :class="getCardClasses(action.color || 'primary')"
      :style="{ animationDelay: `${index * 100}ms` }"
    >
      <!-- 背景装饰 -->
      <div
        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        :class="getBackgroundClasses(action.color || 'primary')"
      ></div>

      <!-- 图标容器 -->
      <div
        class="relative mb-4 inline-flex items-center justify-center p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        :class="getIconContainerClasses(action.color || 'primary')"
      >
        <component
          :is="action.icon"
          class="h-6 w-6 transition-all duration-300"
          :class="getIconClasses(action.color || 'primary')"
        />
      </div>

      <!-- 内容 -->
      <div class="relative space-y-2">
        <p class="font-bold text-lg tracking-tight">{{ action.label }}</p>
        <p class="text-sm opacity-80">{{ action.description }}</p>
      </div>

      <!-- 悬停指示器 -->
      <div
        class="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100"
        :class="getIndicatorClasses(action.color || 'primary')"
      ></div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

interface Props {
  actions: Array<{
    label: string;
    description: string;
    href: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color?: 'primary' | 'warm' | 'secondary' | 'accent';
  }>;
}

defineProps<Props>();

// 卡片类名
const getCardClasses = (color: string) => {
  const base = 'animate-fade-in border';
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary/5 to-primary/1 border-primary/10 hover:border-primary/30',
    warm: 'bg-gradient-to-br from-warm-50 to-warm-10 border-warm-200/30 hover:border-warm-400/30 dark:from-warm-800/20 dark:to-warm-800/5',
    secondary: 'bg-gradient-to-br from-secondary/5 to-secondary/1 border-secondary/10 hover:border-secondary/30',
    accent: 'bg-gradient-to-br from-accent/5 to-accent/1 border-accent/10 hover:border-accent/30',
  };
  return `${base} ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`;
};

// 背景类名
const getBackgroundClasses = (color: string) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary/5 via-primary/2 to-transparent',
    warm: 'bg-gradient-to-br from-warm-200/30 via-warm-50/20 to-transparent dark:from-warm-800/20',
    secondary: 'bg-gradient-to-br from-secondary/5 via-secondary/2 to-transparent',
    accent: 'bg-gradient-to-br from-accent/5 via-accent/2 to-transparent',
  };
  return colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
};

// 图标容器类名
const getIconContainerClasses = (color: string) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    warm: 'bg-warm-200 text-warm-600 dark:bg-warm-800/40 dark:text-warm-400',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  };
  return colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
};

// 图标类名
const getIconClasses = (color: string) => {
  const colorClasses = {
    primary: 'text-primary',
    warm: 'text-warm-600 dark:text-warm-400',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };
  return colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
};

// 指示器类名
const getIndicatorClasses = (color: string) => {
  const colorClasses = {
    primary: 'bg-primary',
    warm: 'bg-warm-600',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
  };
  return colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
};
</script>
