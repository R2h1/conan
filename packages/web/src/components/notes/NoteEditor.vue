<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { createNote, updateNote, deleteNote, getRelatedNotes, type Note, type RelatedNote } from '@/api/notes';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Save, Trash2, Link, History } from 'lucide-vue-next';
import FavoriteButton from './FavoriteButton.vue';
import VersionHistory from './VersionHistory.vue';
import 'highlight.js/styles/github-dark.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
marked.setOptions({
  highlight: ((code: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }) as any,
} as any);

const props = defineProps<{
  note: Note | null;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'deleted'): void;
  (e: 'select', note: RelatedNote): void;
  (e: 'favorite-updated', isFavorite: boolean): void;
}>();

const { toast } = useToast();

const title = ref('');
const content = ref('');
const tagsInput = ref('');
const tags = ref<string[]>([]);
const isSaving = ref(false);
const relatedNotes = ref<RelatedNote[]>([]);
const showRelated = ref(false);
const showVersionHistory = ref(false);

// 加载相关笔记
const loadRelatedNotes = async () => {
  if (!props.note?.id) {
    relatedNotes.value = [];
    showRelated.value = false;
    return;
  }
  try {
    relatedNotes.value = await getRelatedNotes(props.note.id);
    showRelated.value = relatedNotes.value.length > 0;
  } catch (error) {
    console.error('Failed to load related notes:', error);
    showRelated.value = false;
  }
};

watch(
  () => props.note,
  (newNote) => {
    if (newNote) {
      title.value = newNote.title;
      content.value = newNote.content;
      tags.value = [...newNote.tags];
      tagsInput.value = newNote.tags.join(', ');
      loadRelatedNotes();
    } else {
      title.value = '';
      content.value = '';
      tags.value = [];
      tagsInput.value = '';
      relatedNotes.value = [];
      showRelated.value = false;
    }
  },
  { immediate: true },
);

const updateTags = () => {
  tags.value = tagsInput.value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t);
};

const saveNote = async () => {
  isSaving.value = true;
  try {
    const noteData = {
      title: title.value,
      content: content.value,
      tags: tags.value,
    };
    if (props.note?.id) {
      await updateNote(props.note.id, noteData);
      toast({
        title: '笔记已更新',
        description: '更改已成功保存',
      });
    } else {
      await createNote(noteData);
      toast({
        title: '笔记已创建',
        description: '新笔记创建成功',
      });
    }
    emit('saved');
  } catch (error) {
    toast({
      title: '保存失败',
      description: '请稍后重试',
      variant: 'destructive',
    });
    console.error('Save failed:', error);
  } finally {
    isSaving.value = false;
  }
};

const deleteCurrentNote = async () => {
  if (!props.note?.id) return;
  console.log('Deleting note from editor, id:', props.note.id);
  if (confirm('确定删除此笔记吗？')) {
    isSaving.value = true;
    try {
      console.log('Calling deleteNote API...');
      await deleteNote(props.note.id);
      console.log('Note deleted successfully');
      toast({
        title: '笔记已删除',
        description: '笔记已成功删除',
      });
      emit('deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      isSaving.value = false;
    }
  }
};

const handleFavoriteUpdate = async (isFavorite: boolean) => {
  emit('favorite-updated', isFavorite);
};

const toggleVersionHistory = () => {
  showVersionHistory.value = !showVersionHistory.value;
};

const previewHtml = computed(() => marked.parse(content.value));
</script>

<template>
  <div class="flex flex-col h-full relative overflow-hidden">
    <!-- 温暖友好的装饰性背景 -->
    <div class="absolute inset-0 pointer-events-none z-[-1]">
      <div class="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-20 -translate-x-20"></div>
      <div class="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/3 to-transparent rounded-full translate-y-16 translate-x-16"></div>
    </div>

    <!-- 顶部工具栏 -->
    <div class="flex items-center gap-3 p-4 border-b bg-background/80 backdrop-blur-sm">
      <div class="relative flex-1 group">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
        <Input
          v-model="title"
          placeholder="笔记标题"
          class="flex-1 text-lg font-medium border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-200 pl-9"
        />
        <svg class="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </div>
      <Button
        variant="default"
        size="sm"
        @click="saveNote"
        :disabled="isSaving"
        class="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Save class="h-4 w-4 mr-1" />
        <span v-if="isSaving">保存中...</span>
        <span v-else>保存</span>
      </Button>
      <FavoriteButton
        v-if="note"
        :note-id="note.id"
        :is-favorite="note.isFavorite"
        @update="handleFavoriteUpdate"
      />
      <Button
        v-if="note"
        variant="outline"
        size="sm"
        @click="toggleVersionHistory"
        :disabled="isSaving"
        class="border-primary/30 text-muted-foreground hover:border-primary hover:text-foreground transition-all duration-200"
      >
        <History class="h-4 w+4" />
      </Button>
      <Button
        variant="destructive"
        size="sm"
        @click="deleteCurrentNote"
        v-if="note"
        :disabled="isSaving"
        class="transition-all duration-200 hover:scale-105"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>

    <div class="p-4 border-b bg-gradient-to-r from-transparent via-primary/2 to-transparent">
      <div class="relative group">
        <Input
          v-model="tagsInput"
          placeholder="标签（用逗号分隔）"
          @blur="updateTags"
          class="border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-200 pl-9"
        />
        <svg class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
        <div class="text-xs text-muted-foreground mt-1 ml-1">输入标签后按 Enter 或点击其他地方添加</div>
      </div>
      <div v-if="tags.length" class="flex flex-wrap gap-2 mt-3">
        <Badge
          v-for="tag in tags"
          :key="tag"
          variant="secondary"
          class="text-xs transition-all duration-200 hover:scale-105 hover:shadow-sm group/tag"
        >
          <span class="flex items-center">
            {{ tag }}
            <X
              class="h-3 w-3 ml-1 cursor-pointer opacity-60 group-hover/tag:opacity-100 transition-opacity duration-200 hover:text-destructive"
              @click.stop="tags = tags.filter((t) => t !== tag)"
            />
          </span>
        </Badge>
      </div>
    </div>

    <!-- 相关笔记 -->
    <div v-if="showRelated && note" class="p-4 border-b bg-gradient-to-r from-primary/5 via-primary/2 to-transparent">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Link class="h-4 w-4 text-primary" />
        </div>
        <span class="text-sm font-medium text-foreground">相关笔记</span>
        <span class="text-xs text-muted-foreground">({{ relatedNotes.length }}条)</span>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-2">
        <Button
          v-for="related in relatedNotes"
          :key="related.id"
          variant="outline"
          size="sm"
          class="whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary hover:text-primary"
          @click="emit('select', related)"
        >
          {{ related.title || '无标题' }}
          <Badge
            v-if="related.matchScore"
            variant="default"
            class="ml-1 bg-primary/20 text-primary border-primary/30"
          >
            {{ related.matchScore }}%
          </Badge>
        </Button>
      </div>
    </div>

    <!-- 版本历史 -->
    <VersionHistory
      v-if="showVersionHistory && note"
      :note-id="note.id"
      class="p-4 border-b bg-muted/30"
    />

    <div class="flex-1 flex flex-col md:flex-row overflow-hidden border-t">
      <!-- 编辑器区域 -->
      <div class="flex-1 border-r p-4 overflow-auto bg-gradient-to-b from-background to-accent/5">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b">
          <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          <span class="text-sm font-medium text-foreground">编辑</span>
          <span class="text-xs text-muted-foreground">(Markdown语法)</span>
        </div>
        <Textarea
          v-model="content"
          placeholder="在这里写下你的想法...
• 支持 Markdown 语法
• 使用 # 创建标题
• 使用 **文本** 加粗
• 使用 * 创建列表"
          class="min-h-[200px] md:min-h-[calc(100%-3rem)] resize-none border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-200 font-mono text-sm"
        />
        <div class="mt-3 text-xs text-muted-foreground flex items-center justify-between">
          <span>字数: {{ content.length }} 字符</span>
          <span class="flex items-center gap-1">
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            自动保存
          </span>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="flex-1 p-4 overflow-auto bg-gradient-to-b from-background to-muted/10">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b">
          <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <span class="text-sm font-medium text-foreground">预览</span>
          <span class="text-xs text-muted-foreground">(实时)</span>
        </div>
        <div class="prose dark:prose-invert max-w-none p-4 rounded-lg border border-input bg-card">
          <div v-html="previewHtml" class="animate-fade-in"></div>
          <div v-if="!content.trim()" class="text-center py-12 text-muted-foreground">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p class="text-lg font-medium mb-2">开始写作</p>
            <p class="text-sm">在左侧编辑器中输入内容，这里将显示实时预览</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
