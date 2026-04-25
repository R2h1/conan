<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { StudyRecord } from '@/api/checkin-study';
import { getStudyRecords, createStudyRecord, updateStudyRecord, deleteStudyRecord } from '@/api/checkin-study';
import { generateStudySummary } from '@/api/checkin-ai';
import { useCheckinStore } from '@/stores/checkin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const records = ref<StudyRecord[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editingRecord = ref<StudyRecord | null>(null);
const checkinStore = useCheckinStore();

const form = ref({
  type: 'study' as 'study' | 'read',
  content: '',
  duration: 30,
  pages: undefined as number | undefined,
  progress: undefined as number | undefined,
  noteId: undefined as number | undefined,
  summary: '',
  date: new Date().toISOString().split('T')[0],
});

// AI摘要生成相关变量
const summaryLoading = ref(false);
const summaryError = ref('');

const fetchRecords = async () => {
  loading.value = true;
  try {
    records.value = await getStudyRecords();
  } catch (error) {
    console.error('获取学习记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    if (editingRecord.value) {
      await updateStudyRecord(editingRecord.value.id, form.value);
    } else {
      await createStudyRecord(form.value);
    }
    await fetchRecords();
    await checkinStore.fetchTodayStatus();
    resetForm();
  } catch (error) {
    console.error('保存学习记录失败:', error);
  }
};

// AI生成学习摘要
const generateSummary = async () => {
  if (!form.value.content.trim()) {
    summaryError.value = '请输入学习内容';
    return;
  }

  summaryLoading.value = true;
  summaryError.value = '';

  try {
    const summary = await generateStudySummary(
      form.value.content,
      form.value.type === 'study' ? '学习内容' : '阅读内容',
      form.value.type
    );

    form.value.summary = summary;
  } catch (error: any) {
    summaryError.value = error.message || '摘要生成失败，请手动输入';
    console.error('AI摘要生成失败:', error);
  } finally {
    summaryLoading.value = false;
  }
};

const handleEdit = (record: StudyRecord) => {
  editingRecord.value = record;
  form.value = {
    type: record.type,
    content: record.content,
    duration: record.duration,
    pages: record.pages,
    progress: record.progress,
    noteId: record.noteId,
    summary: record.summary || '',
    date: record.date.split('T')[0],
  };
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('确定删除这条记录吗？')) return;
  try {
    await deleteStudyRecord(id);
    await fetchRecords();
    await checkinStore.fetchTodayStatus();
  } catch (error) {
    console.error('删除学习记录失败:', error);
  }
};

const resetForm = () => {
  editingRecord.value = null;
  form.value = {
    type: 'study',
    content: '',
    duration: 30,
    pages: undefined,
    progress: undefined,
    noteId: undefined,
    summary: '',
    date: new Date().toISOString().split('T')[0],
  };
  showForm.value = false;
};

onMounted(() => {
  fetchRecords();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- 标题和操作按钮 -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">学习阅读</h2>
      <Button @click="showForm = !showForm">
        {{ showForm ? '取消' : '新增记录' }}
      </Button>
    </div>

    <!-- 表单 -->
    <Card v-if="showForm">
      <CardHeader>
        <CardTitle>{{ editingRecord ? '编辑记录' : '新增记录' }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="type">类型</Label>
              <select
                id="type"
                v-model="form.type"
                class="w-full px-3 py-2 border rounded-md"
              >
                <option value="study">学习</option>
                <option value="read">阅读</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label for="duration">时长（分钟）</Label>
              <Input
                id="duration"
                v-model.number="form.duration"
                type="number"
                min="1"
                required
                placeholder="30"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="content">内容/书名</Label>
            <Textarea
              id="content"
              v-model="form.content"
              required
              placeholder="学习内容或书籍名称（输入详细内容以便AI生成更好的摘要）"
              rows="2"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="pages">页数</Label>
              <Input
                id="pages"
                v-model.number="form.pages"
                type="number"
                min="1"
                placeholder="可选"
              />
            </div>
            <div class="space-y-2">
              <Label for="progress">进度（%）</Label>
              <Input
                id="progress"
                v-model.number="form.progress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="可选"
              />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="summary">摘要</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="generateSummary"
                :disabled="summaryLoading || !form.content.trim()"
              >
                <span v-if="summaryLoading">生成中...</span>
                <span v-else>AI生成摘要</span>
              </Button>
            </div>
            <Textarea
              id="summary"
              v-model="form.summary"
              placeholder="学习摘要或心得（可手动输入或使用AI生成）"
              rows="3"
            />
            <div v-if="summaryError" class="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {{ summaryError }}
            </div>
          </div>
          <div class="space-y-2">
            <Label for="date">日期</Label>
            <Input
              id="date"
              v-model="form.date"
              type="date"
              required
            />
          </div>
          <div class="flex space-x-2">
            <Button type="submit">
              {{ editingRecord ? '更新' : '保存' }}
            </Button>
            <Button type="button" variant="outline" @click="resetForm">
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- 记录列表 -->
    <Card>
      <CardHeader>
        <CardTitle>记录列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-4">加载中...</div>
        <div v-else-if="records.length === 0" class="text-center py-4 text-muted-foreground">
          暂无记录
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="record in records"
            :key="record.id"
            class="flex items-center justify-between p-4 border rounded-lg"
          >
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="record.type === 'study' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
                >
                  {{ record.type === 'study' ? '学习' : '阅读' }}
                </span>
                <span class="font-medium">{{ record.content }}</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ new Date(record.date).toLocaleDateString() }}
                · {{ record.duration }}分钟
                <template v-if="record.pages">
                  · {{ record.pages }}页
                </template>
                <template v-if="record.progress">
                  · {{ record.progress }}%进度
                </template>
              </div>
              <div v-if="record.summary" class="text-sm text-muted-foreground">
                {{ record.summary }}
              </div>
              <div v-if="record.note" class="text-sm text-muted-foreground">
                关联笔记：{{ record.note.title }}
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="ghost" size="sm" @click="handleEdit(record)">
                编辑
              </Button>
              <Button variant="ghost" size="sm" @click="handleDelete(record.id)">
                删除
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>