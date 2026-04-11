<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">注册</CardTitle>
        <CardDescription class="text-center">
          已有账号？
          <RouterLink to="/login" class="text-primary hover:underline">
            立即登录
          </RouterLink>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">用户名</Label>
            <Input
              id="name"
              v-model="name"
              type="text"
              placeholder="选择一个用户名"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="email">邮箱</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="password">密码</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="至少 6 位密码"
              minlength="6"
              required
            />
          </div>
          <div v-if="error" class="text-destructive text-sm">
            {{ error }}
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    router.push('/app');
  } catch (e: any) {
    error.value = authStore.error || '注册失败';
  } finally {
    loading.value = false;
  }
};
</script>
