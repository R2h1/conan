<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const tabs = [
  { id: 'finance', label: '财务记账' },
  { id: 'exercise', label: '运动记录' },
  { id: 'study', label: '学习阅读' },
  { id: 'calendar', label: '打卡日历' },
  { id: 'stats', label: '统计图表' },
  { id: 'settings', label: '设置' },
];
const activeTab = ref('finance');

// 根据当前路由设置激活标签
const updateActiveTab = () => {
  const path = route.path;
  console.log('updateActiveTab called with path:', path);

  if (path.includes('/app/checkin/exercise')) {
    activeTab.value = 'exercise';
  } else if (path.includes('/app/checkin/study')) {
    activeTab.value = 'study';
  } else if (path.includes('/app/checkin/calendar')) {
    activeTab.value = 'calendar';
  } else if (path.includes('/app/checkin/stats')) {
    activeTab.value = 'stats';
  } else if (path.includes('/app/checkin/settings')) {
    activeTab.value = 'settings';
  } else {
    activeTab.value = 'finance'; // 默认或财务
  }

  console.log('activeTab set to:', activeTab.value);
};

// 初始设置
onMounted(() => {
  updateActiveTab();
});

// 监听路由变化，但避免无限循环
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    updateActiveTab();
  }
});

const switchTab = (tabId: string) => {
  router.push(`/app/checkin/${tabId}`);
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 顶部导航 -->
    <div class="border-b">
      <div class="flex space-x-2 p-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-2 rounded-md transition-colors"
          :class="activeTab === tab.id
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted text-muted-foreground'"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-auto">
      <router-view />
    </div>
  </div>
</template>