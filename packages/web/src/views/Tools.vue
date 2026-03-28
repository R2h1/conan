<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">实用工具集</h2>
    <Card>
      <CardHeader>
        <CardTitle>JSON 格式化/压缩/校验</CardTitle>
        <CardDescription
          >输入 JSON 数据，支持格式化、压缩和语法校验</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Textarea
            v-model="input"
            placeholder='输入 JSON，例如：{"name":"Conan","age":30}'
            class="font-mono"
            rows="8"
          />
          <div class="flex gap-2">
            <Button @click="format">格式化</Button>
            <Button variant="secondary" @click="compress">压缩</Button>
            <Button variant="outline" @click="clear">清空</Button>
          </div>
          <div v-if="output" class="mt-4">
            <h3 class="font-semibold mb-2">输出：</h3>
            <pre
              class="bg-muted p-4 rounded-md overflow-auto font-mono text-sm"
              >{{ output }}</pre
            >
          </div>
          <div
            v-if="error"
            class="mt-4 text-destructive bg-destructive/10 p-3 rounded-md"
          >
            {{ error }}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const input = ref('');
const output = ref('');
const error = ref('');

const format = () => {
  try {
    const obj = JSON.parse(input.value);
    output.value = JSON.stringify(obj, null, 2);
    error.value = '';
  } catch (e: any) {
    error.value = '无效 JSON: ' + e.message;
    output.value = '';
  }
};

const compress = () => {
  try {
    const obj = JSON.parse(input.value);
    output.value = JSON.stringify(obj);
    error.value = '';
  } catch (e: any) {
    error.value = '无效 JSON: ' + e.message;
    output.value = '';
  }
};

const clear = () => {
  input.value = '';
  output.value = '';
  error.value = '';
};
</script>
