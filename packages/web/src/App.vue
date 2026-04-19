<template>
  <div>
    <RouterView />
    <Toaster />
    <QuickSearch @select="handleSearchSelect" />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/toast'
import QuickSearch from '@/components/search/QuickSearch.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSearchSelect = (result: any) => {
  // 根据搜索结果类型进行路由跳转
  switch (result.type) {
    case 'note':
      // 跳转到笔记页面并选中该笔记
      router.push(`/app/notes?note=${result.id}`)
      break
    case 'idea':
      // 跳转到灵感页面并选中该灵感
      router.push(`/app/ideas?idea=${result.id}`)
      break
    case 'tool':
      // 跳转到工具页面并切换到对应标签页
      router.push(result.url)
      break
  }
}
</script>
