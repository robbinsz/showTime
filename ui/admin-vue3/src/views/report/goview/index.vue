<template>
  <doc-alert title="大屏设计器" url="https://doc.iocoder.cn/report/screen/" />

  <ContentWrap :bodyStyle="{ padding: '0px' }" class="!mb-0">
    <IFrame :src="src" />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { getAccessToken, getRefreshToken } from '@/utils/auth'

defineOptions({ name: 'GoView' })

const getGoViewUrl = () => {
  let baseUrl = import.meta.env.VITE_GOVIEW_URL
  if (!baseUrl || baseUrl.includes(':3000')) {
    // 默认或未配置时，自适应当前访问主机的 3020 端口
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    baseUrl = `${protocol}//${hostname}:3020`
  }
  return baseUrl
}

const src = computed(() => {
  const token = getAccessToken() || ''
  const refreshToken = getRefreshToken() || ''
  return `${getGoViewUrl()}?accessToken=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`
})
</script>
