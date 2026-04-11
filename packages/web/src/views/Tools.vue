<template>
  <div class="space-y-6">
    <!-- 工具导航 -->
    <div class="flex border-b">
      <Button
        v-for="tab in tabs"
        :key="tab.id"
        variant="ghost"
        :class="activeTab === tab.id ? 'border-b-2 border-primary rounded-t' : ''"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="h-4 w-4 mr-2" />
        {{ tab.label }}
      </Button>
    </div>

    <!-- JSON 格式化 -->
    <Card v-if="activeTab === 'json'">
      <CardHeader>
        <CardTitle>JSON 格式化/压缩/校验</CardTitle>
        <CardDescription>输入 JSON 数据，支持格式化、压缩和语法校验</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Textarea
            v-model="jsonInput"
            placeholder='输入 JSON，例如：{"name":"Conan","age":30}'
            class="font-mono"
            rows="8"
          />
          <div class="flex gap-2">
            <Button @click="formatJson">格式化</Button>
            <Button variant="secondary" @click="compressJson">压缩</Button>
            <Button variant="outline" @click="clearJson">清空</Button>
          </div>
          <div v-if="jsonOutput" class="mt-4">
            <h3 class="font-semibold mb-2">输出：</h3>
            <pre
              class="bg-muted p-4 rounded-md overflow-auto font-mono text-sm"
            >{{ jsonOutput }}</pre>
          </div>
          <div
            v-if="jsonError"
            class="mt-4 text-destructive bg-destructive/10 p-3 rounded-md"
          >
            {{ jsonError }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 时间戳转换 -->
    <Card v-else-if="activeTab === 'timestamp'">
      <CardHeader>
        <CardTitle>时间戳转换</CardTitle>
        <CardDescription>Unix 时间戳与日期时间互相转换</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- 时间戳转日期 -->
          <div class="space-y-2">
            <Label>时间戳 → 日期时间</Label>
            <div class="flex gap-2">
              <Input
                v-model="timestampInput"
                type="number"
                placeholder="输入时间戳（秒或毫秒）"
                class="flex-1"
              />
              <Button @click="timestampToDate">转换</Button>
            </div>
            <div v-if="dateOutput" class="mt-2 p-3 bg-muted rounded-md">
              <p class="font-mono">{{ dateOutput }}</p>
            </div>
          </div>

          <!-- 日期转时间戳 -->
          <div class="space-y-2">
            <Label>日期时间 → 时间戳</Label>
            <div class="flex gap-2">
              <Input
                v-model="dateInput"
                type="datetime-local"
                class="flex-1"
              />
              <Button @click="dateToTimestamp">转换</Button>
            </div>
            <div v-if="timestampOutput" class="mt-2 p-3 bg-muted rounded-md">
              <p class="font-mono">秒：{{ timestampOutput }}</p>
              <p class="font-mono text-sm text-muted-foreground">毫秒：{{ timestampOutput * 1000 }}</p>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" @click="setCurrentTimestamp">
              当前时间戳
            </Button>
            <Button variant="outline" size="sm" @click="setCurrentDate">
              当前日期时间
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Base64 编解码 -->
    <Card v-else-if="activeTab === 'base64'">
      <CardHeader>
        <CardTitle>Base64 编解码</CardTitle>
        <CardDescription>Base64 编码和解码工具</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="base64Input">输入</Label>
            <Textarea
              id="base64Input"
              v-model="base64Input"
              placeholder="输入要编码或解码的文本"
              rows="4"
            />
          </div>
          <div class="flex gap-2">
            <Button @click="base64Encode">编码</Button>
            <Button variant="secondary" @click="base64Decode">解码</Button>
            <Button variant="outline" @click="clearBase64">清空</Button>
          </div>
          <div v-if="base64Output" class="space-y-2">
            <Label>输出</Label>
            <Textarea
              v-model="base64Output"
              readonly
              rows="4"
              class="bg-muted"
            />
            <Button
              variant="outline"
              size="sm"
              @click="copyBase64Output"
            >
              复制
            </Button>
          </div>
          <div
            v-if="base64Error"
            class="text-destructive bg-destructive/10 p-3 rounded-md"
          >
            {{ base64Error }}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Code,
  Clock,
  FileType,
} from 'lucide-vue-next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const tabs = [
  { id: 'json', label: 'JSON 工具', icon: Code },
  { id: 'timestamp', label: '时间戳', icon: Clock },
  { id: 'base64', label: 'Base64', icon: FileType },
];

const activeTab = ref('json');

// JSON 工具
const jsonInput = ref('');
const jsonOutput = ref('');
const jsonError = ref('');

const formatJson = () => {
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(obj, null, 2);
    jsonError.value = '';
  } catch (e: any) {
    jsonError.value = '无效 JSON: ' + e.message;
    jsonOutput.value = '';
  }
};

const compressJson = () => {
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(obj);
    jsonError.value = '';
  } catch (e: any) {
    jsonError.value = '无效 JSON: ' + e.message;
    jsonOutput.value = '';
  }
};

const clearJson = () => {
  jsonInput.value = '';
  jsonOutput.value = '';
  jsonError.value = '';
};

// 时间戳工具
const timestampInput = ref('');
const dateOutput = ref('');
const dateInput = ref('');
const timestampOutput = ref<number | null>(null);

const timestampToDate = () => {
  if (!timestampInput.value) return;

  let ts = Number(timestampInput.value);
  // 如果时间戳小于 10 位，认为是秒，转换为毫秒
  if (ts < 10000000000) {
    ts *= 1000;
  }

  try {
    const date = new Date(ts);
    dateOutput.value = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e: any) {
    dateOutput.value = '无效时间戳';
  }
};

const dateToTimestamp = () => {
  if (!dateInput.value) return;

  const date = new Date(dateInput.value);
  timestampOutput.value = Math.floor(date.getTime() / 1000);
};

const setCurrentTimestamp = () => {
  timestampInput.value = String(Math.floor(Date.now() / 1000));
  timestampToDate();
};

const setCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  dateToTimestamp();
};

// Base64 工具
const base64Input = ref('');
const base64Output = ref('');
const base64Error = ref('');

const base64Encode = () => {
  try {
    base64Output.value = btoa(unescape(encodeURIComponent(base64Input.value)));
    base64Error.value = '';
  } catch (e: any) {
    base64Error.value = '编码失败：' + e.message;
    base64Output.value = '';
  }
};

const base64Decode = () => {
  try {
    base64Output.value = decodeURIComponent(escape(atob(base64Input.value)));
    base64Error.value = '';
  } catch (e: any) {
    base64Error.value = '解码失败：' + e.message;
    base64Output.value = '';
  }
};

const clearBase64 = () => {
  base64Input.value = '';
  base64Output.value = '';
  base64Error.value = '';
};

const copyBase64Output = () => {
  navigator.clipboard.writeText(base64Output.value);
};
</script>
