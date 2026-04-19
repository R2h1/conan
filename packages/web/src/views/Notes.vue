<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { Note } from '@/api/notes';
import NoteList from '@/components/notes/NoteList.vue';
import NoteEditor from '@/components/notes/NoteEditor.vue';

const currentNote = ref<Note | null>(null);
const showEditor = ref(false);
const noteListRef = ref<InstanceType<typeof NoteList>>();

const handleSelectNote = (note: Note) => {
  currentNote.value = note;
  showEditor.value = true;
};

const handleCreateNote = () => {
  currentNote.value = null;
  showEditor.value = true;
};

const handleSaved = async () => {
  console.log('Note saved, refreshing list...');
  showEditor.value = false;
  currentNote.value = null;
  // 等待DOM更新完成
  await nextTick();
  // 刷新笔记列表
  noteListRef.value?.fetchNotes();
};

const handleDeleted = async () => {
  console.log('Note deleted, refreshing list...');
  showEditor.value = false;
  currentNote.value = null;
  // 等待DOM更新完成
  await nextTick();
  // 刷新笔记列表
  noteListRef.value?.fetchNotes();
};

const handleSelectRelated = (note: Note) => {
  currentNote.value = note;
};

const handleFavoriteUpdated = () => {
  // 当笔记收藏状态更新时，我们可能需要刷新列表
  // 这里我们可以选择重新获取笔记列表，或者依赖于本地状态更新
  // 目前NoteList组件已经处理了本地状态更新，所以这里可以空着
  // 如果需要从服务器重新获取数据，可以在这里调用NoteList的刷新方法
  // 但NoteList组件是独立的，我们需要通过其他方式触发刷新
};
</script>

<template>
  <div class="h-full flex">
    <!-- 左侧列表（桌面端） -->
    <div class="w-80 border-r hidden md:block">
      <NoteList ref="noteListRef" @select="handleSelectNote" @create="handleCreateNote" />
    </div>
    <!-- 右侧编辑器 -->
    <div class="flex-1">
      <NoteEditor
        v-if="showEditor"
        :note="currentNote"
        @saved="handleSaved"
        @deleted="handleDeleted"
        @select="handleSelectRelated"
        @favorite-updated="handleFavoriteUpdated"
      />
      <div
        v-else
        class="h-full flex items-center justify-center text-muted-foreground"
      >
        选择或新建笔记
      </div>
    </div>
  </div>
</template>
