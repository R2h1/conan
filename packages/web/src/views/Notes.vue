<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { Note } from '@/api/notes';
import NoteList from '@/components/notes/NoteList.vue';
import NoteEditor from '@/components/notes/NoteEditor.vue';
import { useToast } from '@/components/ui/toast';

const currentNote = ref<Note | null>(null);
const showEditor = ref(false);
const noteListRef = ref<InstanceType<typeof NoteList>>();
const { toast } = useToast();

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

const showGuide = () => {
  toast({
    title: '使用指南',
    description: '正在准备使用指南页面...',
  });
  // 这里可以添加跳转到使用指南页面的逻辑
  // router.push('/guide');
};
</script>

<template>
  <div class="h-full flex relative overflow-hidden animate-fade-in">
    <!-- 温暖友好的装饰性背景 -->
    <div class="absolute inset-0 pointer-events-none z-[-1]">
      <div class="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
    </div>

    <!-- 左侧列表（桌面端） -->
    <div class="w-80 border-r border-primary/10 hidden md:block bg-gradient-to-b from-background to-accent/5">
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
        class="h-full flex flex-col items-center justify-center p-8"
      >
        <div class="max-w-md text-center">
          <div class="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center mx-auto mb-6">
            <svg class="w-16 h-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-foreground mb-3">欢迎来到知识库</h3>
          <p class="text-muted-foreground mb-6">
            这里是你的个人知识空间，记录想法、整理笔记、积累知识。
            从左侧选择笔记开始编辑，或创建新的笔记。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center w-full max-w-md mx-auto">
            <Button
              size="lg"
              @click="handleCreateNote"
              class="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 w-full sm:w-auto"
            >
              <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              创建新笔记
            </Button>
            <Button
              variant="outline"
              size="lg"
              @click="showGuide"
              class="inline-flex items-center justify-center rounded-lg border-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-200 px-6 py-3 w-full sm:w-auto"
            >
              <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              查看使用指南
            </Button>
          </div>
          <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-lg border border-input bg-card/50 text-center">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p class="text-sm font-medium">Markdown支持</p>
              <p class="text-xs text-muted-foreground">丰富的编辑功能</p>
            </div>
            <div class="p-4 rounded-lg border border-input bg-card/50 text-center">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              </div>
              <p class="text-sm font-medium">智能收藏</p>
              <p class="text-xs text-muted-foreground">快速标记重要内容</p>
            </div>
            <div class="p-4 rounded-lg border border-input bg-card/50 text-center">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <p class="text-sm font-medium">版本历史</p>
              <p class="text-xs text-muted-foreground">随时回溯修改</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
