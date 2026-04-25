<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCheckinPreference, updateCheckinPreference, testWechatWebhook } from '@/api/checkin-preference';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const loading = ref(false);
const testingWebhook = ref(false);
const webhookTestResult = ref<{
  success: boolean;
  message?: string;
  error?: string;
  details?: string
} | null>(null);

const preference = ref({
  id: 0,
  userId: 0,
  remindTime: '08:00',
  financeCategories: ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他'],
  exerciseTypes: ['跑步', '游泳', '健身', '瑜伽', '骑行', '步行', '其他'],
  studyContentList: [] as string[],
  aiEnabled: true,
  wechatEnabled: false,
  wechatWebhook: '',
  createdAt: '',
  updatedAt: ''
});

const fetchPreference = async () => {
  loading.value = true;
  try {
    const data = await getCheckinPreference();
    preference.value = data;
  } catch (error) {
    console.error('获取偏好设置失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  loading.value = true;
  try {
    const data = await updateCheckinPreference(preference.value);
    preference.value = data;
  } catch (error) {
    console.error('更新偏好设置失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleTestWebhook = async () => {
  if (!preference.value.wechatWebhook) {
    alert('请输入企业微信Webhook URL');
    return;
  }

  testingWebhook.value = true;
  webhookTestResult.value = null;

  try {
    const result = await testWechatWebhook(preference.value.wechatWebhook);
    webhookTestResult.value = result;
  } catch (error) {
    console.error('测试Webhook失败:', error);
    webhookTestResult.value = {
      success: false,
      error: '测试Webhook失败',
      details: error instanceof Error ? error.message : String(error)
    };
  } finally {
    testingWebhook.value = false;
  }
};

onMounted(() => {
  fetchPreference();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- 标题 -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">设置</h2>
    </div>

    <!-- 微信推送设置 -->
    <Card>
      <CardHeader>
        <CardTitle>微信推送设置</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 微信推送开关 -->
        <div class="flex items-center justify-between">
          <Label for="wechatEnabled">启用微信推送</Label>
          <Input
            id="wechatEnabled"
            type="checkbox"
            v-model="preference.wechatEnabled"
            @change="handleSave"
            class="w-4 h-4"
          />
        </div>

        <!-- 提醒时间 -->
        <div class="space-y-2">
          <Label for="remindTime">每日提醒时间 (HH:mm)</Label>
          <Input
            id="remindTime"
            v-model="preference.remindTime"
            @change="handleSave"
            placeholder="08:00"
            class="w-32"
          />
        </div>

        <!-- Webhook URL -->
        <div class="space-y-2">
          <Label for="wechatWebhook">企业微信Webhook URL</Label>
          <Input
            id="wechatWebhook"
            v-model="preference.wechatWebhook"
            @change="handleSave"
            placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
            class="w-full"
          />
        </div>

        <!-- 测试连接按钮 -->
        <div>
          <Button
            @click="handleTestWebhook"
            :disabled="!preference.wechatWebhook || testingWebhook"
          >
            <span v-if="testingWebhook">测试中...</span>
            <span v-else>测试Webhook连接</span>
          </Button>
        </div>

        <!-- 测试结果 -->
        <div v-if="webhookTestResult" class="mt-4">
          <Card v-if="webhookTestResult.success" class="bg-green-50 border-green-200">
            <CardContent class="p-4">
              <p class="text-green-700">{{ webhookTestResult.message }}</p>
            </CardContent>
          </Card>
          <Card v-else class="bg-red-50 border-red-200">
            <CardContent class="p-4">
              <p class="text-red-700">{{ webhookTestResult.error }}</p>
              <p v-if="webhookTestResult.details" class="text-sm text-red-600">
                {{ webhookTestResult.details }}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- AI设置 -->
    <Card>
      <CardHeader>
        <CardTitle>AI设置</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <Label for="aiEnabled">启用AI功能</Label>
          <Input
            id="aiEnabled"
            type="checkbox"
            v-model="preference.aiEnabled"
            @change="handleSave"
            class="w-4 h-4"
          />
        </div>
      </CardContent>
    </Card>

    <!-- 分类设置 -->
    <Card>
      <CardHeader>
        <CardTitle>分类设置</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 财务分类 -->
        <div class="space-y-2">
          <Label for="financeCategories">财务分类</Label>
          <Textarea
            id="financeCategories"
            v-model="preference.financeCategories"
            @change="handleSave"
            placeholder="输入分类，每行一个"
            rows="4"
          />
        </div>

        <!-- 运动类型 -->
        <div class="space-y-2">
          <Label for="exerciseTypes">运动类型</Label>
          <Textarea
            id="exerciseTypes"
            v-model="preference.exerciseTypes"
            @change="handleSave"
            placeholder="输入类型，每行一个"
            rows="4"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>