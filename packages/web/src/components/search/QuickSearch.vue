<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useSearchStore } from '@/stores/search';
import { useMagicKeys } from '@vueuse/core';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import SearchInput from './SearchInput.vue';
import SearchResults from './SearchResults.vue';
import { Search } from 'lucide-vue-next';

const searchStore = useSearchStore();
const keys = useMagicKeys();

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl+K 或 Cmd+K 打开/关闭搜索面板
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault(); // 阻止浏览器默认行为
    event.stopPropagation(); // 阻止事件冒泡
    searchStore.toggle();
    return;
  }

  // Escape 关闭搜索面板
  if (event.key === 'Escape' && searchStore.open) {
    event.preventDefault();
    searchStore.close();
    return;
  }

  // 仅在搜索面板打开时处理其他按键
  if (!searchStore.open) return;

  // 箭头键导航（仅在搜索面板打开且有结果时）
  if (searchStore.hasResults) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      searchStore.selectNext();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      searchStore.selectPrevious();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const result = searchStore.selectCurrent();
      if (result) {
        emit('select', result);
        searchStore.close();
      }
    }
  }
};

// 组件挂载时添加全局键盘事件监听器
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// 保留 useMagicKeys 作为备用，但主要使用原生事件监听器
// 监听 Ctrl+K / Cmd+K 快捷键（备用方案）
const ctrlK = keys['ctrl+k'];
const cmdK = keys['meta+k'];

watch([ctrlK, cmdK], ([ctrlPressed, cmdPressed]) => {
  if (ctrlPressed || cmdPressed) {
    searchStore.toggle();
  }
});

// 监听 Escape 键关闭搜索（备用方案）
const escapeKey = keys['escape'];
watch(escapeKey, (pressed) => {
  if (pressed && searchStore.open) {
    searchStore.close();
  }
});

// 监听箭头键导航（备用方案）
const arrowUp = keys['arrowup'];
const arrowDown = keys['arrowdown'];

watch(arrowUp, (pressed) => {
  if (pressed && searchStore.open && searchStore.hasResults) {
    searchStore.selectPrevious();
  }
});

watch(arrowDown, (pressed) => {
  if (pressed && searchStore.open && searchStore.hasResults) {
    searchStore.selectNext();
  }
});

// Enter 键选择当前结果（备用方案）
const enterKey = keys['enter'];
watch(enterKey, (pressed) => {
  if (pressed && searchStore.open && searchStore.selectedResult) {
    const result = searchStore.selectCurrent();
    if (result) {
      emit('select', result);
    }
  }
});

const emit = defineEmits<{
  (e: 'select', result: any): void;
}>();
</script>

<template>
  <Sheet
    :open="searchStore.open"
    @update:open="(v) => (v ? searchStore.openSearch() : searchStore.close())"
  >
    <SheetContent
      side="top"
      class="top-0 p-0 sm:max-w-2xl sm:mx-auto sm:mt-20 rounded-lg shadow-xl"
      :class="[searchStore.open ? 'animate-in slide-in-from-top-5' : '']"
    >
      <div class="flex flex-col h-full max-h-[80vh]">
        <!-- 搜索输入区域 -->
        <div class="p-4 bg-background rounded-t-lg">
          <div class="flex items-center gap-3">
            <Search class="h-5 w-5 text-muted-foreground shrink-0" />
            <SearchInput />
          </div>
          <div
            class="mt-2 text-xs text-muted-foreground flex items-center justify-between"
          >
            <div>
              <span class="inline-flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 text-xs bg-accent rounded border"
                  >↑</kbd
                >
                <kbd class="px-1.5 py-0.5 text-xs bg-accent rounded border"
                  >↓</kbd
                >
                导航
              </span>
              <span class="mx-2">•</span>
              <span class="inline-flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 text-xs bg-accent rounded border"
                  >Enter</kbd
                >
                选择
              </span>
              <span class="mx-2">•</span>
              <span class="inline-flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 text-xs bg-accent rounded border"
                  >Esc</kbd
                >
                关闭
              </span>
            </div>
            <div
              v-if="searchStore.results.length > 0"
              class="text-muted-foreground"
            >
              找到 {{ searchStore.results.length }} 个结果
            </div>
          </div>
        </div>

        <!-- 搜索结果区域 -->
        <div class="flex-1 overflow-hidden">
          <SearchResults @select="emit('select', $event)" />
        </div>

        <!-- 底部提示 -->
        <div
          v-if="
            !searchStore.loading &&
            searchStore.results.length === 0 &&
            searchStore.query
          "
          class="p-8 text-center text-muted-foreground border-t"
        >
          <Search class="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p class="font-medium">未找到匹配的结果</p>
          <p class="text-sm mt-1">尝试使用不同的关键词搜索</p>
        </div>

        <!-- 加载状态 -->
        <div
          v-if="searchStore.loading"
          class="p-8 text-center text-muted-foreground border-t"
        >
          <div
            class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
          ></div>
          <p class="mt-2">正在搜索...</p>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
