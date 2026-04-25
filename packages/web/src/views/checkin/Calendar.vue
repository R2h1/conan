<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCalendarData, type CalendarDay } from '@/api/checkin-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const loading = ref(false);
const calendarData = ref<CalendarDay[]>([]);
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1); // 1-12

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

const monthName = computed(() => monthNames[currentMonth.value - 1]);
const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value - 1, 1).getDay();
});
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 0).getDate();
});

const calendarGrid = computed(() => {
  const grid = [];
  const totalCells = Math.ceil((firstDayOfMonth.value + daysInMonth.value) / 7) * 7;

  // 填充空白单元格（月历第一天之前的日期）
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    grid.push({
      type: 'empty',
      day: 0,
      date: '',
      hasFinance: false,
      hasExercise: false,
      hasStudy: false,
      isToday: false,
      isWeekend: false,
    });
  }

  // 填充当月日期
  for (let day = 1; day <= daysInMonth.value; day++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = calendarData.value.find(d => d.date === dateStr);

    grid.push({
      type: 'day',
      day,
      ...dayData,
      date: dateStr,
      hasFinance: dayData?.hasFinance || false,
      hasExercise: dayData?.hasExercise || false,
      hasStudy: dayData?.hasStudy || false,
      isToday: dayData?.isToday || false,
      isWeekend: dayData?.isWeekend || false,
    });
  }

  // 填充剩余的空白单元格
  while (grid.length < totalCells) {
    grid.push({
      type: 'empty',
      day: 0,
      date: '',
      hasFinance: false,
      hasExercise: false,
      hasStudy: false,
      isToday: false,
      isWeekend: false,
    });
  }

  // 将网格分成周
  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return weeks;
});

const fetchCalendarData = async () => {
  loading.value = true;
  try {
    const data = await getCalendarData({
      year: currentYear.value.toString(),
      month: currentMonth.value.toString(),
    });
    calendarData.value = data.calendar;
  } catch (error) {
    console.error('获取日历数据失败:', error);
    calendarData.value = [];
  } finally {
    loading.value = false;
  }
};

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  fetchCalendarData();
};

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  fetchCalendarData();
};

const goToToday = () => {
  const now = new Date();
  currentYear.value = now.getFullYear();
  currentMonth.value = now.getMonth() + 1;
  fetchCalendarData();
};

const getDayStatusColor = (day: any) => {
  if (!day.hasFinance && !day.hasExercise && !day.hasStudy) {
    return 'border-gray-200 bg-gray-50';
  }

  const colors = [];
  if (day.hasFinance) colors.push('border-green-200 bg-green-50');
  if (day.hasExercise) colors.push('border-blue-200 bg-blue-50');
  if (day.hasStudy) colors.push('border-purple-200 bg-purple-50');

  // 如果有多个状态，返回复合样式
  if (colors.length > 1) {
    return colors.join(' ');
  }
  return colors[0] || 'border-gray-200 bg-gray-50';
};

const getDayStatusDots = (day: any) => {
  const dots = [];
  if (day.hasFinance) dots.push({ color: 'bg-green-500', tooltip: '财务' });
  if (day.hasExercise) dots.push({ color: 'bg-blue-500', tooltip: '运动' });
  if (day.hasStudy) dots.push({ color: 'bg-purple-500', tooltip: '学习' });
  return dots;
};

onMounted(() => {
  fetchCalendarData();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- 标题和操作按钮 -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">打卡日历</h2>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="prevMonth">
          上个月
        </Button>
        <Button variant="outline" @click="goToToday">
          今天
        </Button>
        <Button variant="outline" @click="nextMonth">
          下个月
        </Button>
      </div>
    </div>

    <!-- 月份选择器 -->
    <Card>
      <CardHeader>
        <CardTitle class="text-center text-xl">
          {{ currentYear }}年 {{ monthName }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <!-- 星期标题 -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div class="text-center font-medium text-muted-foreground py-2">日</div>
          <div class="text-center font-medium text-muted-foreground py-2">一</div>
          <div class="text-center font-medium text-muted-foreground py-2">二</div>
          <div class="text-center font-medium text-muted-foreground py-2">三</div>
          <div class="text-center font-medium text-muted-foreground py-2">四</div>
          <div class="text-center font-medium text-muted-foreground py-2">五</div>
          <div class="text-center font-medium text-muted-foreground py-2">六</div>
        </div>

        <!-- 日历网格 -->
        <div v-if="loading" class="text-center py-8">加载中...</div>
        <div v-else class="grid grid-cols-7 gap-1">
          <div
            v-for="(week, weekIndex) in calendarGrid"
            :key="weekIndex"
            class="contents"
          >
            <div
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="min-h-24 p-2 border rounded-lg transition-colors"
              :class="[
                day.type === 'empty' ? 'bg-gray-50 border-gray-200' : getDayStatusColor(day),
                day.isToday ? 'ring-2 ring-primary' : '',
                day.isWeekend ? 'text-red-600' : ''
              ]"
            >
              <template v-if="day.type === 'day'">
                <div class="flex justify-between items-start mb-1">
                  <span
                    class="font-medium"
                    :class="day.isToday ? 'text-primary' : ''"
                  >
                    {{ day.day }}
                  </span>
                  <div class="flex space-x-1">
                    <div
                      v-for="dot in getDayStatusDots(day)"
                      :key="dot.tooltip"
                      class="w-2 h-2 rounded-full"
                      :class="dot.color"
                      :title="dot.tooltip"
                    />
                  </div>
                </div>

                <!-- 如果有记录，显示简要信息 -->
                <div v-if="day.hasFinance || day.hasExercise || day.hasStudy" class="space-y-1 text-xs">
                  <div v-if="day.hasFinance" class="text-green-600 truncate">💰 财务</div>
                  <div v-if="day.hasExercise" class="text-blue-600 truncate">🏃 运动</div>
                  <div v-if="day.hasStudy" class="text-purple-600 truncate">📚 学习</div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="mt-6 pt-4 border-t">
          <h3 class="text-sm font-medium mb-2">图例</h3>
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <span class="text-sm">财务记账</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span class="text-sm">运动记录</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-purple-500"></div>
              <span class="text-sm">学习阅读</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 border-2 border-primary"></div>
              <span class="text-sm">今天</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>