<template>
  <doc-alert title="大屏设计器" url="https://doc.iocoder.cn/report/screen/" />

  <ContentWrap :bodyStyle="{ padding: '0px' }" class="!mb-0">
    <IFrame :src="src" />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { getAccessToken, getRefreshToken } from '@/utils/auth'

defineOptions({ name: 'GoView' })

const getGoViewUrl = () => {
  // 开发模式下使用独立的本地端口，生产/容器化模式下直接使用同源子路径 /goview/
  if (import.meta.env.DEV) {
    const envUrl = import.meta.env.VITE_GOVIEW_URL
    return envUrl || 'http://127.0.0.1:3020/goview/'
  }
  return '/goview/'
}

const src = computed(() => {
  const token = getAccessToken() || ''
  const refreshToken = getRefreshToken() || ''
  return `${getGoViewUrl()}?accessToken=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`
})
</script>
