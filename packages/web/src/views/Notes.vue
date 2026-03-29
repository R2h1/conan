<script setup lang="ts">
import { ref } from 'vue';
import type { Note } from '@/api/notes';
import NoteList from '@/components/notes/NoteList.vue';
import NoteEditor from '@/components/notes/NoteEditor.vue';

const currentNote = ref<Note | null>(null);
const showEditor = ref(false);

const handleSelectNote = (note: Note) => {
  currentNote.value = note;
  showEditor.value = true;
};

const handleCreateNote = () => {
  currentNote.value = null;
  showEditor.value = true;
};

const handleSaved = () => {
  showEditor.value = false;
  currentNote.value = null;
};

const handleDeleted = () => {
  showEditor.value = false;
  currentNote.value = null;
};
</script>

<template>
  <div class="h-full flex">
    <!-- 左侧列表（桌面端） -->
    <div class="w-80 border-r hidden md:block">
      <NoteList @select="handleSelectNote" @create="handleCreateNote" />
    </div>
    <!-- 右侧编辑器 -->
    <div class="flex-1">
      <NoteEditor
        v-if="showEditor"
        :note="currentNote"
        @saved="handleSaved"
        @deleted="handleDeleted"
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
