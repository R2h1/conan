<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getTagCloud } from '@/api/tags';
import type { TagCloudItem } from '@/api/tags';
import TagCloud from '@/components/tags/TagCloud.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-vue-next';

const router = useRouter();

// 标签数据
const allTags = ref<TagCloudItem[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// 加载标签云数据
const loadTagCloud = async () => {
  isLoading.value = true;
  try {
    const tags = await getTagCloud({ limit: 100 });
    allTags.value = tags;
  } catch (error) {
    console.error('Failed to load tags:', error);
  } finally {
    isLoading.value = false;
  }
};

// 筛选后的标签
const filteredTags = computed(() => {
  if (!searchQuery.value.trim()) {
    return allTags.value;
  }
  const query = searchQuery.value.toLowerCase();
  return allTags.value.filter(tag =>
    tag.name.toLowerCase().includes(query)
  );
});

// 标签点击处理
const handleTagClick = (tag: TagCloudItem) => {
  // 根据标签类型跳转到对应页面
  if (tag.type === 'note' || tag.type === 'both') {
    router.push(`/app/notes?tag=${encodeURIComponent(tag.name)}`);
  } else if (tag.type === 'idea') {
    router.push(`/app/ideas?tag=${encodeURIComponent(tag.name)}`);
  }
};

// 统计信息
const stats = computed(() => {
  const totalTags = allTags.value.length;
  const totalOccurrences = allTags.value.reduce((sum, tag) => sum + tag.count, 0);
  const noteTags = allTags.value.filter(tag => tag.type === 'note' || tag.type === 'both').length;
  const ideaTags = allTags.value.filter(tag => tag.type === 'idea' || tag.type === 'both').length;
  return { totalTags, totalOccurrences, noteTags, ideaTags };
});

onMounted(() => {
  loadTagCloud();
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div>
      <h2 class="text-3xl font-bold text-gradient">标签云</h2>
      <p class="text-muted-foreground mt-1">可视化展示所有标签及使用频率。</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="text-sm text-muted-foreground">标签总数</div>
        <div class="text-2xl font-bold">{{ stats.totalTags }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-muted-foreground">总出现次数</div>
        <div class="text-2xl font-bold">{{ stats.totalOccurrences }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-muted-foreground">笔记标签</div>
        <div class="text-2xl font-bold">{{ stats.noteTags }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-muted-foreground">灵感标签</div>
        <div class="text-2xl font-bold">{{ stats.ideaTags }}</div>
      </div>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative flex-1 max-w-md">
        <Search
          class="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="搜索标签..."
          class="pl-8"
        />
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          @click="loadTagCloud"
          :disabled="isLoading"
        >
          {{ isLoading ? '加载中...' : '刷新' }}
        </Button>
        <Button
          @click="router.push('/app/notes')"
        >
          查看所有笔记
        </Button>
      </div>
    </div>

    <!-- 标签云 -->
    <div class="card p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">标签云</h3>
        <div class="text-sm text-muted-foreground">
          共 {{ filteredTags.length }} 个标签
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-2 text-muted-foreground">加载标签云...</p>
      </div>

      <div v-else-if="filteredTags.length === 0" class="text-center py-12 text-muted-foreground">
        {{ searchQuery ? '未找到匹配的标签' : '暂无标签' }}
      </div>

      <TagCloud
        v-else
        :tags="filteredTags"
        :max-font-size="32"
        :min-font-size="14"
        color-scheme="frequency"
        @click="handleTagClick"
        class="min-h-[300px]"
      />

      <div class="mt-6 text-sm text-muted-foreground">
        <p>💡 提示：</p>
        <ul class="list-disc pl-5 mt-1 space-y-1">
          <li>标签大小表示使用频率，越大表示使用越多</li>
          <li>颜色表示频率高低（冷色→暖色）</li>
          <li>点击标签可查看相关笔记或灵感</li>
          <li>蓝色标签仅用于笔记，绿色标签仅用于灵感，紫色标签两者皆有</li>
        </ul>
      </div>
    </div>
  </div>
</template>