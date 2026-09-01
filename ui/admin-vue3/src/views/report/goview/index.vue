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
  if (import.meta.env.DEV) {
    const envUrl = import.meta.env.VITE_GOVIEW_URL
    return envUrl || 'http://127.0.0.1:3020/goview/'
  }
  return '/goview/'
}

const src = computed(() => {
  let token = getAccessToken() || ''
  if (!token) {
    try {
      const raw = localStorage.getItem('ACCESS_TOKEN')
      if (raw) {
        const parsed = JSON.parse(raw)
        token = parsed?.v || parsed || ''
      }
    } catch (e) {}
  }
  const refreshToken = getRefreshToken() || ''
  const baseUrl = getGoViewUrl()
  const sep = baseUrl.endsWith('/') ? '' : '/'
  return `${baseUrl}${sep}?accessToken=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}#/project/items`
})
</script>
