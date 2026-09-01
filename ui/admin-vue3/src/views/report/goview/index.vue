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
  // 统一采用同源相对子路径 /goview/，杜绝外部独立端口依赖
  return `/goview/?accessToken=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}#/project/items`
})
</script>
