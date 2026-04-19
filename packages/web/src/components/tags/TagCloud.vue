<script setup lang="ts">
import { computed } from 'vue';
import type { TagCloudItem } from '@/api/tags';

interface Props {
  tags: TagCloudItem[];
  maxFontSize?: number;
  minFontSize?: number;
  colorScheme?: 'frequency' | 'type' | 'random';
  onClick?: (tag: TagCloudItem) => void;
}

const props = withDefaults(defineProps<Props>(), {
  maxFontSize: 24,
  minFontSize: 12,
  colorScheme: 'frequency',
});

// 计算最大和最小频率
const frequencies = computed(() => props.tags.map(tag => tag.count));
const maxFrequency = computed(() => Math.max(...frequencies.value));
const minFrequency = computed(() => Math.min(...frequencies.value));

/**
 * 根据频率计算字体大小
 */
const getFontSize = (count: number) => {
  if (maxFrequency.value === minFrequency.value) {
    return props.maxFontSize;
  }
  // 线性比例
  const ratio = (count - minFrequency.value) / (maxFrequency.value - minFrequency.value);
  return props.minFontSize + ratio * (props.maxFontSize - props.minFontSize);
};

/**
 * 根据颜色方案获取颜色
 */
const getColor = (tag: TagCloudItem) => {
  switch (props.colorScheme) {
    case 'type':
      if (tag.type === 'note') return '#3b82f6'; // 蓝色
      if (tag.type === 'idea') return '#10b981'; // 绿色
      return '#8b5cf6'; // 紫色（both）
    case 'random':
      // 基于标签名称生成一致的颜色
      const randomHue = Array.from(tag.name).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
      return `hsl(${randomHue}, 70%, 50%)`;
    case 'frequency':
    default:
      // 处理频率相等的情况
      if (maxFrequency.value === minFrequency.value) {
        return `hsl(200, 70%, 50%)`;
      }
      // 根据频率渐变：从冷色到暖色
      const ratio = (tag.count - minFrequency.value) / (maxFrequency.value - minFrequency.value);
      const frequencyHue = 200 + ratio * 160; // 从蓝色(200)到橙色(360)
      return `hsl(${frequencyHue}, 70%, 50%)`;
  }
};

const handleClick = (tag: TagCloudItem) => {
  if (props.onClick) {
    props.onClick(tag);
  }
};
</script>

<template>
  <div class="tag-cloud">
    <span
      v-for="tag in tags"
      :key="tag.name"
      class="tag-cloud-item inline-block mx-2 my-1 cursor-pointer transition-all hover:scale-105 hover:shadow-md"
      :style="{
        fontSize: `${getFontSize(tag.count)}px`,
        color: getColor(tag),
        fontWeight: tag.count > maxFrequency * 0.7 ? '600' : '400',
        opacity: tag.count > maxFrequency * 0.3 ? 0.9 : 0.7,
      }"
      @click="handleClick(tag)"
      @keydown.enter="handleClick(tag)"
    >
      {{ tag.name }}
      <span
        v-if="tag.count > 1"
        class="tag-count text-xs ml-1 opacity-70"
        :style="{ fontSize: `${Math.max(10, getFontSize(tag.count) * 0.6)}px` }"
      >
        ({{ tag.count }})
      </span>
    </span>
  </div>
</template>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  min-height: 200px;
}

.tag-cloud-item {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.tag-cloud-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.tag-count {
  vertical-align: super;
}
</style>