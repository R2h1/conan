<script setup lang="ts">
import { ref, watch } from 'vue';
import { restoreVersion, type NoteVersion } from '@/api/versions';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
  noteId: number;
  version: NoteVersion | null;
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'restored', note: any): void;
}>();

const { toast } = useToast();
const restoreMode = ref<'new' | 'overwrite'>('new');
const description = ref('');
const isLoading = ref(false);

// 监听open变化
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    // 重置表单
    restoreMode.value = 'new';
    description.value = '';
    isLoading.value = false;
  }
});

// 关闭对话框
const closeDialog = () => {
  emit('update:open', false);
};

// 执行恢复操作
const handleRestore = async () => {
  if (!props.version) return;

  isLoading.value = true;
  try {
    const result = await restoreVersion(props.noteId, {
      versionId: props.version.id,
      createNew: restoreMode.value === 'new',
    });

    toast({
      title: '恢复成功',
      description: restoreMode.value === 'new'
        ? '已创建新版本包含历史内容'
        : '当前版本已覆盖',
    });

    emit('restored', result.note);
    closeDialog();
  } catch (error) {
    console.error('Failed to restore version:', error);
    toast({
      title: '恢复失败',
      description: '无法恢复到该版本',
      variant: 'destructive',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="open" class="restore-dialog-overlay" @click="closeDialog">
    <div class="restore-dialog" @click.stop>
      <div class="dialog-header">
        <h3 class="text-lg font-semibold">恢复版本</h3>
        <p class="text-sm text-muted-foreground">
          版本 #{{ version?.version }} - {{ version?.title }}
        </p>
      </div>

      <div class="dialog-content">
        <div class="form-section">
          <Label for="restore-mode" class="form-label">恢复方式</Label>
          <RadioGroup v-model="restoreMode" class="radio-group">
            <div class="radio-item">
              <RadioGroupItem value="new" id="new" />
              <Label for="new" class="radio-label">
                <div class="radio-title">创建新版本</div>
                <div class="radio-description">将历史版本内容创建为新版本，保留当前版本</div>
              </Label>
            </div>
            <div class="radio-item">
              <RadioGroupItem value="overwrite" id="overwrite" />
              <Label for="overwrite" class="radio-label">
                <div class="radio-title">覆盖当前版本</div>
                <div class="radio-description">直接覆盖当前版本，不创建新版本</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div class="form-section">
          <Label for="description" class="form-label">恢复描述（可选）</Label>
          <Input
            id="description"
            v-model="description"
            placeholder="描述恢复原因..."
            class="w-full"
          />
        </div>

        <div class="version-preview">
          <h4 class="text-sm font-medium mb-2">版本内容预览</h4>
          <div class="preview-content">
            <div class="preview-title">{{ version?.title }}</div>
            <div class="preview-text">
              {{ version?.content?.substring(0, 200) }}
              {{ version?.content && version.content.length > 200 ? '...' : '' }}
            </div>
            <div class="preview-tags">
              <div v-for="tag in version?.tags" :key="tag" class="tag-badge">
                {{ tag }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <Button variant="outline" @click="closeDialog" :disabled="isLoading">
          取消
        </Button>
        <Button @click="handleRestore" :disabled="isLoading">
          <span v-if="isLoading">恢复中...</span>
          <span v-else>确认恢复</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.restore-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.restore-dialog {
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
}

.dialog-content {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.radio-item:hover {
  background-color: hsl(var(--muted));
}

.radio-label {
  flex: 1;
  cursor: pointer;
}

.radio-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.radio-description {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
}

.version-preview {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: hsl(var(--muted));
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
}

.preview-content {
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}

.preview-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.preview-text {
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.preview-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border-radius: 9999px;
  font-size: 0.75rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid hsl(var(--border));
}
</style>