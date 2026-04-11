<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  getIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
  toggleIdea,
  type Idea,
} from '@/api/ideas';
import IdeaList from '@/components/ideas/IdeaList.vue';
import IdeaEditor from '@/components/ideas/IdeaEditor.vue';

const ideas = ref<Idea[]>([]);
const loading = ref(false);
const view = ref<'grid' | 'list'>('grid');
const showEditor = ref(false);
const currentIdea = ref<Idea | null>(null);
const { toast } = useToast();

// 加载灵感列表
const loadIdeas = async () => {
  loading.value = true;
  try {
    ideas.value = await getIdeas();
  } catch (error) {
    toast({
      title: '加载失败',
      description: '无法加载灵感列表',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  currentIdea.value = null;
  showEditor.value = true;
};

const handleSelect = (idea: Idea) => {
  currentIdea.value = idea;
  showEditor.value = true;
};

const handleSave = async (data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    if (currentIdea.value) {
      // 编辑模式
      await updateIdea(currentIdea.value.id, data);
      toast({
        title: '灵感已更新',
        description: '更改已成功保存',
      });
    } else {
      // 新建模式
      await createIdea(data);
      toast({
        title: '灵感已创建',
        description: '新灵感创建成功',
      });
    }
    showEditor.value = false;
    currentIdea.value = null;
    await loadIdeas();
  } catch (error: any) {
    toast({
      title: '保存失败',
      description: error.response?.data?.error || '请稍后重试',
      variant: 'destructive',
    });
  }
};

const handleDelete = async (idea: Idea) => {
  if (confirm(`确定删除"${idea.title}"吗？`)) {
    try {
      await deleteIdea(idea.id);
      toast({
        title: '灵感已删除',
        description: `${idea.title} 已成功删除`,
      });
      await loadIdeas();
      showEditor.value = false;
      currentIdea.value = null;
    } catch (error: any) {
      toast({
        title: '删除失败',
        description: error.response?.data?.error || '请稍后重试',
        variant: 'destructive',
      });
    }
  }
};

const handleDeleteCurrent = () => {
  if (currentIdea.value) {
    handleDelete(currentIdea.value);
  }
};

const handleToggleComplete = async (idea: Idea) => {
  try {
    await toggleIdea(idea.id);
    await loadIdeas();
  } catch (error) {
    toast({
      title: '操作失败',
      description: '无法更新灵感状态',
      variant: 'destructive',
    });
  }
};

const toggleView = () => {
  view.value = view.value === 'grid' ? 'list' : 'grid';
};

onMounted(() => {
  loadIdeas();
});
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

    <!-- 加载中 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <p class="text-muted-foreground">加载中...</p>
    </div>

    <!-- 灵感列表 -->
    <IdeaList
      v-else-if="ideas.length > 0"
      :ideas="ideas"
      :view="view"
      @select="handleSelect"
      @delete="handleDelete"
      @toggle-complete="handleToggleComplete"
      @toggle-view="toggleView"
    />

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <p class="text-lg mb-4">还没有灵感记录</p>
      <Button @click="handleCreate">
        <Plus class="h-4 w-4 mr-1" />
        记录第一个灵感
      </Button>
    </div>

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
