<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useSearchStore } from '@/stores/search';
import { Input } from '@/components/ui/input';
import { useDebounceFn } from '@vueuse/core';

const searchStore = useSearchStore();
const inputRef = ref<HTMLInputElement>();

// 防抖搜索函数（300ms）
const debouncedSearch = useDebounceFn(async () => {
  await searchStore.search(searchStore.query);
}, 300);

// 监听搜索词变化
watch(() => searchStore.query, () => {
  debouncedSearch();
});

// 组件挂载时自动聚焦输入框
onMounted(() => {
  // 使用 nextTick 确保 DOM 已渲染
  setTimeout(() => {
    if (inputRef.value && searchStore.open) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  }, 100);
});

// 监听搜索面板打开状态，自动聚焦
watch(() => searchStore.open, (isOpen) => {
  if (isOpen && inputRef.value) {
    setTimeout(() => {
      if (inputRef.value) {
        inputRef.value.focus();
        inputRef.value.select();
      }
    }, 100);
  }
});

// 清空搜索
const clearSearch = () => {
  searchStore.query = '';
  searchStore.clearResults();
};
</script>

<template>
  <div class="flex-1 relative">
    <Input
      ref="inputRef"
      v-model="searchStore.query"
      type="text"
      placeholder="搜索笔记、灵感、工具..."
      class="w-full pl-0 pr-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg bg-transparent"
      @keydown.esc="searchStore.close"
    />
    <div
      v-if="searchStore.query"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
      @click="clearSearch"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h1-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </div>
</template>