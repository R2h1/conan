<template>
  <div class="space-y-6">
    <!-- 工具导航 -->
    <div class="flex border-b">
      <Button
        v-for="tab in tabs"
        :key="tab.id"
        variant="ghost"
        :class="activeTab === tab.id ? 'border-b-2 border-primary rounded-t' : ''"
        @click="changeTab(tab.id)"
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

    <!-- URL 编解码 -->
    <Card v-else-if="activeTab === 'url'">
      <CardHeader>
        <CardTitle>URL 编解码</CardTitle>
        <CardDescription>URL encode 和 decode 工具，支持中文</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="urlInput">输入</Label>
            <Textarea
              id="urlInput"
              v-model="urlInput"
              placeholder="输入要编码或解码的 URL 或文本"
              rows="4"
            />
          </div>
          <div class="flex gap-2">
            <Button @click="urlEncode">Encode</Button>
            <Button variant="secondary" @click="urlDecode">Decode</Button>
            <Button variant="outline" @click="clearUrl">清空</Button>
          </div>
          <div v-if="urlOutput" class="space-y-2">
            <Label>输出</Label>
            <Textarea
              v-model="urlOutput"
              readonly
              rows="4"
              class="bg-muted font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              @click="copyUrlOutput"
            >
              复制
            </Button>
          </div>
          <div
            v-if="urlError"
            class="text-destructive bg-destructive/10 p-3 rounded-md"
          >
            {{ urlError }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- HTML 实体转义 -->
    <Card v-else-if="activeTab === 'html'">
      <CardHeader>
        <CardTitle>HTML 实体转义</CardTitle>
        <CardDescription>转义或还原 HTML 特殊字符</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="htmlInput">输入</Label>
            <Textarea
              id="htmlInput"
              v-model="htmlInput"
              placeholder="输入要转义或还原的 HTML 文本"
              rows="4"
            />
          </div>
          <div class="flex gap-2">
            <Button @click="htmlEscape">转义</Button>
            <Button variant="secondary" @click="htmlUnescape">还原</Button>
            <Button variant="outline" @click="clearHtml">清空</Button>
          </div>
          <div v-if="htmlOutput" class="space-y-2">
            <Label>输出</Label>
            <Textarea
              v-model="htmlOutput"
              readonly
              rows="4"
              class="bg-muted font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              @click="copyHtmlOutput"
            >
              复制
            </Button>
          </div>
          <div
            v-if="htmlError"
            class="text-destructive bg-destructive/10 p-3 rounded-md"
          >
            {{ htmlError }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 哈希计算 -->
    <Card v-else-if="activeTab === 'hash'">
      <CardHeader>
        <CardTitle>哈希计算</CardTitle>
        <CardDescription>MD5, SHA-1, SHA-256 等哈希算法</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="hashInput">输入</Label>
            <Textarea
              id="hashInput"
              v-model="hashInput"
              placeholder="输入要计算哈希的文本"
              rows="4"
            />
          </div>
          <div class="flex gap-2 flex-wrap">
            <Button @click="() => calculateHash('MD5')">MD5</Button>
            <Button variant="secondary" @click="() => calculateHash('SHA1')">SHA-1</Button>
            <Button variant="outline" @click="() => calculateHash('SHA256')">SHA-256</Button>
            <Button variant="outline" @click="() => calculateHash('SHA512')">SHA-512</Button>
            <Button variant="outline" @click="clearHash">清空</Button>
          </div>
          <div v-if="hashOutput" class="space-y-2">
            <Label>输出</Label>
            <Textarea
              v-model="hashOutput"
              readonly
              rows="4"
              class="bg-muted font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              @click="copyHashOutput"
            >
              复制
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- UUID 生成 -->
    <Card v-else-if="activeTab === 'uuid'">
      <CardHeader>
        <CardTitle>UUID 生成器</CardTitle>
        <CardDescription>生成 UUID v4 随机标识符</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex gap-2">
            <Button @click="generateUuid">生成 UUID</Button>
            <Button variant="secondary" @click="generateMultipleUuids">批量生成 (10 个)</Button>
            <Button variant="outline" @click="clearUuid">清空</Button>
          </div>
          <div v-if="uuidOutput" class="space-y-2">
            <Label>输出</Label>
            <Textarea
              v-model="uuidOutput"
              readonly
              rows="8"
              class="bg-muted font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              @click="copyUuidOutput"
            >
              复制
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 颜色转换 -->
    <Card v-else-if="activeTab === 'color'">
      <CardHeader>
        <CardTitle>颜色转换器</CardTitle>
        <CardDescription>HEX, RGB, HSL 颜色格式互相转换</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <Label>选择颜色</Label>
            <Input
              v-model="colorPicker"
              type="color"
              class="w-20 h-10"
            />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label>HEX</Label>
              <Input
                v-model="hexColor"
                placeholder="#FFFFFF"
              />
            </div>
            <div class="space-y-2">
              <Label>RGB</Label>
              <Input
                v-model="rgbColor"
                placeholder="rgb(255, 255, 255)"
              />
            </div>
            <div class="space-y-2">
              <Label>HSL</Label>
              <Input
                v-model="hslColor"
                placeholder="hsl(0, 0%, 100%)"
              />
            </div>
          </div>
          <div
            v-if="colorPreview"
            class="h-24 rounded-md border-2"
            :style="{ backgroundColor: colorPreview }"
          >
            <div class="flex items-center justify-center h-full text-sm font-medium"
                 :style="{ color: contrastingColor }">
              预览
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Code,
  Clock,
  FileType,
  Link as LinkIcon,
  FileType2,
  Hash,
  Wand2,
  Palette,
} from 'lucide-vue-next';
import CryptoJS from 'crypto-js';
import { useToast } from '@/components/ui/toast';
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

const { toast } = useToast();
const route = useRoute();
const router = useRouter();

const tabs = [
  { id: 'json', label: 'JSON 工具', icon: Code },
  { id: 'timestamp', label: '时间戳', icon: Clock },
  { id: 'base64', label: 'Base64', icon: FileType },
  { id: 'url', label: 'URL 编解码', icon: LinkIcon },
  { id: 'html', label: 'HTML 实体', icon: FileType2 },
  { id: 'hash', label: '哈希计算', icon: Hash },
  { id: 'uuid', label: 'UUID 生成', icon: Wand2 },
  { id: 'color', label: '颜色转换', icon: Palette },
];

const activeTab = ref('json');

// 从URL查询参数初始化活动标签页
const initTabFromUrl = () => {
  const tabFromUrl = route.query.tab as string;
  if (tabFromUrl && tabs.some(tab => tab.id === tabFromUrl)) {
    activeTab.value = tabFromUrl;
  }
};

// 组件挂载时初始化
onMounted(() => {
  initTabFromUrl();
});

// 监听路由变化
watch(() => route.query.tab, (newTab) => {
  if (newTab && tabs.some(tab => tab.id === newTab)) {
    activeTab.value = newTab as string;
  }
});

// 标签页切换时更新URL
const changeTab = (tabId: string) => {
  activeTab.value = tabId;
  router.push({
    query: { ...route.query, tab: tabId }
  });
};

// JSON 工具
const jsonInput = ref('');
const jsonOutput = ref('');
const jsonError = ref('');

const formatJson = () => {
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(obj, null, 2);
    jsonError.value = '';
    toast({
      title: 'JSON 格式化成功',
      description: 'JSON 已格式化',
    });
  } catch (e: any) {
    toast({
      title: 'JSON 格式错误',
      description: e.message,
      variant: 'destructive',
    });
    jsonError.value = '无效 JSON: ' + e.message;
    jsonOutput.value = '';
  }
};

const compressJson = () => {
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(obj);
    jsonError.value = '';
    toast({
      title: 'JSON 压缩成功',
      description: 'JSON 已压缩',
    });
  } catch (e: any) {
    toast({
      title: 'JSON 格式错误',
      description: e.message,
      variant: 'destructive',
    });
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
  if (!timestampInput.value) {
    toast({
      title: '请输入时间戳',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }

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
    toast({
      title: '转换成功',
      description: `时间戳已转换为日期时间`,
    });
  } catch (e: any) {
    toast({
      title: '转换失败',
      description: '无效时间戳',
      variant: 'destructive',
    });
    dateOutput.value = '无效时间戳';
  }
};

const dateToTimestamp = () => {
  if (!dateInput.value) {
    toast({
      title: '请选择日期',
      description: '日期输入为空',
      variant: 'destructive',
    });
    return;
  }

  const date = new Date(dateInput.value);
  timestampOutput.value = Math.floor(date.getTime() / 1000);
  toast({
    title: '转换成功',
    description: `日期时间已转换为时间戳`,
  });
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
  if (!base64Input.value) {
    toast({
      title: '请输入文本',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }
  try {
    base64Output.value = btoa(unescape(encodeURIComponent(base64Input.value)));
    base64Error.value = '';
    toast({
      title: '编码成功',
      description: '文本已编码为 Base64',
    });
  } catch (e: any) {
    toast({
      title: '编码失败',
      description: e.message,
      variant: 'destructive',
    });
    base64Error.value = '编码失败：' + e.message;
    base64Output.value = '';
  }
};

const base64Decode = () => {
  if (!base64Input.value) {
    toast({
      title: '请输入 Base64',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }
  try {
    base64Output.value = decodeURIComponent(escape(atob(base64Input.value)));
    base64Error.value = '';
    toast({
      title: '解码成功',
      description: 'Base64 已解码为文本',
    });
  } catch (e: any) {
    toast({
      title: '解码失败',
      description: e.message,
      variant: 'destructive',
    });
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
  toast({
    title: '已复制',
    description: '输出已复制到剪贴板',
  });
};

// URL 编解码工具
const urlInput = ref('');
const urlOutput = ref('');
const urlError = ref('');

const urlEncode = () => {
  if (!urlInput.value) {
    toast({
      title: '请输入文本',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }
  try {
    urlOutput.value = encodeURIComponent(urlInput.value);
    urlError.value = '';
    toast({
      title: '编码成功',
      description: '文本已进行 URL Encode',
    });
  } catch (e: any) {
    toast({
      title: '编码失败',
      description: e.message,
      variant: 'destructive',
    });
    urlError.value = '编码失败：' + e.message;
    urlOutput.value = '';
  }
};

const urlDecode = () => {
  if (!urlInput.value) {
    toast({
      title: '请输入 URL 编码的文本',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }
  try {
    urlOutput.value = decodeURIComponent(urlInput.value);
    urlError.value = '';
    toast({
      title: '解码成功',
      description: 'URL 编码已解码为文本',
    });
  } catch (e: any) {
    toast({
      title: '解码失败',
      description: e.message,
      variant: 'destructive',
    });
    urlError.value = '解码失败：' + e.message;
    urlOutput.value = '';
  }
};

const clearUrl = () => {
  urlInput.value = '';
  urlOutput.value = '';
  urlError.value = '';
};

const copyUrlOutput = () => {
  navigator.clipboard.writeText(urlOutput.value);
  toast({
    title: '已复制',
    description: '输出已复制到剪贴板',
  });
};

// HTML 实体转义工具
const htmlInput = ref('');
const htmlOutput = ref('');
const htmlError = ref('');

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const htmlUnescapeMap: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const htmlEscape = () => {
  if (!htmlInput.value) {
    toast({
      title: '请输入文本',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }
  try {
    const regex = /[&<>"']/g;
    htmlOutput.value = htmlInput.value.replace(regex, (match) => htmlEscapeMap[match]);
    htmlError.value = '';
    toast({
      title: '转义成功',
      description: 'HTML 特殊字符已转义',
    });
  } catch (e: any) {
    toast({
      title: '转义失败',
      description: e.message,
      variant: 'destructive',
    });
    htmlError.value = '转义失败：' + e.message;
    htmlOutput.value = '';
  }
};

const htmlUnescape = () => {
  if (!htmlInput.value) {
    toast({
      title: '请输入 HTML 编码的文本',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }
  try {
    const regex = /&(amp|lt|gt|quot|#39);/g;
    htmlOutput.value = htmlInput.value.replace(regex, (match) => htmlUnescapeMap[match]);
    htmlError.value = '';
    toast({
      title: '还原成功',
      description: 'HTML 实体已还原为文本',
    });
  } catch (e: any) {
    toast({
      title: '还原失败',
      description: e.message,
      variant: 'destructive',
    });
    htmlError.value = '还原失败：' + e.message;
    htmlOutput.value = '';
  }
};

const clearHtml = () => {
  htmlInput.value = '';
  htmlOutput.value = '';
  htmlError.value = '';
};

const copyHtmlOutput = () => {
  navigator.clipboard.writeText(htmlOutput.value);
  toast({
    title: '已复制',
    description: '输出已复制到剪贴板',
  });
};

// 哈希计算工具
const hashInput = ref('');
const hashOutput = ref('');

const calculateHash = (algorithm: string) => {
  if (!hashInput.value) {
    toast({
      title: '请输入文本',
      description: '输入框为空',
      variant: 'destructive',
    });
    return;
  }
  try {
    let hash: CryptoJS.lib.WordArray;
    switch (algorithm) {
      case 'MD5':
        hash = CryptoJS.MD5(hashInput.value);
        break;
      case 'SHA1':
        hash = CryptoJS.SHA1(hashInput.value);
        break;
      case 'SHA256':
        hash = CryptoJS.SHA256(hashInput.value);
        break;
      case 'SHA512':
        hash = CryptoJS.SHA512(hashInput.value);
        break;
      default:
        hash = CryptoJS.MD5(hashInput.value);
    }
    hashOutput.value = hash.toString(CryptoJS.enc.Hex);
    toast({
      title: '哈希计算成功',
      description: `${algorithm} 哈希已生成`,
    });
  } catch (e: any) {
    toast({
      title: '计算失败',
      description: e.message,
      variant: 'destructive',
    });
    hashOutput.value = '';
  }
};

const clearHash = () => {
  hashInput.value = '';
  hashOutput.value = '';
};

const copyHashOutput = () => {
  navigator.clipboard.writeText(hashOutput.value);
  toast({
    title: '已复制',
    description: '输出已复制到剪贴板',
  });
};

// UUID 生成工具
const uuidOutput = ref('');

const generateUuid = () => {
  const uuid = crypto.randomUUID();
  uuidOutput.value = uuid;
  toast({
    title: 'UUID 已生成',
    description: '已生成 1 个 UUID',
  });
};

const generateMultipleUuids = () => {
  const uuids = Array.from({ length: 10 }, () => crypto.randomUUID());
  uuidOutput.value = uuids.join('\n');
  toast({
    title: 'UUID 已生成',
    description: '已生成 10 个 UUID',
  });
};

const clearUuid = () => {
  uuidOutput.value = '';
};

const copyUuidOutput = () => {
  navigator.clipboard.writeText(uuidOutput.value);
  toast({
    title: '已复制',
    description: '输出已复制到剪贴板',
  });
};

// 颜色转换工具
const colorPicker = ref('#3b82f6');
const hexColor = ref('#3b82f6');
const rgbColor = ref('rgb(59, 130, 246)');
const hslColor = ref('hsl(217, 91%, 60%)');
const colorPreview = ref('#3b82f6');
const contrastingColor = ref('#000000');

const hexToRgb = (hex: string): string | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
    : null;
};

const hexToHsl = (hex: string): string | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const rgbToHex = (rgb: string): string | null => {
  const result = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(rgb);
  if (!result) return null;

  const r = parseInt(result[1]);
  const g = parseInt(result[2]);
  const b = parseInt(result[3]);

  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

const rgbToHsl = (rgb: string): string | null => {
  const result = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(rgb);
  if (!result) return null;

  let r = parseInt(result[1]) / 255;
  let g = parseInt(result[2]) / 255;
  let b = parseInt(result[3]) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const hslToRgb = (hsl: string): string | null => {
  const result = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i.exec(hsl);
  if (!result) return null;

  const h = parseInt(result[1]) / 360;
  const s = parseInt(result[2]) / 100;
  const l = parseInt(result[3]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
};

const hslToHex = (hsl: string): string | null => {
  const rgb = hslToRgb(hsl);
  return rgb ? rgbToHex(rgb) : null;
};

const updateColorFromPicker = () => {
  hexColor.value = colorPicker.value;
  const rgb = hexToRgb(colorPicker.value);
  const hsl = hexToHsl(colorPicker.value);
  if (rgb) rgbColor.value = rgb;
  if (hsl) hslColor.value = hsl;
  colorPreview.value = colorPicker.value;
  contrastingColor.value = getContrastingColor(colorPicker.value);
};

const updateFromHex = () => {
  if (!/^#?[0-9A-F]{6}$/i.test(hexColor.value)) return;

  const hex = hexColor.value.startsWith('#') ? hexColor.value : '#' + hexColor.value;
  colorPicker.value = hex;
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  if (rgb) rgbColor.value = rgb;
  if (hsl) hslColor.value = hsl;
  colorPreview.value = hex;
  contrastingColor.value = getContrastingColor(hex);
};

const updateFromRgb = () => {
  const hex = rgbToHex(rgbColor.value);
  if (!hex) return;

  hexColor.value = hex;
  colorPicker.value = hex;
  const hsl = rgbToHsl(rgbColor.value);
  if (hsl) hslColor.value = hsl;
  colorPreview.value = hex;
  contrastingColor.value = getContrastingColor(hex);
};

const updateFromHsl = () => {
  const hex = hslToHex(hslColor.value);
  if (!hex) return;

  hexColor.value = hex;
  colorPicker.value = hex;
  const rgb = hslToRgb(hslColor.value);
  if (rgb) rgbColor.value = rgb;
  colorPreview.value = hex;
  contrastingColor.value = getContrastingColor(hex);
};

const getContrastingColor = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '#000000';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

watch(colorPicker, updateColorFromPicker);
watch(hexColor, updateFromHex);
watch(rgbColor, updateFromRgb);
watch(hslColor, updateFromHsl);
</script>
