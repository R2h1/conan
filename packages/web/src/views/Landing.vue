<template>
  <div class="min-h-screen bg-background text-foreground overflow-hidden">
    <!-- 简洁顶部栏（包含主题切换） -->
    <header class="sticky top-0 z-20 border-b glass">
      <div
        class="container mx-auto px-4 py-3 flex items-center justify-between"
      >
        <h1 class="text-xl font-bold text-gradient">Conan</h1>
        <ThemeToggle />
      </div>
    </header>

    <!-- 英雄区域 -->
    <div
      class="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center"
    >
      <div class="max-w-2xl space-y-6 animate-fade-in">
        <!-- 图标动画 -->
        <div class="inline-block relative">
          <div
            class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"
          ></div>
          <div class="relative p-3 bg-primary/10 rounded-full mb-4">
            <Globe class="h-12 w-12 text-primary animate-scale-in" />
          </div>
        </div>

        <!-- 标题动画 -->
        <h1
          class="text-4xl md:text-6xl font-bold text-gradient animate-slide-in"
        >
          Conan
        </h1>

        <p class="text-xl text-muted-foreground animate-slide-in">
          你的个人数字平台 · 工具集 · 知识库 · 灵感收集
        </p>

        <!-- 按钮动画 -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-slide-in"
        >
          <Button size="lg" class="gap-2 group" @click="enterApp">
            进入应用
            <ArrowRight
              class="h-5 w-5 transition-transform group-hover:translate-x-1"
            />
          </Button>
          <Button size="lg" variant="outline" @click="scrollToFeatures">
            了解更多
          </Button>
        </div>
      </div>

      <!-- 功能特性区域 -->
      <div
        id="features"
        class="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
      >
        <div
          class="card-clickable p-6 animate-slide-in"
          style="animation-delay: 0.4s"
        >
          <div class="inline-block p-3 bg-primary/10 rounded-lg mb-4">
            <Wrench class="h-10 w-10 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">实用工具集</h3>
          <p class="text-muted-foreground">
            JSON 格式化、时间戳转换、编解码等日常开发工具。
          </p>
        </div>
        <div
          class="card-clickable p-6 animate-slide-in"
          style="animation-delay: 0.4s"
        >
          <div class="inline-block p-3 bg-primary/10 rounded-lg mb-4">
            <BookOpen class="h-10 w-10 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">个人知识库</h3>
          <p class="text-muted-foreground">
            Markdown 笔记、代码片段、标签分类，你的第二大脑。
          </p>
        </div>
        <div
          class="card-clickable p-6 animate-slide-in"
          style="animation-delay: 0.4s"
        >
          <div class="inline-block p-3 bg-primary/10 rounded-lg mb-4">
            <Lightbulb class="h-10 w-10 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">灵感收集箱</h3>
          <p class="text-muted-foreground">
            快速记录想法、链接、待办，让灵感不再流失。
          </p>
        </div>
      </div>

      <!-- 底部 CTA -->
      <div class="mt-24 pb-16 text-center">
        <div class="inline-block card p-8 animate-fade-in">
          <h2 class="text-2xl font-bold mb-2">准备好开始了吗？</h2>
          <p class="text-muted-foreground mb-6">立即体验高效的数字工作流程</p>
          <Button size="lg" @click="enterApp">
            免费开始
            <ArrowRight class="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 装饰性背景元素 -->
    <div
      class="fixed top-1/4 -left-64 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
    />
    <div
      class="fixed bottom-1/4 -right-64 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
  Globe,
  ArrowRight,
  Wrench,
  BookOpen,
  Lightbulb,
} from 'lucide-vue-next';
import ThemeToggle from '@/components/theme-toggle.vue';

const router = useRouter();

const enterApp = async () => {
  // 检查是否已登录，如果未登录则跳转到登录页
  try {
    const { useAuthStore } = await import('@/stores/auth');
    const authStore = useAuthStore();
    await authStore.fetchUser();
    if (authStore.isAuthenticated) {
      router.push('/app');
    } else {
      router.push('/login');
    }
  } catch {
    router.push('/login');
  }
};

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
};
</script>
