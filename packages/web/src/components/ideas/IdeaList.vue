<template>
  <div class="space-y-4">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          :class="!showCategoryFilter ? 'bg-accent' : ''"
          @click="showCategoryFilter = false"
        >
          全部
        </Button>
        <Button
          v-for="category in categories"
          :key="category"
          variant="ghost"
          size="sm"
          :class="selectedCategory === category ? 'bg-accent' : ''"
          @click="selectedCategory = category"
        >
          {{ category }}
        </Button>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="sortBy"
          class="text-sm border rounded-md px-2 py-1 bg-transparent"
          @change="emitSortChange"
        >
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="priority">优先级</option>
        </select>
        <Button variant="outline" size="icon" @click="$emit('toggle-view')">
          <LayoutGrid v-if="view === 'list'" class="h-4 w-4" />
          <List v-else class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div
      v-if="view === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <IdeaCard
        v-for="idea in filteredIdeas"
        :key="idea.id"
        :idea="idea"
        @click="$emit('select', idea)"
        @delete="$emit('delete', $event)"
        @toggle-complete="$emit('toggle-complete', $event)"
      />
    </div>
    <div v-else class="space-y-4">
      <IdeaCard
        v-for="idea in filteredIdeas"
        :key="idea.id"
        :idea="idea"
        @click="$emit('select', idea)"
        @delete="$emit('delete', $event)"
        @toggle-complete="$emit('toggle-complete', $event)"
      />
    </div>

    <!-- 空状态 -->
    <div
      v-if="!filteredIdeas.length"
      class="text-center py-16 text-muted-foreground"
    >
      <Lightbulb class="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>暂无灵感记录</p>
      <p class="text-sm">点击右上角按钮创建新的灵感</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { LayoutGrid, List, Lightbulb } from 'lucide-vue-next';
import IdeaCard from './IdeaCard.vue';

interface Idea {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const props = defineProps<{
  ideas: Idea[];
  view: 'grid' | 'list';
}>();

const emit = defineEmits<{
  (e: 'select', idea: Idea): void;
  (e: 'delete', idea: Idea): void;
  (e: 'toggle-complete', idea: Idea): void;
  (e: 'toggle-view'): void;
}>();

const showCategoryFilter = ref(false);
const selectedCategory = ref<string>('');
const sortBy = ref('newest');

// 提取所有分类
const categories = computed(() => {
  const cats = new Set<string>();
  props.ideas.forEach(idea => {
    if (idea.category) cats.add(idea.category);
  });
  return Array.from(cats);
});

// 筛选和排序后的灵感
const filteredIdeas = computed(() => {
  let result = [...props.ideas];

  // 分类筛选
  if (!showCategoryFilter.value && selectedCategory.value) {
    result = result.filter(idea => idea.category === selectedCategory.value);
  }

  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy.value === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy.value === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  return result;
});

const emitSortChange = () => {
  // 触发排序变化事件（可选）
};
</script>
