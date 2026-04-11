<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">
            {{ idea ? '编辑灵感' : '新建灵感' }}
          </h2>
          <Button variant="ghost" size="icon" @click="$emit('close')">
            <X class="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <!-- 标题 -->
        <div class="space-y-2">
          <Label for="title">标题</Label>
          <Input
            id="title"
            v-model="form.title"
            placeholder="给灵感一个简短的标题"
          />
        </div>

        <!-- 内容 -->
        <div class="space-y-2">
          <Label for="content">内容</Label>
          <Textarea
            id="content"
            v-model="form.content"
            placeholder="记录你的灵感、想法或待办..."
            rows="6"
            class="resize-none"
          />
        </div>

        <!-- 分类和优先级 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="category">分类</Label>
            <Input
              id="category"
              v-model="form.category"
              placeholder="例如：项目、学习、生活"
            />
          </div>
          <div class="space-y-2">
            <Label for="priority">优先级</Label>
            <select
              id="priority"
              v-model="form.priority"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>

        <!-- 标签 -->
        <div class="space-y-2">
          <Label for="tags">标签</Label>
          <div class="flex gap-2">
            <Input
              id="tags"
              v-model="tagInput"
              placeholder="输入标签后按回车添加"
              @keydown.enter="addTag"
            />
            <Button type="button" variant="secondary" @click="addTag">
              添加
            </Button>
          </div>
          <div class="flex gap-1 flex-wrap mt-2">
            <Badge
              v-for="tag in form.tags"
              :key="tag"
              variant="secondary"
              class="text-xs"
            >
              {{ tag }}
              <X
                class="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                @click="removeTag(tag)"
              />
            </Badge>
          </div>
        </div>
      </div>

      <div class="p-6 border-t flex justify-end gap-2">
        <Button variant="outline" @click="$emit('close')">取消</Button>
        <Button
          v-if="idea"
          variant="destructive"
          @click="$emit('delete')"
          class="mr-auto"
        >
          删除
        </Button>
        <Button @click="handleSubmit" :disabled="!form.title || !form.content">
          <Save class="h-4 w-4 mr-1" />
          {{ idea ? '保存' : '创建' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Save } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Idea {
  id?: number;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

const props = defineProps<{
  idea?: Idea | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): void;
  (e: 'delete'): void;
}>();

const form = ref({
  title: '',
  content: '',
  category: '',
  tags: [] as string[],
  priority: 'medium' as 'low' | 'medium' | 'high',
  completed: false,
});

const tagInput = ref('');

watch(
  () => props.idea,
  (newIdea) => {
    if (newIdea) {
      form.value = {
        title: newIdea.title,
        content: newIdea.content,
        category: newIdea.category || '',
        tags: [...newIdea.tags],
        priority: newIdea.priority,
        completed: newIdea.completed,
      };
    } else {
      form.value = {
        title: '',
        content: '',
        category: '',
        tags: [],
        priority: 'medium',
        completed: false,
      };
    }
  },
  { immediate: true }
);

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag);
  }
  tagInput.value = '';
};

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter(t => t !== tag);
};

const handleSubmit = () => {
  emit('save', {
    title: form.value.title,
    content: form.value.content,
    category: form.value.category,
    tags: form.value.tags,
    priority: form.value.priority,
    completed: form.value.completed,
  });
};
</script>
