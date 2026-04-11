<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import IdeaList from '@/components/ideas/IdeaList.vue';
import IdeaEditor from '@/components/ideas/IdeaEditor.vue';

interface Idea {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// 模拟数据（实际应从 API 获取）
const ideas = ref<Idea[]>([
  {
    id: 1,
    title: '开发一个时间管理工具',
    content: '结合番茄工作法和任务优先级，帮助用户更高效地完成工作。可以考虑集成到现有平台中。',
    category: '项目',
    tags: ['效率', '工具'],
    priority: 'high',
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: '学习 Vue 3 Composition API',
    content: '深入研究 Vue 3 的组合式 API，理解其设计思想和最佳实践。',
    category: '学习',
    tags: ['Vue', '前端'],
    priority: 'medium',
    completed: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: '周末爬山',
    content: '天气好的时候去爬香山，放松一下心情。',
    category: '生活',
    tags: ['运动', '户外'],
    priority: 'low',
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]);

const view = ref<'grid' | 'list'>('grid');
const showEditor = ref(false);
const currentIdea = ref<Idea | null>(null);
const { toast } = useToast();

const handleCreate = () => {
  currentIdea.value = null;
  showEditor.value = true;
};

const handleSelect = (idea: Idea) => {
  currentIdea.value = idea;
  showEditor.value = true;
};

const handleSave = (data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (currentIdea.value) {
    // 编辑模式
    const index = ideas.value.findIndex(i => i.id === currentIdea.value?.id);
    if (index !== -1) {
      ideas.value[index] = {
        ...ideas.value[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      toast({
        title: '灵感已更新',
        description: '更改已成功保存',
      });
    }
  } else {
    // 新建模式
    const newIdea: Idea = {
      ...data,
      id: Math.max(0, ...ideas.value.map(i => i.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ideas.value.unshift(newIdea);
    toast({
      title: '灵感已创建',
      description: '新灵感创建成功',
    });
  }
  showEditor.value = false;
  currentIdea.value = null;
};

const handleDelete = (idea: Idea) => {
  if (confirm(`确定删除"${idea.title}"吗？`)) {
    ideas.value = ideas.value.filter(i => i.id !== idea.id);
    toast({
      title: '灵感已删除',
      description: `${idea.title} 已成功删除`,
    });
    showEditor.value = false;
    currentIdea.value = null;
  }
};

const handleDeleteCurrent = () => {
  if (currentIdea.value) {
    handleDelete(currentIdea.value);
  }
};

const handleToggleComplete = (idea: Idea) => {
  const index = ideas.value.findIndex(i => i.id === idea.id);
  if (index !== -1) {
    ideas.value[index] = {
      ...ideas.value[index],
      completed: !ideas.value[index].completed,
      updatedAt: new Date().toISOString(),
    };
  }
};

const toggleView = () => {
  view.value = view.value === 'grid' ? 'list' : 'grid';
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gradient">灵感箱</h2>
        <p class="text-muted-foreground mt-1">快速记录想法、链接和待办。</p>
      </div>
      <Button @click="handleCreate">
        <Plus class="h-4 w-4 mr-1" />
        新建灵感
      </Button>
    </div>

    <!-- 灵感列表 -->
    <IdeaList
      :ideas="ideas"
      :view="view"
      @select="handleSelect"
      @delete="handleDelete"
      @toggle-complete="handleToggleComplete"
      @toggle-view="toggleView"
    />

    <!-- 编辑器弹窗 -->
    <IdeaEditor
      v-if="showEditor"
      :idea="currentIdea"
      @close="showEditor = false"
      @save="handleSave"
      @delete="handleDeleteCurrent"
    />
  </div>
</template>
