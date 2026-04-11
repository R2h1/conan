<template>
  <div class="card p-6">
    <h3 class="text-lg font-semibold mb-4">最近访问</h3>
    <div class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        @click="handleClick(item)"
      >
        <div class="p-2 rounded-lg bg-primary/10">
          <component :is="item.icon" class="h-4 w-4 text-primary" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{{ item.title }}</p>
          <p class="text-sm text-muted-foreground">{{ item.description }}</p>
        </div>
        <span class="text-xs text-muted-foreground">{{ item.time }}</span>
      </div>
      <div v-if="!items.length" class="text-center text-muted-foreground py-8">
        暂无最近访问记录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RecentItem {
  id: string;
  title: string;
  description: string;
  time: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  href?: string;
}

defineProps<{
  items: RecentItem[];
}>();

const emit = defineEmits<{
  (e: 'click', item: RecentItem): void;
}>();

const handleClick = (item: RecentItem) => {
  emit('click', item);
};
</script>
