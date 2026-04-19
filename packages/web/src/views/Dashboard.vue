<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div>
      <h2 class="text-3xl font-bold text-gradient">仪表盘</h2>
      <p class="text-muted-foreground mt-1">欢迎回来，这里是你的数字平台概览。</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="笔记总数"
        :value="stats.notes"
        :icon="BookOpen"
        :trend="12"
      />
      <StatCard
        label="灵感记录"
        :value="stats.ideas"
        :icon="Lightbulb"
        :trend="5"
      />
      <StatCard
        label="本周访问"
        :value="stats.weekVisits"
        :icon="Activity"
      />
      <StatCard
        label="工具使用"
        :value="stats.toolUses"
        :icon="Wrench"
        :trend="-2"
      />
    </div>

    <!-- 标签云 -->
    <div v-if="popularTags.length" class="card p-6">
      <h3 class="text-lg font-semibold mb-4">热门标签</h3>
      <TagCloud
        :tags="popularTags"
        :max-font-size="24"
        :min-font-size="12"
        color-scheme="frequency"
        @click="handleTagClick"
      />
      <div class="mt-4 text-sm text-muted-foreground flex justify-between items-center">
        <span>点击标签查看相关内容</span>
        <Button
          variant="ghost"
          size="sm"
          class="text-xs"
          @click="router.push('/app/tags')"
        >
          查看全部标签
        </Button>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div>
      <h3 class="text-xl font-semibold mb-4">快捷操作</h3>
      <QuickActions :actions="quickActions" />
    </div>

    <!-- 最近访问 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentActivity
        :items="recentItems"
        @click="handleRecentClick"
      />

      <!-- 快速记录 -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold mb-4">快速记录</h3>
        <div class="space-y-4">
          <Textarea
            v-model="quickNote"
            placeholder="快速记录想法、待办或链接..."
            rows="4"
            class="resize-none"
          />
          <div class="flex items-center justify-between">
            <Input
              v-model="quickTags"
              placeholder="标签（逗号分隔）"
              class="max-w-[200px]"
            />
            <Button @click="handleQuickSave" :disabled="!quickNote.trim()">
              <Save class="h-4 w-4 mr-1" />
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  },
  {
    label: '记录灵感',
    description: '快速捕捉灵感',
    href: '/app/ideas',
    icon: Sparkles,
  },
  {
    label: '工具集',
    description: '实用开发工具',
    href: '/app/tools',
    icon: Wrench,
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
    // 如果API失败，使用空数组而不是模拟数据
    recentItems.value = [];
  }
};

// 根据活动类型获取图标组件
const getIconForActivity = (type: string) => {
  const iconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    note: BookOpen,
    idea: Lightbulb,
    tool: Wrench,
  };
  return iconMap[type] || BookOpen;
};

// 快速记录
const quickNote = ref('');
const quickTags = ref('');

// 标签点击处理
const handleTagClick = (tag: TagCloudItem) => {
  // 根据标签类型跳转到对应页面
  if (tag.type === 'note' || tag.type === 'both') {
    router.push(`/app/notes?tag=${encodeURIComponent(tag.name)}`);
  } else if (tag.type === 'idea') {
    router.push(`/app/ideas?tag=${encodeURIComponent(tag.name)}`);
  }
};

const handleRecentClick = (item: typeof recentItems.value[0]) => {
  // 根据活动类型跳转到对应页面
  if (item.type === 'note' || item.description.includes('知识库')) {
    router.push('/app/notes');
  } else if (item.type === 'idea' || item.description.includes('灵感箱')) {
    router.push('/app/ideas');
  } else if (item.type === 'tool' || item.description.includes('工具集')) {
    router.push('/app/tools');
  } else if (item.type === 'dashboard') {
    // 已经在仪表盘页面
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

onMounted(() => {
  loadStats();
  loadPopularTags();
  loadRecentActivities();
});
</script>
