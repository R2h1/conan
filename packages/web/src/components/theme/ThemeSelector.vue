<template>
  <div class="theme-selector">
    <div class="mb-2">
      <h3 class="text-lg font-semibold text-foreground">主题设置</h3>
      <p class="text-sm text-muted-foreground">选择您喜欢的界面主题颜色</p>
    </div>

    <div class="mb-4">
      <Button variant="outline" size="sm" @click="resetToDefault">
        <span class="mr-1">↺</span> 重置为默认主题
      </Button>
    </div>

    <!-- 主题网格 - 点击主题卡片立即切换 -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 mb-6">
      <div
        v-for="theme in availableThemes"
        :key="theme.id"
        class="theme-card group"
        :class="{ 'theme-card-active': currentThemeId === theme.id }"
        @click="selectTheme(theme.id)"
      >
        <div class="theme-preview" :style="getThemePreviewStyle(theme)">
          <!-- 主题颜色预览 -->
          <div class="color-stripes">
            <div
              class="color-stripe"
              :style="{ backgroundColor: `hsl(${theme.colors.primary})` }"
            ></div>
            <div
              class="color-stripe"
              :style="{ backgroundColor: `hsl(${theme.colors.primaryHover})` }"
            ></div>
            <div
              class="color-stripe"
              :style="{ backgroundColor: `hsl(${theme.colors.ring})` }"
            ></div>
          </div>
          <!-- 选中标记 -->
          <div
            v-if="currentThemeId === theme.id"
            class="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
          >
            <Check class="h-2.5 w-2.5" />
          </div>
        </div>
        <div class="theme-info">
          <div class="flex items-center gap-1.5">
            <span class="text-base">{{ theme.icon }}</span>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-xs text-foreground truncate">
                {{ theme.name }}
              </div>
              <div class="text-[10px] text-muted-foreground truncate">
                {{ theme.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 深色模式切换 -->
    <div
      class="flex items-center justify-between p-4 border rounded-lg bg-card"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
        >
          <Moon class="h-5 w-5" />
        </div>
        <div>
          <div class="font-medium text-foreground">深色模式</div>
          <div class="text-sm text-muted-foreground">切换到深色界面</div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="toggleDarkMode(!isDarkMode)"
        :class="isDarkMode ? 'bg-primary text-primary-foreground' : ''"
      >
        {{ isDarkMode ? '关闭' : '开启' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Check, Moon } from 'lucide-vue-next';
import { useThemeStore, type Theme } from '@/stores/theme';
import { useToast } from '@/components/ui/toast/use-toast';

const { toast } = useToast();
const themeStore = useThemeStore();

// 计算属性
const currentThemeId = computed(() => themeStore.currentThemeId);
const isDarkMode = computed(() => themeStore.isDarkMode);
const availableThemes = computed(() => themeStore.availableThemes);

// 方法
const selectTheme = (themeId: string) => {
  themeStore.setTheme(themeId);
};

const toggleDarkMode = (enabled: boolean) => {
  themeStore.toggleDarkMode(enabled);
};

const resetToDefault = () => {
  themeStore.resetToDefault();
  toast({
    title: '已重置',
    description: '主题已重置为默认设置',
  });
};

// 生成主题预览样式
const getThemePreviewStyle = (theme: Theme) => {
  return {
    '--theme-primary': `hsl(${theme.colors.primary})`,
    '--theme-primary-hover': `hsl(${theme.colors.primaryHover})`,
    '--theme-ring': `hsl(${theme.colors.ring})`,
  };
};
</script>

<style scoped>
.theme-selector {
  @apply p-4;
}

.theme-card {
  @apply border rounded-md overflow-hidden transition-all duration-200;
  @apply hover:shadow-sm hover:-translate-y-0.5;
  @apply bg-card text-card-foreground;
  @apply cursor-pointer;
}

.theme-card-active {
  @apply border-primary ring-1 ring-primary/30;
}

.theme-preview {
  @apply relative h-16 p-3;
  background: linear-gradient(
    135deg,
    var(--theme-primary, #3b82f6) 0%,
    var(--theme-primary-hover, #2563eb) 50%,
    var(--theme-ring, #60a5fa) 100%
  );
}

.color-stripes {
  @apply absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1;
}

.color-stripe {
  @apply w-6 h-1.5 rounded-full;
}

.theme-info {
  @apply p-2;
}
</style>
