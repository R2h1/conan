<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getNotes, deleteNote, type Note } from '@/api/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Star } from 'lucide-vue-next';
import FavoriteButton from './FavoriteButton.vue';

const notes = ref<Note[]>([]);
const search = ref('');
const selectedTag = ref<string | null>(null);
const activeFilter = ref<'all' | 'favorite' | 'non-favorite'>('all');
const allTags = ref<string[]>([]);
const isLoading = ref(false);

const fetchNotes = async () => {
  console.log('Fetching notes...');
  isLoading.value = true;
  try {
    const params: { search?: string; tag?: string; favorite?: boolean } = {};
    if (search.value) params.search = search.value;
    if (selectedTag.value) {
      params.tag = selectedTag.value;
      console.log('Filtering by tag:', selectedTag.value);
    }
    if (activeFilter.value === 'favorite') {
      params.favorite = true;
      console.log('Filtering favorites');
    } else if (activeFilter.value === 'non-favorite') {
      params.favorite = false;
      console.log('Filtering non-favorites');
    }
    console.log('Fetching notes with params:', params);
    const data = await getNotes(params);
    console.log('Fetched', data.length, 'notes');
    notes.value = data;
    // 提取所有标签
    const tagsSet = new Set<string>();
    data.forEach((note) => note.tags.forEach((tag) => tagsSet.add(tag)));
    allTags.value = Array.from(tagsSet);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  } finally {
    console.log('Finished fetching notes');
    isLoading.value = false;
  }
};

const handleDelete = async (id: number, event: Event) => {
  console.log('Delete button clicked, id:', id);
  event.preventDefault();
  if (confirm('确定删除此笔记吗？')) {
    try {
      console.log('Deleting note:', id);
      await deleteNote(id);
      console.log('Note deleted successfully');
      await fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('删除失败，请检查控制台');
    }
  }
};

const handleFavoriteUpdate = (id: number, isFavorite: boolean) => {
  const noteIndex = notes.value.findIndex(n => n.id === id);
  if (noteIndex !== -1) {
    // 更新笔记的收藏状态
    notes.value[noteIndex].isFavorite = isFavorite;

    // 如果当前筛选是'favorite'而笔记被取消收藏，从本地列表中移除
    if (activeFilter.value === 'favorite' && !isFavorite) {
      notes.value.splice(noteIndex, 1);
    }
    // 如果当前筛选是'non-favorite'而笔记被收藏，从本地列表中移除
    else if (activeFilter.value === 'non-favorite' && isFavorite) {
      notes.value.splice(noteIndex, 1);
    }
  }
};

watch([search, selectedTag, activeFilter], () => {
  fetchNotes();
});

onMounted(() => {
  fetchNotes();
});

const emit = defineEmits<{
  (e: 'select', note: Note): void;
  (e: 'create'): void;
}>();

defineExpose({
  fetchNotes,
});
</script>

<template>
  <div class="flex flex-col h-full relative overflow-hidden">
    <!-- 温暖友好的装饰性背景 -->
    <div class="absolute inset-0 pointer-events-none z-[-1]">
      <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/3 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="flex items-center gap-2 p-4 border-b relative z-10">
      <div class="relative flex-1 group">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
        <Search
          class="absolute left-2.5 top-[calc(50%-1px)] h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 z-10 pointer-events-none"
        />
        <Input
          v-model="search"
          placeholder="搜索笔记..."
          class="pl-9 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-200 bg-background/80 backdrop-blur-sm"
        />
      </div>
      <Button
        size="sm"
        @click="emit('create')"
        class="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus class="h-4 w-4 mr-1" /> 新建
      </Button>
    </div>

    <!-- 收藏筛选选项卡 -->
    <div class="flex gap-1 p-4 border-b">
      <Button
        size="sm"
        :variant="activeFilter === 'all' ? 'default' : 'outline'"
        @click="activeFilter = 'all'"
        :class="[
          'transition-all duration-200',
          activeFilter === 'all'
            ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg'
            : 'border-primary/30 text-muted-foreground hover:border-primary hover:text-foreground'
        ]"
      >
        全部
      </Button>
      <Button
        size="sm"
        :variant="activeFilter === 'favorite' ? 'default' : 'outline'"
        @click="activeFilter = 'favorite'"
        :class="[
          'transition-all duration-200',
          activeFilter === 'favorite'
            ? 'bg-gradient-to-r from-warning/20 to-warning/10 border-warning/30 text-warning-foreground shadow-md hover:shadow-lg'
            : 'border-primary/30 text-muted-foreground hover:border-primary hover:text-foreground'
        ]"
      >
        <Star class="h-3 w-3 mr-1" /> 收藏
      </Button>
      <Button
        size="sm"
        :variant="activeFilter === 'non-favorite' ? 'default' : 'outline'"
        @click="activeFilter = 'non-favorite'"
        :class="[
          'transition-all duration-200',
          activeFilter === 'non-favorite'
            ? 'bg-muted border-input text-foreground shadow-md hover:shadow-lg'
            : 'border-primary/30 text-muted-foreground hover:border-primary hover:text-foreground'
        ]"
      >
        未收藏
      </Button>
    </div>

    <div v-if="allTags.length" class="p-4 border-b bg-gradient-to-r from-transparent via-primary/2 to-transparent">
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in allTags"
          :key="tag"
          :variant="selectedTag === tag ? 'default' : 'outline'"
          class="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
          @click="selectedTag = selectedTag === tag ? null : tag"
          :class="[
            selectedTag === tag
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground'
          ]"
        >
          {{ tag }}
          <span v-if="selectedTag === tag" class="ml-1">✓</span>
        </Badge>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div
        v-for="(note, index) in notes"
        :key="note.id"
        class="p-4 mb-2 rounded-lg border border-input hover:border-primary/40 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:bg-gradient-to-r hover:from-background hover:to-accent/5 animate-fade-in-up"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="emit('select', note)"
      >
        <div class="flex justify-between items-start">
          <div class="font-medium truncate flex-1 text-foreground group-hover:text-primary transition-colors duration-200">
            {{ note.title || '无标题' }}
            <span v-if="note.isFavorite" class="ml-1 text-[hsl(var(--warning))]">★</span>
          </div>
          <div class="flex gap-1">
            <FavoriteButton
              :note-id="note.id"
              :is-favorite="note.isFavorite"
              class="opacity-60 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              @update="(isFavorite) => handleFavoriteUpdate(note.id, isFavorite)"
            />
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7 opacity-60 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:text-destructive"
              @click.stop="handleDelete(note.id, $event)"
            >
              <Trash2 class="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div class="text-sm text-muted-foreground truncate mt-2 group-hover:text-foreground/80 transition-colors duration-200">
          {{ note.content.slice(0, 100) }}{{ note.content.length > 100 ? '...' : '' }}
        </div>
        <div v-if="note.tags.length" class="flex gap-1 mt-3">
          <Badge
            v-for="tag in note.tags"
            :key="tag"
            variant="secondary"
            class="text-xs transition-all duration-200 hover:scale-105 hover:shadow-sm"
            :class="selectedTag === tag ? 'bg-primary/20 border-primary/30' : ''"
          >
            {{ tag }}
          </Badge>
        </div>
        <div class="text-xs text-muted-foreground mt-3 flex items-center">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ new Date(note.updatedAt).toLocaleString() }}
        </div>
      </div>
      <div
        v-if="!isLoading && notes.length === 0"
        class="p-12 text-center text-muted-foreground flex flex-col items-center justify-center"
      >
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p class="text-lg font-medium mb-2">还没有笔记</p>
        <p class="text-sm mb-4">点击右上角的"新建"按钮开始记录你的想法</p>
        <Button
          size="sm"
          variant="outline"
          @click="emit('create')"
          class="border-primary/30 text-primary hover:bg-primary/10"
        >
          <Plus class="h-4 w-4 mr-1" /> 创建第一个笔记
        </Button>
      </div>
      <div v-if="isLoading" class="p-12 text-center text-muted-foreground">
        <div class="inline-flex items-center">
          <div class="w-4 h-4 rounded-full bg-primary animate-pulse mr-2"></div>
          <div class="w-4 h-4 rounded-full bg-primary animate-pulse mr-2" style="animation-delay: 0.2s"></div>
          <div class="w-4 h-4 rounded-full bg-primary animate-pulse" style="animation-delay: 0.4s"></div>
        </div>
        <p class="mt-2">正在加载笔记...</p>
      </div>
    </div>
  </div>
</template>
