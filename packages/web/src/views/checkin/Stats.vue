<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCheckinOverview, type CheckinOverview } from '@/api/checkin-summary';
import { getDailyBriefing } from '@/api/checkin-ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const loading = ref(false);
const overview = ref<CheckinOverview | null>(null);

// 每日简报相关变量
const briefingLoading = ref(false);
const dailyBriefing = ref('');
const showBriefing = ref(false);

const fetchOverview = async () => {
  loading.value = true;
  try {
    const data = await getCheckinOverview();
    overview.value = data;
  } catch (error) {
    console.error('获取统计概览失败:', error);
    overview.value = null;
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

// 获取每日简报
const fetchDailyBriefing = async () => {
  briefingLoading.value = true;
  dailyBriefing.value = '';
  showBriefing.value = true;

  try {
    const briefing = await getDailyBriefing();
    dailyBriefing.value = briefing;
  } catch (error) {
    console.error('获取每日简报失败:', error);
    dailyBriefing.value = '简报生成失败，请稍后重试。';
  } finally {
    briefingLoading.value = false;
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


onMounted(() => {
  fetchOverview();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- 标题和操作按钮 -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">统计概览</h2>
      <div class="flex items-center space-x-2">
        <Button @click="fetchDailyBriefing" :disabled="briefingLoading">
          <span v-if="briefingLoading">生成中...</span>
          <span v-else>生成简报</span>
        </Button>
        <Button variant="outline" @click="fetchOverview">
          刷新数据
        </Button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">加载中...</div>

    <div v-else-if="overview">
      <!-- 总体统计 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              连续打卡
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ overview.summary.currentStreak }}天
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              最长 {{ overview.summary.maxStreak }}天
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              财务记账
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ overview.summary.financeDays }}天
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              收入 {{ formatCurrency(overview.finance.totalIncome) }}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              运动记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ overview.summary.exerciseDays }}天
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ formatDuration(overview.exercise.totalDuration) }}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              学习阅读
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ overview.summary.studyDays }}天
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ overview.study.totalPages }}页
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- 每日简报 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>每日简报</CardTitle>
            <Button
              @click="fetchDailyBriefing"
              :disabled="briefingLoading"
              variant="outline"
              size="sm"
            >
              <span v-if="briefingLoading">生成中...</span>
              <span v-else>生成简报</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="briefingLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p class="mt-2 text-sm text-muted-foreground">正在生成每日简报...</p>
          </div>
          <div v-else-if="showBriefing && dailyBriefing">
            <div class="prose prose-sm max-w-none" v-html="formatMarkdown(dailyBriefing)"></div>
            <div class="mt-4 pt-4 border-t">
              <p class="text-xs text-muted-foreground">
                📅 基于您的打卡数据和当前时间生成的个性化建议
              </p>
            </div>
          </div>
          <div v-else class="text-center py-8 text-muted-foreground">
            <div class="mb-2">📋 每日简报</div>
            <p class="text-sm">点击"生成简报"按钮获取个性化建议</p>
            <p class="text-xs mt-2">包含天气建议、健康提醒、财务小贴士等</p>
          </div>
        </CardContent>
      </Card>

      <!-- 财务统计 -->
      <Card>
        <CardHeader>
          <CardTitle>财务统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium mb-2">收支概览</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>总收入</span>
                  <span class="font-medium text-green-600">
                    +{{ formatCurrency(overview.finance.totalIncome) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>总支出</span>
                  <span class="font-medium text-red-600">
                    -{{ formatCurrency(overview.finance.totalExpense) }}
                  </span>
                </div>
                <div class="flex justify-between border-t pt-2">
                  <span>净余额</span>
                  <span class="font-bold">
                    {{ formatCurrency(overview.finance.totalIncome - overview.finance.totalExpense) }}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium mb-2">主要分类</h3>
              <div v-if="Object.keys(overview.finance.categoryBreakdown).length === 0"
                class="text-sm text-muted-foreground">
                暂无数据
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="(amount, category) in overview.finance.categoryBreakdown"
                  :key="category"
                  class="flex justify-between"
                >
                  <span>{{ category }}</span>
                  <span :class="amount >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(amount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 图表占位符 -->
          <div class="mt-4 pt-4 border-t">
            <div class="text-center py-8 border rounded-lg bg-gray-50 text-muted-foreground">
              <div class="mb-2">📊 财务图表</div>
              <div class="text-sm">安装图表库后显示收支趋势和分类饼图</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 运动统计 -->
      <Card>
        <CardHeader>
          <CardTitle>运动统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium mb-2">总体数据</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>总时长</span>
                  <span class="font-medium">
                    {{ formatDuration(overview.exercise.totalDuration) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>总距离</span>
                  <span class="font-medium">
                    {{ overview.exercise.totalDistance.toFixed(1) }}公里
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>总卡路里</span>
                  <span class="font-medium">
                    {{ overview.exercise.totalCalories }}大卡
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium mb-2">运动类型</h3>
              <div v-if="Object.keys(overview.exercise.typeBreakdown).length === 0"
                class="text-sm text-muted-foreground">
                暂无数据
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="(stats, type) in overview.exercise.typeBreakdown"
                  :key="type"
                  class="flex justify-between"
                >
                  <span>{{ type }}</span>
                  <span class="font-medium">
                    {{ stats.count }}次 · {{ formatDuration(stats.duration) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 图表占位符 -->
          <div class="mt-4 pt-4 border-t">
            <div class="text-center py-8 border rounded-lg bg-gray-50 text-muted-foreground">
              <div class="mb-2">🏃 运动图表</div>
              <div class="text-sm">安装图表库后显示运动趋势和类型分布</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 学习统计 -->
      <Card>
        <CardHeader>
          <CardTitle>学习统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium mb-2">总体数据</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>总时长</span>
                  <span class="font-medium">
                    {{ formatDuration(overview.study.totalDuration) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>总页数</span>
                  <span class="font-medium">
                    {{ overview.study.totalPages }}页
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium mb-2">学习内容</h3>
              <div v-if="Object.keys(overview.study.contentBreakdown).length === 0"
                class="text-sm text-muted-foreground">
                暂无数据
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="(stats, content) in overview.study.contentBreakdown"
                  :key="content"
                  class="flex justify-between"
                >
                  <span>{{ content }}</span>
                  <span class="font-medium">
                    {{ stats.count }}次 · {{ stats.progress.toFixed(1) }}%进度
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 图表占位符 -->
          <div class="mt-4 pt-4 border-t">
            <div class="text-center py-8 border rounded-lg bg-gray-50 text-muted-foreground">
              <div class="mb-2">📚 学习图表</div>
              <div class="text-sm">安装图表库后显示学习趋势和进度分布</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else>
      <Card>
        <CardContent class="text-center py-8 text-muted-foreground">
          暂无统计数据，请先添加打卡记录
        </CardContent>
      </Card>
    </div>
  </div>
</template>