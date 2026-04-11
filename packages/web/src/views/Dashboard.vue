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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BookOpen,
  Lightbulb,
  Activity,
  Wrench,
  FilePlus,
  Sparkles,
  Save,
} from 'lucide-vue-next';
import StatCard from '@/components/dashboard/StatCard.vue';
import QuickActions from '@/components/dashboard/QuickActions.vue';
import RecentActivity from '@/components/dashboard/RecentActivity.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const router = useRouter();

// 模拟统计数据（实际应从 API 获取）
const stats = ref({
  notes: 12,
  ideas: 8,
  weekVisits: 24,
  toolUses: 15,
});

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

// 最近访问（模拟数据）
const recentItems = ref([
  {
    id: '1',
    title: 'Vue 3 组合式 API 笔记',
    description: '知识库 • 2 小时前',
    icon: BookOpen,
    time: '2 小时前',
  },
  {
    id: '2',
    title: '项目灵感收集',
    description: '灵感箱 • 昨天',
    icon: Lightbulb,
    time: '1 天前',
  },
  {
    id: '3',
    title: 'JSON 格式化',
    description: '工具集 • 2 天前',
    icon: Wrench,
    time: '2 天前',
  },
]);

// 快速记录
const quickNote = ref('');
const quickTags = ref('');

const handleRecentClick = (item: typeof recentItems.value[0]) => {
  // 根据类型跳转到对应页面
  if (item.description.includes('知识库')) {
    router.push('/app/notes');
  } else if (item.description.includes('灵感箱')) {
    router.push('/app/ideas');
  } else if (item.description.includes('工具集')) {
    router.push('/app/tools');
  }
};

const handleQuickSave = () => {
  // TODO: 实现快速保存功能
  console.log('Quick save:', quickNote.value, quickTags.value);
  quickNote.value = '';
  quickTags.value = '';
};
</script>
