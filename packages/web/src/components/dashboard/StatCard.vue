<template>
  <div
    class="card p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 group"
    :class="{
      'bg-gradient-to-br from-primary/5 to-transparent': variant === 'gradient',
      'border-l-4 border-primary': variant === 'accent',
      'glass-card': variant === 'glass',
    }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
          :class="{
            'bg-primary/10': color === 'primary',
            'bg-warm-200 dark:bg-warm-800/30': color === 'warm',
            'bg-secondary/10': color === 'secondary',
            'bg-gradient-to-br from-primary/20 to-accent/20': color === 'gradient',
          }"
        >
          <component
            :is="icon"
            class="h-6 w-6 transition-all duration-300"
            :class="{
              'text-primary': color === 'primary',
              'text-warm-600 dark:text-warm-400': color === 'warm',
              'text-secondary': color === 'secondary',
              'text-gradient': color === 'gradient',
            }"
          />
        </div>
        <div class="space-y-1">
          <p class="text-sm text-muted-foreground">{{ label }}</p>
          <p class="text-3xl font-bold tracking-tight">{{ formattedValue }}</p>
        </div>
      </div>
      <div
        v-if="trend !== undefined"
        class="flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300 group-hover:scale-110"
        :class="{
          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': trend > 0,
          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300': trend < 0,
          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': trend === 0,
        }"
      >
        <ArrowUp v-if="trend > 0" class="h-3 w-3" />
        <ArrowDown v-else-if="trend < 0" class="h-3 w-3" />
        <Minus v-else class="h-3 w-3" />
        <span class="text-xs font-semibold">{{ Math.abs(trend) }}%</span>
      </div>
    </div>

    <!-- 进度条（可选） -->
    <div v-if="progress !== undefined" class="mt-4">
      <div class="flex justify-between text-xs text-muted-foreground mb-1">
        <span>进度</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="{
            'bg-primary': color === 'primary',
            'bg-warm-600': color === 'warm',
            'bg-secondary': color === 'secondary',
            'bg-gradient-to-r from-primary to-accent': color === 'gradient',
          }"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- 描述文字（可选） -->
    <p v-if="description" class="mt-3 text-sm text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ArrowUp, ArrowDown, Minus } from 'lucide-vue-next';
import { computed } from 'vue';

interface Props {
  label: string;
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  trend?: number;
  progress?: number;
  description?: string;
  variant?: 'default' | 'gradient' | 'accent' | 'glass';
  color?: 'primary' | 'warm' | 'secondary' | 'gradient';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  color: 'primary',
});

// 格式化数值，添加千位分隔符
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value;
});
</script>
