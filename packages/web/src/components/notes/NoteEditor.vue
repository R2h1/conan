<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { createNote, updateNote, type Note } from '@/api/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Save, Trash2 } from 'lucide-vue-next';
import 'highlight.js/styles/github-dark.css';

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

const props = defineProps<{
  note: Note | null;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'deleted'): void;
}>();

const title = ref('');
const content = ref('');
const tagsInput = ref('');
const tags = ref<string[]>([]);
const isSaving = ref(false);

watch(
  () => props.note,
  (newNote) => {
    if (newNote) {
      title.value = newNote.title;
      content.value = newNote.content;
      tags.value = [...newNote.tags];
      tagsInput.value = newNote.tags.join(', ');
    } else {
      title.value = '';
      content.value = '';
      tags.value = [];
      tagsInput.value = '';
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
    } else {
      await createNote(noteData);
    }
    emit('saved');
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    isSaving.value = false;
  }
};

const deleteNote = async () => {
  if (!props.note?.id) return;
  if (confirm('确定删除此笔记吗？')) {
    isSaving.value = true;
    try {
      await deleteNote(props.note.id);
      emit('deleted');
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      isSaving.value = false;
    }
  }
};

const previewHtml = computed(() => marked(content.value));
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-2 p-4 border-b">
      <Input
        v-model="title"
        placeholder="笔记标题"
        class="flex-1 text-lg font-medium"
      />
      <Button
        variant="outline"
        size="sm"
        @click="saveNote"
        :disabled="isSaving"
      >
        <Save class="h-4 w-4 mr-1" /> 保存
      </Button>
      <Button
        variant="destructive"
        size="sm"
        @click="deleteNote"
        v-if="note"
        :disabled="isSaving"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>

    <div class="p-4 border-b">
      <Input
        v-model="tagsInput"
        placeholder="标签（用逗号分隔）"
        @blur="updateTags"
      />
      <div class="flex gap-1 mt-2">
        <Badge
          v-for="tag in tags"
          :key="tag"
          variant="secondary"
          class="text-xs"
        >
          {{ tag }}
          <X
            class="h-3 w-3 ml-1 cursor-pointer"
            @click="tags = tags.filter((t) => t !== tag)"
          />
        </Badge>
      </div>
    </div>

    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <div class="flex-1 border-r p-4 overflow-auto">
        <Textarea
          v-model="content"
          placeholder="支持 Markdown 语法..."
          class="min-h-[200px] md:min-h-full resize-none"
        />
      </div>
      <div class="flex-1 p-4 overflow-auto prose dark:prose-invert max-w-none">
        <div v-html="previewHtml"></div>
      </div>
    </div>
  </div>
</template>
