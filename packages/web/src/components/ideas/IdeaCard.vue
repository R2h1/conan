<template>
  <div
    class="card-clickable p-4 cursor-pointer"
    :class="idea.completed ? 'opacity-75' : ''"
    @click="$emit('click', idea)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-semibold truncate">{{ idea.title }}</h3>
          <Badge
            v-if="idea.priority === 'high'"
            variant="destructive"
            class="text-xs"
          >
            高
          </Badge>
          <Badge
            v-else-if="idea.priority === 'medium'"
            variant="secondary"
            class="text-xs"
          >
            中
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground line-clamp-2 mb-3">
          {{ idea.content }}
        </p>
        <div class="flex items-center gap-2 flex-wrap">
          <Badge
            v-if="idea.category"
            variant="outline"
            class="text-xs"
          >
            {{ idea.category }}
          </Badge>
          <Badge
            v-for="tag in idea.tags"
            :key="tag"
            variant="secondary"
            class="text-xs"
          >
            {{ tag }}
          </Badge>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          :class="idea.completed ? 'text-green-500' : 'text-muted-foreground'"
          @click.stop="toggleComplete"
        >
          <CheckCircle v-if="idea.completed" class="h-4 w-4" />
          <Circle v-else class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-destructive"
          @click.stop="$emit('delete', idea)"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </div>
    <div class="flex items-center justify-between mt-3 pt-3 border-t">
      <span class="text-xs text-muted-foreground">
        {{ formatDate(idea.createdAt) }}
      </span>
      <span class="text-xs text-muted-foreground">
        {{ formatDate(idea.updatedAt) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Trash2 } from 'lucide-vue-next';

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
  idea: Idea;
}>();

const emit = defineEmits<{
  (e: 'click', idea: Idea): void;
  (e: 'delete', idea: Idea): void;
  (e: 'toggle-complete', idea: Idea): void;
}>();

const toggleComplete = () => {
  emit('toggle-complete', props.idea);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
};
</script>
