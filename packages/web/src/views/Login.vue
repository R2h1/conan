<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
    <!-- 温暖友好的背景渐变 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div class="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-transparent dark:to-transparent"></div>
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
    </div>

    <div class="w-full max-w-md px-4 animate-slide-up">
      <Card variant="gradient" class="relative overflow-hidden border-primary/20 shadow-xl">
      <!-- 装饰性渐变圆圈 -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

      <CardHeader class="relative z-10">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        </div>
        <CardTitle class="text-2xl font-bold text-center text-foreground">欢迎回来</CardTitle>
        <CardDescription class="text-center text-muted-foreground text-sm">
          还没有账号？<RouterLink to="/register" class="text-primary-hover hover:text-primary-hover/80 hover:underline ml-1 font-medium">立即注册</RouterLink>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div class="space-y-2 group">
            <Label for="email" class="text-sm font-medium text-muted-foreground group-focus-within:text-primary transition-colors duration-200">邮箱</Label>
            <div class="relative">
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                class="w-full border-input focus:border-primary focus:ring-primary/20 transition-all duration-200 pl-9"
              />
              <div class="absolute left-2.5 top-1/2 -translate-y-[calc(50%-0.5px)] text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89-5.26a2 2 0 012.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="space-y-2 group">
            <Label for="password" class="text-sm font-medium text-muted-foreground group-focus-within:text-primary transition-colors duration-200">密码</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="输入密码"
                required
                class="w-full border-input focus:border-primary focus:ring-primary/20 transition-all duration-200 pl-9"
              />
              <div class="absolute left-2.5 top-1/2 -translate-y-[calc(50%-0.5px)] text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div v-if="error" class="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-bounce-in">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ error }}</span>
          </div>

          <!-- 忘记密码链接 -->
          <div class="text-right">
            <a href="#" class="text-sm text-primary hover:text-primary-hover hover:underline transition-colors duration-200">
              忘记密码？
            </a>
          </div>

          <Button type="submit" variant="default" size="lg" class="w-full mt-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300" :disabled="loading">
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
            <span v-else>登录</span>
          </Button>

        </form>
      </CardContent>
    </Card>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const router = useRouter();
const authStore = useAuthStore();
const { toast } = useToast();

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    toast({
      title: '登录成功',
      description: '欢迎回来！',
    });
    router.push('/app');
  } catch (e: any) {
    const errorMsg = e.response?.data?.error || e.message || '登录失败';
    toast({
      title: '登录失败',
      description: errorMsg,
      variant: 'destructive',
    });
    error.value = errorMsg;
  } finally {
    loading.value = false;
  }
};
</script>
