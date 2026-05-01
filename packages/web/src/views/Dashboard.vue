<template>
  <div class="animate-fade-in">
    <!-- 顶部区域：个性化欢迎语和关键统计 -->
    <div class="mb-8">
      <!-- 个性化欢迎语 -->
      <div class="mb-6">
        <h1 class="text-4xl font-bold text-gradient mb-2">{{ greetingMessage }}</h1>
        <p class="text-lg text-muted-foreground">{{ enhancedPersonalizedMessage }}</p>
      </div>

      <!-- 关键统计数据 - 对称布局 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <StatCard
            label="本周访问"
            :value="stats.weekVisits"
            :icon="Activity"
            color="secondary"
            variant="glass"
            :progress="85"
            description="较上周增长 15%"
          />
        </div>
        <div>
          <StatCard
            label="工具使用"
            :value="stats.toolUses"
            :icon="Wrench"
            :trend="-2"
            color="gradient"
            variant="default"
            :progress="30"
            description="较上周减少 2%"
          />
        </div>
      </div>
    </div>

    <!-- 中部区域：重要功能入口 -->
    <div class="mb-8">
      <!-- 快捷操作 - 视觉焦点区域 -->
      <div>
        <div class="card p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold">快速开始</h3>
              <p class="text-muted-foreground mt-1">选择你最需要的功能开始</p>
            </div>
            <div class="animate-pulse-warm text-primary">
              <Sparkles class="h-6 w-6" />
            </div>
          </div>
          <QuickActions :actions="quickActions" />
        </div>
      </div>
    </div>

    <!-- 底部区域：最近活动 -->
    <div>
      <!-- 最近访问 -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">最近访问</h3>
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              @click="refreshRecentActivities"
              :loading="refreshingRecent"
            >
              <RefreshCw class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <RecentActivity
          :items="recentItems"
          @click="enhancedHandleRecentClick"
        />
        <div v-if="!recentItems.length" class="text-center py-8">
          <div class="text-muted-foreground mb-2">暂无最近访问记录</div>
          <Button variant="outline" size="sm" @click="router.push('/app/tools')">
            开始探索
          </Button>
        </div>
      </div>
    </div>

    <!-- 小贴士 -->
    <div class="mt-8 p-4 rounded-lg bg-warm-50 dark:bg-warm-800/20 border border-warm-200 dark:border-warm-800">
      <div class="flex items-start gap-3">
        <Lightbulb class="h-5 w-5 text-warm-600 dark:text-warm-400 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-warm-800 dark:text-warm-400">小贴士</p>
          <p class="text-sm text-warm-600 dark:text-warm-400 mt-1">{{ dailyTip }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/components/ui/toast';
import { getStats } from '@/api/stats';
import { getRecentActivities } from '@/api/activities';
import {
  Lightbulb,
  Activity,
  Wrench,
  Sparkles,
  LayoutDashboard,
  RefreshCw,
} from 'lucide-vue-next';
import StatCard from '@/components/dashboard/StatCard.vue';
import QuickActions from '@/components/dashboard/QuickActions.vue';
import RecentActivity from '@/components/dashboard/RecentActivity.vue';
import { Button } from '@/components/ui/button';

const router = useRouter();
const { toast } = useToast();

// 个性化欢迎语
const greetingMessage = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了，还在努力吗？';
  if (hour < 12) return '早上好！今天也要充满活力！';
  if (hour < 18) return '下午好！工作学习还顺利吗？';
  return '晚上好！今天过得怎么样？';
});

const personalizedMessage = computed(() => {
  const messages = [
    'Conan 在这里为你提供温暖友好的数字体验。',
    '发现新功能，记录灵感，让每一天都充满创造力。',
    '你的数字伙伴已就位，随时为你提供帮助。',
    '温暖友好的界面，只为给你更好的使用体验。',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
});

// 每日小贴士
const dailyTip = computed(() => {
  const tips = [
    '使用快捷键 Ctrl+K 可以快速搜索工具。',
    '点击统计卡片可以查看详细的数据趋势。',
    '深色模式可以在主题设置中切换，保护眼睛。',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
});

// 统计数据
const stats = ref({
  weekVisits: 0,
  toolUses: 0,
});

// 加载统计数据
const loadStats = async () => {
  try {
    const data = await getStats();
    stats.value = {
      weekVisits: data.weekNotes,
      toolUses: data.toolUses,
    };
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};


// 快捷操作
const quickActions: Array<{
  label: string;
  description: string;
  href: string;
  icon: any;
  color: 'primary' | 'warm' | 'secondary' | 'accent';
}> = [
  {
    label: '工具集',
    description: '实用开发工具',
    href: '/app/tools',
    icon: Wrench,
    color: 'primary',
  },
];

// 最近访问（从API获取）
const recentItems = ref<Array<{
  id: string;
  title: string;
  description: string;
  icon: any;
  time: string;
  type: string;
}>>([]);

const refreshingRecent = ref(false);

// 加载最近访问记录
const loadRecentActivities = async () => {
  try {
    const activities = await getRecentActivities();
    recentItems.value = activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      icon: getIconForActivity(activity.type),
      time: activity.time,
      type: activity.type,
    }));
  } catch (error) {
    console.error('Failed to load recent activities:', error);
    recentItems.value = [];
  }
};

// 刷新最近访问记录
const refreshRecentActivities = async () => {
  refreshingRecent.value = true;
  try {
    await loadRecentActivities();
    toast({
      title: '已刷新',
      description: '最近访问记录已更新',
    });
  } catch (error) {
    console.error('Failed to refresh recent activities:', error);
  } finally {
    refreshingRecent.value = false;
  }
};

// 根据活动类型获取图标组件
const getIconForActivity = (type: string) => {
  const iconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    tool: Wrench,
  };
  return iconMap[type] || LayoutDashboard;
};

// 标签点击处理（笔记功能已移除，暂时无功能）


// 增强的个性化消息
const enhancedPersonalizedMessage = computed(() => {
  const baseMessage = personalizedMessage.value;
  // 简单的推荐消息
  const recommendations = [
    '试试工具集，提高工作效率！',
    '需要处理数据吗？试试JSON格式化工具。',
    '探索Conan的更多功能吧！',
  ];
  const randomRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
  return `${baseMessage} ${randomRecommendation}`;
});

// 处理最近访问项点击
const enhancedHandleRecentClick = (item: typeof recentItems.value[0]) => {
  if (item.type === 'tool' || item.description.includes('工具集')) {
    router.push('/app/tools');
  } else if (item.type === 'dashboard') {
    router.push('/app');
  }
};

onMounted(() => {
  // 加载数据
  loadStats();
  loadRecentActivities();
});
</script>
