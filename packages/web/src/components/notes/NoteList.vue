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
  event.stopPropagation();
  if (confirm('确定删除此笔记吗？')) {
    await deleteNote(id);
    await fetchNotes();
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
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-2 p-4 border-b">
      <div class="relative flex-1">
        <Search
          class="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input v-model="search" placeholder="搜索笔记..." class="pl-8" />
      </div>
      <Button size="sm" @click="emit('create')">
        <Plus class="h-4 w-4 mr-1" /> 新建
      </Button>
    </div>

    <!-- 收藏筛选选项卡 -->
    <div class="flex gap-1 p-4 border-b">
      <Button
        size="sm"
        :variant="activeFilter === 'all' ? 'default' : 'outline'"
        @click="activeFilter = 'all'"
      >
        全部
      </Button>
      <Button
        size="sm"
        :variant="activeFilter === 'favorite' ? 'default' : 'outline'"
        @click="activeFilter = 'favorite'"
      >
        <Star class="h-3 w-3 mr-1" /> 收藏
      </Button>
      <Button
        size="sm"
        :variant="activeFilter === 'non-favorite' ? 'default' : 'outline'"
        @click="activeFilter = 'non-favorite'"
      >
        未收藏
      </Button>
    </div>

    <div v-if="allTags.length" class="flex gap-2 p-4 border-b overflow-x-auto">
      <Badge
        v-for="tag in allTags"
        :key="tag"
        :variant="selectedTag === tag ? 'default' : 'outline'"
        class="cursor-pointer"
        @click="selectedTag = selectedTag === tag ? null : tag"
      >
        {{ tag }}
      </Badge>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-for="note in notes"
        :key="note.id"
        class="p-4 border-b hover:bg-accent cursor-pointer transition-colors group"
        @click="emit('select', note)"
      >
        <div class="flex justify-between items-start">
          <div class="font-medium truncate flex-1">
            {{ note.title || '无标题' }}
          </div>
          <div class="flex gap-1">
            <FavoriteButton
              :note-id="note.id"
              :is-favorite="note.isFavorite"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @update="(isFavorite) => handleFavoriteUpdate(note.id, isFavorite)"
            />
            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="(e: Event) => handleDelete(note.id, e)"
            >
              <Trash2 class="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div class="text-sm text-muted-foreground truncate mt-1">
          {{ note.content.slice(0, 80) }}
        </div>
        <div class="flex gap-1 mt-2">
          <Badge
            v-for="tag in note.tags"
            :key="tag"
            variant="secondary"
            class="text-xs"
          >
            {{ tag }}
          </Badge>
        </div>
        <div class="text-xs text-muted-foreground mt-2">
          {{ new Date(note.updatedAt).toLocaleString() }}
        </div>
      </div>
      <div
        v-if="!isLoading && notes.length === 0"
        class="p-8 text-center text-muted-foreground"
      >
        暂无笔记，点击右上角新建
      </div>
      <div v-if="isLoading" class="p-8 text-center text-muted-foreground">
        加载中...
      </div>
    </div>
  </div>
</template>
