<template>
  <Button variant="outline" size="icon" @click="toggleTheme">
    <Sun v-if="isLight" class="h-[1.2rem] w-[1.2rem]" />
    <Moon v-else class="h-[1.2rem] w-[1.2rem]" />
  </Button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-vue-next';

const isLight = ref(true);

const toggleTheme = () => {
  isLight.value = !isLight.value;
  document.documentElement.classList.toggle('dark', !isLight.value);
};

onMounted(() => {
  // 读取本地存储或系统偏好
  const isDark = localStorage.getItem('theme') === 'dark';
  if (isDark) {
    isLight.value = false;
    document.documentElement.classList.add('dark');
  }
});
</script>
