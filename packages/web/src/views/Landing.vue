<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 简洁顶部栏（包含主题切换） -->
    <header
      class="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div
        class="container mx-auto px-4 py-3 flex items-center justify-between"
      >
        <h1
          class="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
        >
          Conan
        </h1>
        <ThemeToggle />
      </div>
    </header>

    <!-- 主要内容 -->
    <div
      class="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center"
    >
      <div class="max-w-2xl space-y-6">
        <div class="inline-block p-3 bg-primary/10 rounded-full mb-4">
          <Globe class="h-12 w-12 text-primary" />
        </div>
        <h1
          class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
        >
          Conan
        </h1>
        <p class="text-xl text-muted-foreground">
          你的个人数字平台 · 工具集 · 知识库 · 灵感收集
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button size="lg" class="gap-2" @click="enterApp">
            进入应用
            <ArrowRight class="h-5 w-5" />
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
        <div class="p-6 rounded-lg border bg-card">
          <Wrench class="h-10 w-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold mb-2">实用工具集</h3>
          <p class="text-muted-foreground">
            JSON格式化、时间戳转换、编解码等日常开发工具。
          </p>
        </div>
        <div class="p-6 rounded-lg border bg-card">
          <BookOpen class="h-10 w-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold mb-2">个人知识库</h3>
          <p class="text-muted-foreground">
            Markdown笔记、代码片段、标签分类，你的第二大脑。
          </p>
        </div>
        <div class="p-6 rounded-lg border bg-card">
          <Lightbulb class="h-10 w-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold mb-2">灵感收集箱</h3>
          <p class="text-muted-foreground">
            快速记录想法、链接、待办，让灵感不再流失。
          </p>
        </div>
      </div>
    </div>
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

const enterApp = () => {
  router.push('/app');
};

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
};
</script>
