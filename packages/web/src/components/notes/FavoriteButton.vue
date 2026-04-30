<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast/use-toast';
import { toggleFavorite } from '@/api/notes';

interface Props {
  noteId: number;
  isFavorite: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', isFavorite: boolean): void;
}>();

const { toast } = useToast();
const isLoading = ref(false);
const localIsFavorite = ref(props.isFavorite);

// 当props变化时更新本地状态
watch(() => props.isFavorite, (newVal) => {
  localIsFavorite.value = newVal;
});

const handleToggleFavorite = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    const newFavorite = !localIsFavorite.value;
    await toggleFavorite(props.noteId, newFavorite);
    localIsFavorite.value = newFavorite;
    emit('update', newFavorite);

    toast({
      title: newFavorite ? '已收藏' : '已取消收藏',
      description: newFavorite ? '笔记已添加到收藏' : '笔记已从收藏中移除',
    });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    toast({
      title: '操作失败',
      description: '无法更新收藏状态',
      variant: 'destructive',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :class="[
      'h-6 w-6 transition-all duration-200',
      localIsFavorite ? 'text-[hsl(var(--warning))] hover:opacity-80' : 'text-muted-foreground hover:text-foreground'
    ]"
    @click.stop="handleToggleFavorite"
    :disabled="isLoading"
  >
    <Star v-if="localIsFavorite" class="h-3 w-3 fill-current" />
    <StarOff v-else class="h-3 w-3" />
  </Button>
</template>