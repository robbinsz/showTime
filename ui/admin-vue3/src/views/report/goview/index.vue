<template>
  <ContentWrap :bodyStyle="{ padding: '0px' }" class="!mb-0">
    <IFrame :src="src" />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { getAccessToken, getRefreshToken } from '@/utils/auth'

defineOptions({ name: 'GoView' })

const getTokenString = () => {
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
  return token
}

onMounted(() => {
  const token = getTokenString()
  if (token) {
    try {
      // 同源直接写入纯净 token，供 GoView 瞬间读取
      localStorage.setItem('GOVIEW_TOKEN', token)
    } catch (e) {}
  }
})

const src = computed(() => {
  const token = getTokenString()
  const refreshToken = getRefreshToken() || ''
  return `/goview/?accessToken=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}#/project/items?accessToken=${encodeURIComponent(token)}`
})
</script>
