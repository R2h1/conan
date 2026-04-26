<template>
  <div class="animate-fade-in">
    <!-- 顶部区域：个性化欢迎语和关键统计 -->
    <div class="mb-8">
      <!-- 个性化欢迎语 -->
      <div class="mb-6">
        <h1 class="text-4xl font-bold text-gradient mb-2">{{ greetingMessage }}</h1>
        <p class="text-lg text-muted-foreground">{{ enhancedPersonalizedMessage }}</p>
      </div>

      <!-- 关键统计数据 - 不对称网格布局 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="md:col-span-1">
          <StatCard
            label="笔记总数"
            :value="stats.notes"
            :icon="BookOpen"
            :trend="12"
            color="primary"
            variant="accent"
            :progress="65"
            description="本月新增 12 篇"
          />
        </div>
        <div class="md:col-span-1">
          <StatCard
            label="灵感记录"
            :value="stats.ideas"
            :icon="Lightbulb"
            :trend="5"
            color="warm"
            variant="gradient"
            :progress="45"
            description="本周新增 5 条"
          />
        </div>
        <div class="md:col-span-1">
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
        <div class="md:col-span-1">
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

    <!-- 中部区域：重要功能入口和热门标签 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 快捷操作 - 视觉焦点区域 -->
      <div class="lg:col-span-2">
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

      <!-- 热门标签云 -->
      <div v-if="popularTags.length" class="lg:col-span-1">
        <div class="card p-6 h-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">热门标签</h3>
            <Button
              variant="ghost"
              size="sm"
              class="text-xs"
              @click="router.push('/app/tags')"
            >
              查看全部
            </Button>
          </div>
          <TagCloud
            :tags="popularTags"
            :max-font-size="20"
            :min-font-size="12"
            color-scheme="frequency"
            @click="handleTagClick"
          />
          <div class="mt-4 text-sm text-muted-foreground">
            <span>点击标签查看相关内容</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部区域：最近活动和快速记录 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <Button variant="outline" size="sm" @click="router.push('/app/notes')">
            开始探索
          </Button>
        </div>
      </div>

      <!-- 快速记录 -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">快速记录</h3>
          <Button
            variant="ghost"
            size="sm"
            @click="clearQuickNote"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
        <div class="space-y-4">
          <Textarea
            v-model="quickNote"
            placeholder="有什么想法、待办或链接想要记录？"
            rows="4"
            class="resize-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div class="flex items-center justify-between">
            <Input
              v-model="quickTags"
              placeholder="标签（逗号分隔）"
              class="max-w-[200px] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button
              @click="handleQuickSave"
              :disabled="!quickNote.trim()"
              class="transition-all duration-200 hover:scale-105"
            >
              <Save class="h-4 w-4 mr-1" />
              保存
            </Button>
          </div>
          <div class="text-xs text-muted-foreground flex items-center gap-1">
            <Info class="h-3 w-3" />
            支持 Markdown 语法
          </div>
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
import { createNote } from '@/api/notes';
import { getRecentActivities } from '@/api/activities';
import { getPopularTags } from '@/api/tags';
import type { TagCloudItem } from '@/api/tags';
import {
  BookOpen,
  Lightbulb,
  Activity,
  Wrench,
  FilePlus,
  Sparkles,
  Save,
  LayoutDashboard,
  RefreshCw,
  X,
  Info,
  Calendar,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-vue-next';
import StatCard from '@/components/dashboard/StatCard.vue';
import QuickActions from '@/components/dashboard/QuickActions.vue';
import RecentActivity from '@/components/dashboard/RecentActivity.vue';
import TagCloud from '@/components/tags/TagCloud.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
    '使用快捷键 Ctrl+K 可以快速搜索笔记和工具。',
    '尝试给笔记添加标签，方便后续查找和整理。',
    '快速记录功能支持 Markdown 语法，试试看！',
    '点击统计卡片可以查看详细的数据趋势。',
    '深色模式可以在主题设置中切换，保护眼睛。',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
});

// 统计数据
const stats = ref({
  notes: 0,
  ideas: 0,
  weekVisits: 0,
  toolUses: 0,
});

// 加载统计数据
const loadStats = async () => {
  try {
    const data = await getStats();
    stats.value = {
      notes: data.notes,
      ideas: data.ideas,
      weekVisits: data.weekNotes,
      toolUses: data.toolUses,
    };
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};

// 热门标签
const popularTags = ref<TagCloudItem[]>([]);

// 加载热门标签
const loadPopularTags = async () => {
  try {
    const tags = await getPopularTags();
    popularTags.value = tags;
  } catch (error) {
    console.error('Failed to load popular tags:', error);
  }
};

// 快捷操作
const quickActions = [
  {
    label: '新建笔记',
    description: '创建新的 Markdown 笔记',
    href: '/app/notes',
    icon: FilePlus,
    color: 'primary',
  },
  {
    label: '记录灵感',
    description: '快速捕捉灵感',
    href: '/app/ideas',
    icon: Sparkles,
    color: 'warm',
  },
  {
    label: '工具集',
    description: '实用开发工具',
    href: '/app/tools',
    icon: Wrench,
    color: 'secondary',
  },
  {
    label: '打卡记录',
    description: '查看今日打卡',
    href: '/app/checkin',
    icon: Calendar,
    color: 'accent',
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
    note: BookOpen,
    idea: Lightbulb,
    tool: Wrench,
    checkin: Calendar,
  };
  return iconMap[type] || BookOpen;
};

// 快速记录
const quickNote = ref('');
const quickTags = ref('');

// 清空快速记录
const clearQuickNote = () => {
  quickNote.value = '';
  quickTags.value = '';
  toast({
    title: '已清空',
    description: '快速记录内容已清空',
  });
};

// 标签点击处理
const handleTagClick = (tag: TagCloudItem) => {
  if (tag.type === 'note' || tag.type === 'both') {
    router.push(`/app/notes?tag=${encodeURIComponent(tag.name)}`);
  } else if (tag.type === 'idea') {
    router.push(`/app/ideas?tag=${encodeURIComponent(tag.name)}`);
  }
};

const handleRecentClick = (item: typeof recentItems.value[0]) => {
  if (item.type === 'note' || item.description.includes('知识库')) {
    router.push('/app/notes');
  } else if (item.type === 'idea' || item.description.includes('灵感箱')) {
    router.push('/app/ideas');
  } else if (item.type === 'tool' || item.description.includes('工具集')) {
    router.push('/app/tools');
  } else if (item.type === 'checkin' || item.description.includes('打卡')) {
    router.push('/app/checkin');
  } else if (item.type === 'dashboard') {
    router.push('/app');
  }
};

const handleQuickSave = async () => {
  try {
    const tags = quickTags.value ? quickTags.value.split(',').map((t: string) => t.trim()) : [];
    await createNote({
      title: '快速记录',
      content: quickNote.value,
      tags,
    });
    toast({
      title: '快速记录已保存',
      description: '内容已保存到笔记',
    });
    quickNote.value = '';
    quickTags.value = '';
    // 重新加载统计数据
    await loadStats();
  } catch (error) {
    toast({
      title: '保存失败',
      description: '请稍后重试',
      variant: 'destructive',
    });
  }
};

// 用户习惯学习功能
const USER_HABITS_KEY = 'conan-user-habits';

// 初始化用户习惯数据
const userHabits = ref({
  visitCount: 0,
  lastVisit: '',
  favoriteFeatures: {
    notes: 0,
    ideas: 0,
    tools: 0,
    checkin: 0,
  },
  usagePatterns: {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  },
  recentActions: [] as string[],
});

// 加载用户习惯
const loadUserHabits = () => {
  try {
    const saved = localStorage.getItem(USER_HABITS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      userHabits.value = { ...userHabits.value, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load user habits:', error);
  }
};

// 保存用户习惯
const saveUserHabits = () => {
  try {
    localStorage.setItem(USER_HABITS_KEY, JSON.stringify(userHabits.value));
  } catch (error) {
    console.error('Failed to save user habits:', error);
  }
};

// 更新访问统计
const updateVisitStats = () => {
  const now = new Date();
  const hour = now.getHours();

  // 更新访问次数
  userHabits.value.visitCount += 1;
  userHabits.value.lastVisit = now.toISOString();

  // 更新使用时段模式
  if (hour < 6) {
    userHabits.value.usagePatterns.night += 1;
  } else if (hour < 12) {
    userHabits.value.usagePatterns.morning += 1;
  } else if (hour < 18) {
    userHabits.value.usagePatterns.afternoon += 1;
  } else {
    userHabits.value.usagePatterns.evening += 1;
  }

  saveUserHabits();
};

// 记录功能使用
const recordFeatureUse = (feature: 'notes' | 'ideas' | 'tools' | 'checkin') => {
  userHabits.value.favoriteFeatures[feature] += 1;
  userHabits.value.recentActions.unshift(`${feature}-${Date.now()}`);
  // 只保留最近10个动作
  userHabits.value.recentActions = userHabits.value.recentActions.slice(0, 10);
  saveUserHabits();
};

// 获取最常用的功能
const mostUsedFeature = computed(() => {
  const features = userHabits.value.favoriteFeatures;
  const entries = Object.entries(features) as [keyof typeof features, number][];
  if (entries.length === 0) return null;

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
});

// 获取个性化推荐
const personalizedRecommendation = computed(() => {
  const feature = mostUsedFeature.value;
  const hour = new Date().getHours();

  if (!feature) {
    return '尝试创建你的第一篇笔记，开始记录生活和工作吧！';
  }

  const recommendations: Record<string, string> = {
    notes: hour < 12
      ? '早上是整理笔记的好时机，试试清理一下旧笔记？'
      : '今天有什么新的想法需要记录下来吗？',
    ideas: '灵感稍纵即逝，现在有什么创意想要捕捉吗？',
    tools: '需要处理一些数据吗？试试JSON格式化工具。',
    checkin: '记得完成今日打卡，保持好习惯！',
  };

  return recommendations[feature] || '继续探索Conan的更多功能吧！';
});

// 获取用户活跃时段
const activeTimePeriod = computed(() => {
  const patterns = userHabits.value.usagePatterns;
  const entries = Object.entries(patterns) as [keyof typeof patterns, number][];
  if (entries.length === 0) return '未知';

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const period = sorted[0][0];

  const periodNames: Record<string, string> = {
    morning: '早晨',
    afternoon: '下午',
    evening: '晚上',
    night: '深夜',
  };

  return periodNames[period] || '未知';
});

// 增强的个性化消息
const enhancedPersonalizedMessage = computed(() => {
  const baseMessage = personalizedMessage.value;
  const recommendation = personalizedRecommendation.value;
  const visitCount = userHabits.value.visitCount;

  if (visitCount < 3) {
    return `${baseMessage} ${recommendation}`;
  }

  const period = activeTimePeriod.value;
  return `${baseMessage} 我发现你通常在${period}时段最活跃。${recommendation}`;
});

// 修改handleRecentClick以记录功能使用
const enhancedHandleRecentClick = (item: typeof recentItems.value[0]) => {
  // 记录功能使用
  if (item.type === 'note' || item.description.includes('知识库')) {
    recordFeatureUse('notes');
    router.push('/app/notes');
  } else if (item.type === 'idea' || item.description.includes('灵感箱')) {
    recordFeatureUse('ideas');
    router.push('/app/ideas');
  } else if (item.type === 'tool' || item.description.includes('工具集')) {
    recordFeatureUse('tools');
    router.push('/app/tools');
  } else if (item.type === 'checkin' || item.description.includes('打卡')) {
    recordFeatureUse('checkin');
    router.push('/app/checkin');
  } else if (item.type === 'dashboard') {
    router.push('/app');
  }
};

onMounted(() => {
  // 加载用户习惯
  loadUserHabits();
  // 更新访问统计
  updateVisitStats();

  // 加载数据
  loadStats();
  loadPopularTags();
  loadRecentActivities();
});
</script>
