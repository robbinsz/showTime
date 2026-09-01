<template>
  <n-space class="go-mt-0" :wrap="false">
    <n-button v-for="item in comBtnList" :key="item.title" :type="item.type" ghost @click="item.event">
      <template #icon>
        <component :is="item.icon"></component>
      </template>
      <span>{{ item.title }}</span>
    </n-button>
  </n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderIcon, fetchPathByName, routerTurnByPath, setSessionStorage, getSessionStorage } from '@/utils'
import { PreviewEnum } from '@/enums/pageEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { useRoute } from 'vue-router'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { syncData } from '../../ContentEdit/components/EditTools/hooks/useSyncUpdate.hook'
import { icon } from '@/plugins'
import { cloneDeep } from 'lodash'
import { updateProjectApi } from '@/api/project'

const { BrowsersOutlineIcon, SendIcon, AnalyticsIcon, CreateIcon } = icon.ionicons5
const chartEditStore = useChartEditStore()
const routerParamsInfo = useRoute()

// 保存
const saveHandle = async () => {
  const { id } = routerParamsInfo.params
  const projectId = typeof id === 'string' ? id : id?.[0]
  if (!projectId) return

  const storageInfo = chartEditStore.getStorageInfo()
  const projectName = chartEditStore.getEditCanvasConfig.projectName || '未命名大屏'

  try {
    const res: any = await updateProjectApi({
      id: projectId,
      name: projectName,
      content: JSON.stringify(storageInfo),
      status: 1
    })
    if (res && res.code === 0) {
      window['$message']?.success('大屏保存成功')
    } else {
      window['$message']?.warning(res?.msg || '保存响应异常')
    }
  } catch (e) {
    console.error('保存大屏失败', e)
  }
}

// 预览
const previewHandle = () => {
  const path = fetchPathByName(PreviewEnum.CHART_PREVIEW_NAME, 'href')
  if (!path) return
  const { id } = routerParamsInfo.params
  const previewId = typeof id === 'string' ? id : id[0]
  const storageInfo = chartEditStore.getStorageInfo()
  const sessionStorageInfo = getSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST) || []

  if (sessionStorageInfo?.length) {
    const repeateIndex = sessionStorageInfo.findIndex((e: { id: string }) => e.id === previewId)
    if (repeateIndex !== -1) {
      sessionStorageInfo.splice(repeateIndex, 1, { id: previewId, ...storageInfo })
      setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
    } else {
      sessionStorageInfo.push({
        id: previewId,
        ...storageInfo
      })
      setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
    }
  } else {
    setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, [{ id: previewId, ...storageInfo }])
  }
  routerTurnByPath(path, [previewId], undefined, true)
}

// 发布
const sendHandle = async () => {
  const { id } = routerParamsInfo.params
  const projectId = typeof id === 'string' ? id : id?.[0]
  if (!projectId) return

  const storageInfo = chartEditStore.getStorageInfo()
  const projectName = chartEditStore.getEditCanvasConfig.projectName || '未命名大屏'

  try {
    const res: any = await updateProjectApi({
      id: projectId,
      name: projectName,
      content: JSON.stringify(storageInfo),
      status: 0
    })
    if (res && res.code === 0) {
      window['$message']?.success('大屏已成功发布！')
    } else {
      window['$message']?.warning(res?.msg || '发布异常')
    }
  } catch (e) {
    console.error('发布失败', e)
  }
}

const btnList = [
  {
    select: true,
    title: '同步内容',
    type: 'primary',
    icon: renderIcon(AnalyticsIcon),
    event: syncData
  },
  {
    select: true,
    title: '保存',
    type: 'info',
    icon: renderIcon(CreateIcon),
    event: saveHandle
  },
  {
    select: true,
    title: '预览',
    icon: renderIcon(BrowsersOutlineIcon),
    event: previewHandle
  },
  {
    select: true,
    title: '发布',
    type: 'success',
    icon: renderIcon(SendIcon),
    event: sendHandle
  }
]

const comBtnList = computed(() => {
  if (chartEditStore.getEditCanvas.isCodeEdit) {
    return btnList
  }
  const cloneList = cloneDeep(btnList)
  cloneList.shift()
  return cloneList
})
</script>

<style lang="scss" scoped>
.align-center {
  margin-top: -4px;
}
</style>
