<script setup lang="ts">
import { computed } from 'vue';
import { useSearchStore } from '@/stores/search';
import SearchResultItem from './SearchResultItem.vue';
import { FileText, Lightbulb, Wrench } from 'lucide-vue-next';

const searchStore = useSearchStore();

// 按类型分组的结果
const groupedResults = computed(() => {
  const groups = {
    note: [] as any[],
    idea: [] as any[],
    tool: [] as any[],
  };

  searchStore.results.forEach((result) => {
    groups[result.type].push(result);
  });

  return groups;
});

// 是否有结果
const hasResults = computed(() => {
  return Object.values(groupedResults.value).some(group => group.length > 0);
});

// 选择结果
const handleSelect = (result: any) => {
  emit('select', result);
};

const emit = defineEmits<{
  (e: 'select', result: any): void;
}>();
</script>

<template>
  <div v-if="hasResults" class="overflow-y-auto p-2">
    <!-- 笔记结果 -->
    <div v-if="groupedResults.note.length > 0" class="mb-6">
      <div class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <FileText class="h-4 w-4" />
        <span>笔记</span>
        <span class="ml-auto text-xs bg-accent px-2 py-0.5 rounded-full">
          {{ groupedResults.note.length }}
        </span>
      </div>
      <div class="space-y-1 mt-1">
        <SearchResultItem
          v-for="(result, index) in groupedResults.note"
          :key="`note-${result.id}`"
          :result="result"
          :index="index"
          :group-offset="0"
          @select="handleSelect"
        />
      </div>
    </div>

    <!-- 灵感结果 -->
    <div v-if="groupedResults.idea.length > 0" class="mb-6">
      <div class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Lightbulb class="h-4 w-4" />
        <span>灵感</span>
        <span class="ml-auto text-xs bg-accent px-2 py-0.5 rounded-full">
          {{ groupedResults.idea.length }}
        </span>
      </div>
      <div class="space-y-1 mt-1">
        <SearchResultItem
          v-for="(result, index) in groupedResults.idea"
          :key="`idea-${result.id}`"
          :result="result"
          :index="index"
          :group-offset="groupedResults.note.length"
          @select="handleSelect"
        />
      </div>
    </div>

    <!-- 工具结果 -->
    <div v-if="groupedResults.tool.length > 0" class="mb-2">
      <div class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Wrench class="h-4 w-4" />
        <span>工具</span>
        <span class="ml-auto text-xs bg-accent px-2 py-0.5 rounded-full">
          {{ groupedResults.tool.length }}
        </span>
      </div>
      <div class="space-y-1 mt-1">
        <SearchResultItem
          v-for="(result, index) in groupedResults.tool"
          :key="`tool-${result.id}`"
          :result="result"
          :index="index"
          :group-offset="groupedResults.note.length + groupedResults.idea.length"
          @select="handleSelect"
        />
      </div>
    </div>
  </div>
</template>