<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">JSON 格式化 / 压缩 / 校验</h2>
    <div class="space-y-4">
      <textarea
        v-model="input"
        class="w-full h-64 p-2 border rounded font-mono text-sm"
        placeholder='输入 JSON，例如：{"name":"Conan","age":30}'
      ></textarea>
      <div class="flex gap-2">
        <button
          @click="format"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          格式化
        </button>
        <button
          @click="compress"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          压缩
        </button>
        <button
          @click="clear"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          清空
        </button>
      </div>
      <div v-if="output" class="mt-4">
        <h3 class="font-semibold mb-2">输出：</h3>
        <pre class="bg-gray-100 p-4 rounded overflow-auto font-mono text-sm">{{
          output
        }}</pre>
      </div>
      <div v-if="error" class="mt-4 text-red-500 bg-red-50 p-3 rounded">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
