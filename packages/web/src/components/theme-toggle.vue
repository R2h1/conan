<template>
  <Button variant="outline" size="icon" @click="toggleTheme">
    <Sun v-if="!isDarkMode" class="h-[1.2rem] w-[1.2rem]" />
    <Moon v-else class="h-[1.2rem] w-[1.2rem]" />
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-vue-next';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);

const toggleTheme = () => {
  themeStore.toggleDarkMode();
};
</script>
