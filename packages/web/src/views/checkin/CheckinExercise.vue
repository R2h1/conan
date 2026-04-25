<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ExerciseRecord } from '@/api/checkin-exercise';
import { getExerciseRecords, createExerciseRecord, updateExerciseRecord, deleteExerciseRecord } from '@/api/checkin-exercise';
import { getExerciseRecommendation } from '@/api/checkin-ai';
import { useCheckinStore } from '@/stores/checkin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const records = ref<ExerciseRecord[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editingRecord = ref<ExerciseRecord | null>(null);
const checkinStore = useCheckinStore();

const form = ref({
  type: '',
  duration: 30,
  distance: undefined as number | undefined,
  calories: undefined as number | undefined,
  heartRate: undefined as number | undefined,
  note: '',
  date: new Date().toISOString().split('T')[0],
});

// AI运动推荐相关变量
const recommendationLoading = ref(false);
const exerciseRecommendation = ref('');
const showRecommendation = ref(false);

const fetchRecords = async () => {
  loading.value = true;
  try {
    records.value = await getExerciseRecords();
  } catch (error) {
    console.error('获取运动记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    if (editingRecord.value) {
      await updateExerciseRecord(editingRecord.value.id, form.value);
    } else {
      await createExerciseRecord(form.value);
    }
    await fetchRecords();
    await checkinStore.fetchTodayStatus();
    resetForm();
  } catch (error) {
    console.error('保存运动记录失败:', error);
  }
};

// 获取AI运动推荐
const fetchExerciseRecommendation = async () => {
  recommendationLoading.value = true;
  exerciseRecommendation.value = '';
  showRecommendation.value = true;

  try {
    const recommendation = await getExerciseRecommendation();
    exerciseRecommendation.value = recommendation;
  } catch (error) {
    console.error('获取运动推荐失败:', error);
    exerciseRecommendation.value = '运动推荐生成失败，请稍后重试。';
  } finally {
    recommendationLoading.value = false;
  }
};

// 简单的Markdown格式化
const formatMarkdown = (text: string) => {
  if (!text) return '';

  // 简单的Markdown转HTML
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li.*?>)/g, '<ul class="list-disc ml-6 my-2">$1')
    .replace(/(<\/li>)/g, '$1</ul>')
    .replace(/\n/g, '<br>');
};

const handleEdit = (record: ExerciseRecord) => {
  editingRecord.value = record;
  form.value = {
    type: record.type,
    duration: record.duration,
    distance: record.distance,
    calories: record.calories,
    heartRate: record.heartRate,
    note: record.note || '',
    date: record.date.split('T')[0],
  };
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('确定删除这条记录吗？')) return;
  try {
    await deleteExerciseRecord(id);
    await fetchRecords();
    await checkinStore.fetchTodayStatus();
  } catch (error) {
    console.error('删除运动记录失败:', error);
  }
};

const resetForm = () => {
  editingRecord.value = null;
  form.value = {
    type: '',
    duration: 30,
    distance: undefined,
    calories: undefined,
    heartRate: undefined,
    note: '',
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
      <h2 class="text-2xl font-bold">运动记录</h2>
      <div class="flex items-center space-x-2">
        <Button @click="fetchExerciseRecommendation" :disabled="recommendationLoading">
          <span v-if="recommendationLoading">生成中...</span>
          <span v-else>运动推荐</span>
        </Button>
        <Button @click="showForm = !showForm">
          {{ showForm ? '取消' : '新增记录' }}
        </Button>
      </div>
    </div>

    <!-- AI运动推荐 -->
    <Card v-if="showRecommendation">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>运动推荐</CardTitle>
          <Button
            @click="showRecommendation = false"
            variant="ghost"
            size="sm"
          >
            关闭
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="recommendationLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-2 text-sm text-muted-foreground">正在生成运动推荐...</p>
        </div>
        <div v-else-if="exerciseRecommendation" class="prose prose-sm max-w-none">
          <div v-html="formatMarkdown(exerciseRecommendation)"></div>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground">
          <p>运动推荐生成失败，请稍后重试。</p>
        </div>
      </CardContent>
    </Card>

    <!-- 表单 -->
    <Card v-if="showForm">
      <CardHeader>
        <CardTitle>{{ editingRecord ? '编辑记录' : '新增记录' }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="type">运动类型</Label>
              <Input
                id="type"
                v-model="form.type"
                required
                placeholder="跑步、游泳、健身等"
              />
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
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="distance">距离（公里）</Label>
              <Input
                id="distance"
                v-model.number="form.distance"
                type="number"
                step="0.1"
                placeholder="可选"
              />
            </div>
            <div class="space-y-2">
              <Label for="calories">卡路里（大卡）</Label>
              <Input
                id="calories"
                v-model.number="form.calories"
                type="number"
                placeholder="可选"
              />
            </div>
            <div class="space-y-2">
              <Label for="heartRate">心率（BPM）</Label>
              <Input
                id="heartRate"
                v-model.number="form.heartRate"
                type="number"
                placeholder="可选"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="note">备注</Label>
            <Input
              id="note"
              v-model="form.note"
              placeholder="可选备注"
            />
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
                <span class="font-medium">{{ record.type }}</span>
                <span class="text-sm text-muted-foreground">
                  {{ record.duration }}分钟
                </span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ new Date(record.date).toLocaleDateString() }}
                <template v-if="record.distance">
                  · {{ record.distance }}公里
                </template>
                <template v-if="record.calories">
                  · {{ record.calories }}大卡
                </template>
                <template v-if="record.heartRate">
                  · {{ record.heartRate }}BPM
                </template>
              </div>
              <div v-if="record.note" class="text-sm text-muted-foreground">
                {{ record.note }}
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