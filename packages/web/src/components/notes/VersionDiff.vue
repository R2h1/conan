<script setup lang="ts">
import { computed } from 'vue';
import type { NoteVersion } from '@/api/versions';

interface Props {
  leftVersion: NoteVersion | null;
  rightVersion: NoteVersion | null;
}

const props = defineProps<Props>();

// 计算内容差异（简化版本）
const leftContent = computed(() => props.leftVersion?.content || '');
const rightContent = computed(() => props.rightVersion?.content || '');
const leftTitle = computed(() => props.leftVersion?.title || '');
const rightTitle = computed(() => props.rightVersion?.title || '');

// 简单的差异分析（只显示不同行）
const diffLines = computed(() => {
  const leftLines = leftContent.value.split('\n');
  const rightLines = rightContent.value.split('\n');
  const maxLines = Math.max(leftLines.length, rightLines.length);

  const diffs = [];

  for (let i = 0; i < maxLines; i++) {
    const leftLine = leftLines[i] || '';
    const rightLine = rightLines[i] || '';

    if (leftLine !== rightLine) {
      diffs.push({
        lineNumber: i + 1,
        left: leftLine,
        right: rightLine,
      });
    }
  }

  return diffs;
});
</script>

<template>
  <div class="version-diff">
    <div class="diff-header">
      <h3 class="text-lg font-semibold">版本对比</h3>
      <p class="text-sm text-muted-foreground">并排显示两个版本的差异</p>
    </div>

    <div class="diff-container">
      <div class="left-panel">
        <div class="version-header">
          <div class="version-number">
            版本 #{{ leftVersion?.version || 'N/A' }}
          </div>
          <div class="version-title">
            {{ leftTitle }}
          </div>
        </div>

        <div class="version-content">
          <div class="content-header">内容</div>
          <pre class="content-text">{{ leftContent }}</pre>
        </div>
      </div>

      <div class="separator">
        <div class="separator-line"></div>
      </div>

      <div class="right-panel">
        <div class="version-header">
          <div class="version-number">
            版本 #{{ rightVersion?.version || 'N/A' }}
          </div>
          <div class="version-title">
            {{ rightTitle }}
          </div>
        </div>

        <div class="version-content">
          <div class="content-header">内容</div>
          <pre class="content-text">{{ rightContent }}</pre>
        </div>
      </div>
    </div>

    <div v-if="diffLines.length > 0" class="diffs-section">
      <h4 class="text-sm font-medium mb-2">差异行</h4>
      <div class="diffs-list">
        <div v-for="diff in diffLines" :key="diff.lineNumber" class="diff-item">
          <div class="diff-line-number">第 {{ diff.lineNumber }} 行:</div>
          <div class="diff-lines">
            <div class="left-line">{{ diff.left }}</div>
            <div class="right-line">{{ diff.right }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.version-diff {
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  overflow: hidden;
}

.diff-header {
  padding: 1rem;
  background-color: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
}

.diff-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  min-height: 300px;
}

.left-panel, .right-panel {
  padding: 1rem;
  overflow-y: auto;
}

.separator {
  width: 1px;
  background-color: hsl(var(--border));
  position: relative;
}

.separator-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: hsl(var(--border));
  transform: translateX(-50%);
}

.version-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.version-title {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.content-header {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.25rem;
}

.content-text {
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  color: hsl(var(--foreground));
  white-space: pre-wrap;
  background-color: hsl(var(--muted));
  padding: 0.75rem;
  border-radius: 0.375rem;
  max-height: 400px;
  overflow-y: auto;
}

.diffs-section {
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid hsl(var(--border));
  background-color: hsl(var(--muted));
}

.diffs-list {
  max-height: 200px;
  overflow-y: auto;
}

.diff-item {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.diff-item:last-child {
  border-bottom: none;
}

.diff-line-number {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

.diff-lines {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.left-line, .right-line {
  font-family: monospace;
  font-size: 0.875rem;
  padding: 0.25rem;
  background-color: hsl(var(--muted));
  border-radius: 0.25rem;
  overflow-wrap: break-word;
}
</style>