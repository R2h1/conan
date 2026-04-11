<template>
  <div class="card p-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-primary/10">
          <component :is="icon" class="h-5 w-5 text-primary" />
        </div>
        <div>
          <p class="text-sm text-muted-foreground">{{ label }}</p>
          <p class="text-2xl font-bold">{{ value }}</p>
        </div>
      </div>
      <div v-if="trend" :class="trend > 0 ? 'text-green-500' : 'text-red-500'">
        <ArrowUp v-if="trend > 0" class="h-4 w-4" />
        <ArrowDown v-else class="h-4 w-4" />
        <span class="text-sm font-medium">{{ Math.abs(trend) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUp, ArrowDown } from 'lucide-vue-next';

defineProps<{
  label: string;
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  trend?: number;
}>();
</script>
