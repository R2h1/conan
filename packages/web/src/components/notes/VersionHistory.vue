<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getNoteVersions, type NoteVersion } from '@/api/versions';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

interface Props {
  noteId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'restore', version: NoteVersion): void;
}>();
const { toast } = useToast();

const versions = ref<NoteVersion[]>([]);
const isLoading = ref(false);
const selectedVersion = ref<NoteVersion | null>(null);

// 加载版本历史
const loadVersions = async () => {
  isLoading.value = true;
  try {
    const data = await getNoteVersions(props.noteId);
    versions.value = data;
  } catch (error) {
    console.error('Failed to load version history:', error);
    toast({
      title: '加载失败',
      description: '无法加载历史版本',
      variant: 'destructive',
    });
  } finally {
    isLoading.value = false;
  }
};

// 选择版本
const handleSelectVersion = (version: NoteVersion) => {
  selectedVersion.value = version;
};

// 恢复版本
const handleRestore = () => {
  if (selectedVersion.value) {
    emit('restore', selectedVersion.value);
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 监听笔记ID变化
watch(() => props.noteId, (newNoteId) => {
  if (newNoteId) {
    loadVersions();
  }
});

onMounted(() => {
  if (props.noteId) {
    loadVersions();
  }
});
</script>

<template>
  <div class="version-history animate-fade-in">
    <div class="header">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-foreground">历史版本</h3>
      </div>
      <p class="text-sm text-muted-foreground">选择版本查看或恢复</p>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>加载版本历史...</p>
    </div>

    <div v-else-if="versions.length === 0" class="empty">
      <p>暂无历史版本</p>
    </div>

    <div v-else class="versions-list">
      <div
        v-for="version in versions"
        :key="version.id"
        class="version-item"
        :class="{ selected: selectedVersion?.id === version.id }"
        @click="handleSelectVersion(version)"
      >
        <div class="version-header">
          <div class="version-number">版本 #{{ version.version }}</div>
          <div class="version-date">{{ formatDate(version.createdAt) }}</div>
        </div>
        <div class="version-summary">
          <div class="version-title">{{ version.title }}</div>
          <div class="version-content-preview">
            {{ version.content.substring(0, 100) }}{{ version.content.length > 100 ? '...' : '' }}
          </div>
          <div class="version-tags">
            <div v-for="tag in version.tags" :key="tag" class="tag-badge">
              {{ tag }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedVersion" class="version-detail">
      <div class="detail-header">
        <h4 class="text-lg font-semibold">版本详情</h4>
        <div class="detail-actions">
          <Button variant="outline" size="sm" @click="handleRestore">
            恢复此版本
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.version-history {
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  overflow: hidden;
}

.header {
  padding: 1rem;
  background-color: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
}

.loading, .empty {
  padding: 2rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
}

.spinner {
  margin: 0 auto 1rem;
  border: 2px solid hsl(var(--border));
  border-top: 2px solid hsl(var(--primary));
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.version-item {
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(to right, transparent, hsl(var(--muted)/0.3));
}

.version-item:hover {
  background: linear-gradient(to right, hsl(var(--primary)/0.1), hsl(var(--muted)/0.5));
  transform: translateX(4px);
  border-left: 2px solid hsl(var(--primary)/0.5);
}

.version-item.selected {
  background: linear-gradient(to right, hsl(var(--primary)/0.2), hsl(var(--accent)/0.3));
  border-left: 4px solid hsl(var(--primary));
  box-shadow: 0 2px 8px hsl(var(--primary)/0.1);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.version-number {
  font-weight: 600;
}

.version-date {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.version-summary {
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}

.version-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.version-content-preview {
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.version-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--secondary)/0.8));
  color: hsl(var(--secondary-foreground));
  border-radius: 9999px;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.tag-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px hsl(var(--secondary)/0.3);
}

.version-detail {
  padding: 1rem;
  background-color: hsl(var(--muted));
  border-top: 1px solid hsl(var(--border));
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>