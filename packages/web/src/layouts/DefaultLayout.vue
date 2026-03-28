<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 顶部栏（简洁） -->
    <header
      class="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div
        class="container mx-auto px-4 py-3 flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <!-- 移动端菜单按钮 -->
          <Button
            variant="ghost"
            size="icon"
            class="lg:hidden"
            @click="mobileMenuOpen = true"
          >
            <Menu class="h-5 w-5" />
          </Button>
          <RouterLink
            to="/"
            class="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            Conan
          </RouterLink>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="flex relative">
      <!-- 桌面侧边栏（可折叠） -->
      <aside
        class="hidden lg:block border-r transition-all duration-300 relative"
        :class="sidebarCollapsed ? 'w-16' : 'w-64'"
      >
        <nav class="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto p-2">
          <div class="space-y-1">
            <TooltipProvider :delayDuration="0">
              <template v-for="item in navItems" :key="item.path">
                <Tooltip v-if="sidebarCollapsed" :side="'right'">
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      class="w-full justify-start"
                      :class="sidebarCollapsed ? 'px-2' : 'px-3'"
                      as-child
                    >
                      <RouterLink
                        :to="item.path"
                        class="flex items-center gap-2"
                      >
                        <component :is="item.icon" class="h-5 w-5 shrink-0" />
                        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
                      </RouterLink>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ item.name }}</p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  v-else
                  variant="ghost"
                  class="w-full justify-start px-3"
                  as-child
                >
                  <RouterLink
                    :to="`/app${item.path}`"
                    class="flex items-center gap-2"
                  >
                    <component :is="item.icon" class="h-5 w-5 shrink-0" />
                    <span>{{ item.name }}</span>
                  </RouterLink>
                </Button>
              </template>
            </TooltipProvider>
          </div>
        </nav>

        <!-- 折叠按钮（位于侧边栏右边缘） -->
        <div
          class="absolute top-1/4 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-background border shadow-sm flex items-center justify-center cursor-pointer hover:bg-accent transition-colors z-10"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <ChevronLeft v-if="!sidebarCollapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
        </div>
      </aside>

      <!-- 移动端侧边栏（Sheet） -->
      <Sheet v-model:open="mobileMenuOpen">
        <SheetContent side="left" class="w-64 p-0">
          <nav class="p-4 space-y-1">
            <Button
              variant="ghost"
              class="w-full justify-start"
              as-child
              v-for="item in navItems"
              :key="item.path"
            >
              <RouterLink
                :to="item.path"
                class="flex items-center gap-2"
                @click="mobileMenuOpen = false"
              >
                <component :is="item.icon" class="h-5 w-5" />
                <span>{{ item.name }}</span>
              </RouterLink>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      <!-- 主内容区 -->
      <main class="flex-1 p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Wrench,
  BookOpen,
  Lightbulb,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import ThemeToggle from '@/components/theme-toggle.vue';

const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);

const navItems = [
  { name: '仪表盘', path: '/', icon: LayoutDashboard },
  { name: '工具集', path: '/tools', icon: Wrench },
  { name: '知识库', path: '/notes', icon: BookOpen },
  { name: '灵感箱', path: '/ideas', icon: Lightbulb },
];
</script>
