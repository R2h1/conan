<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { FinanceRecord } from '@/api/checkin-finance';
import { getFinanceRecords, createFinanceRecord, updateFinanceRecord, deleteFinanceRecord } from '@/api/checkin-finance';
import { parseFinanceText } from '@/api/checkin-ai';
import { useCheckinStore } from '@/stores/checkin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const records = ref<FinanceRecord[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editingRecord = ref<FinanceRecord | null>(null);
const checkinStore = useCheckinStore();

const form = ref({
  type: 'expense',
  amount: 0,
  category: '',
  account: '',
  note: '',
  tags: [] as string[],
  date: new Date().toISOString().split('T')[0],
});

// AI解析相关变量
const aiText = ref('');
const aiParsing = ref(false);
const aiError = ref('');

const fetchRecords = async () => {
  loading.value = true;
  try {
    records.value = await getFinanceRecords();
  } catch (error) {
    console.error('获取财务记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    if (editingRecord.value) {
      await updateFinanceRecord(editingRecord.value.id, form.value);
    } else {
      await createFinanceRecord(form.value);
    }
    await fetchRecords();
    await checkinStore.fetchTodayStatus();
    resetForm();
  } catch (error) {
    console.error('保存财务记录失败:', error);
  }
};

// AI智能解析记账文本
const parseWithAI = async () => {
  if (!aiText.value.trim()) {
    aiError.value = '请输入记账文本';
    return;
  }

  aiParsing.value = true;
  aiError.value = '';

  try {
    const result = await parseFinanceText(aiText.value);

    // 将解析结果填充到表单
    form.value.type = result.type;
    form.value.amount = result.amount;
    form.value.category = result.category;
    form.value.account = result.account;
    form.value.note = result.note || '';
    form.value.date = result.date || new Date().toISOString().split('T')[0];

    // 清空AI输入文本
    aiText.value = '';

    // 显示表单（如果当前未显示）
    if (!showForm.value) {
      showForm.value = true;
    }

    // 滚动到表单
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  } catch (error: any) {
    aiError.value = error.message || '解析失败，请手动输入';
    console.error('AI解析失败:', error);
  } finally {
    aiParsing.value = false;
  }
};

const handleEdit = (record: FinanceRecord) => {
  editingRecord.value = record;
  form.value = {
    type: record.type,
    amount: record.amount,
    category: record.category,
    account: record.account,
    note: record.note || '',
    tags: record.tags || [],
    date: record.date.split('T')[0],
  };
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('确定删除这条记录吗？')) return;
  try {
    await deleteFinanceRecord(id);
    await fetchRecords();
    await checkinStore.fetchTodayStatus();
  } catch (error) {
    console.error('删除财务记录失败:', error);
  }
};

const resetForm = () => {
  editingRecord.value = null;
  form.value = {
    type: 'expense',
    amount: 0,
    category: '',
    account: '',
    note: '',
    tags: [],
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
      <h2 class="text-2xl font-bold">财务记账</h2>
      <Button @click="showForm = !showForm">
        {{ showForm ? '取消' : '新增记录' }}
      </Button>
    </div>

    <!-- AI智能解析 -->
    <Card>
      <CardHeader>
        <CardTitle>AI智能解析</CardTitle>
        <p class="text-sm text-muted-foreground">输入自然语言记账文本，自动解析为结构化数据</p>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="ai-text">记账文本</Label>
            <Textarea
              id="ai-text"
              v-model="aiText"
              placeholder="例如：今天午餐用支付宝花了35元、收到工资转账5000元到银行卡"
              rows="2"
            />
            <p class="text-xs text-muted-foreground">
              支持中文自然语言描述，如金额、分类、账户等信息
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <Button
              @click="parseWithAI"
              :disabled="aiParsing || !aiText.trim()"
            >
              <span v-if="aiParsing">解析中...</span>
              <span v-else>智能解析</span>
            </Button>
            <Button
              variant="outline"
              @click="aiText = ''"
              :disabled="!aiText.trim()"
            >
              清空
            </Button>
          </div>
          <div v-if="aiError" class="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {{ aiError }}
          </div>
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
              <Label for="type">类型</Label>
              <select
                id="type"
                v-model="form.type"
                class="w-full px-3 py-2 border rounded-md"
              >
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label for="amount">金额</Label>
              <Input
                id="amount"
                v-model.number="form.amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="category">分类</Label>
              <Input
                id="category"
                v-model="form.category"
                required
                placeholder="餐饮、交通等"
              />
            </div>
            <div class="space-y-2">
              <Label for="account">账户</Label>
              <Input
                id="account"
                v-model="form.account"
                required
                placeholder="支付宝、微信等"
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
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ record.type === 'income' ? '收入' : '支出' }}
                </span>
                <span class="font-medium">{{ record.category }}</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ record.account }} · {{ new Date(record.date).toLocaleDateString() }}
              </div>
              <div v-if="record.note" class="text-sm text-muted-foreground">
                {{ record.note }}
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="font-bold" :class="record.type === 'income' ? 'text-green-600' : 'text-red-600'">
                {{ record.type === 'income' ? '+' : '-' }}{{ record.amount.toFixed(2) }}
              </span>
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