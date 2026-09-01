<template>
  <!-- 工作台相关 -->
  <div class="go-chart">
    <n-layout>
      <layout-header-pro>
        <template #left>
          <header-left-btn></header-left-btn>
        </template>
        <template #center>
          <header-title></header-title>
        </template>
        <template #ri-left>
          <header-right-btn></header-right-btn>
        </template>
      </layout-header-pro>
      <n-layout-content content-style="overflow:hidden; display: flex">
        <div style="overflow:hidden; display: flex">
          <content-charts></content-charts>
          <content-layers></content-layers>
        </div>
        <content-configurations></content-configurations>
      </n-layout-content>
    </n-layout>
  </div>
  <!-- 右键 -->
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    size="small"
    :x="mousePosition.x"
    :y="mousePosition.y"
    :options="menuOptions"
    :show="chartEditStore.getRightMenuShow"
    :on-clickoutside="onClickOutSide"
    @select="handleMenuSelect"
  ></n-dropdown>
  <!-- 加载蒙层 -->
  <content-load></content-load>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { loadAsyncComponent } from '@/utils'
import { LayoutHeaderPro } from '@/layout/components/LayoutHeaderPro'
import { useContextMenu } from './hooks/useContextMenu.hook'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { useChartHistoryStore } from '@/store/modules/chartHistoryStore/chartHistoryStore'
import { getProjectApi } from '@/api/project'

const route = useRoute()
const chartHistoryStoreStore = useChartHistoryStore()
const chartEditStore = useChartEditStore()

// 记录初始化
chartHistoryStoreStore.canvasInit(chartEditStore.getEditCanvas)

const HeaderLeftBtn = loadAsyncComponent(() => import('./ContentHeader/headerLeftBtn/index.vue'))
const HeaderRightBtn = loadAsyncComponent(() => import('./ContentHeader/headerRightBtn/index.vue'))
const HeaderTitle = loadAsyncComponent(() => import('./ContentHeader/headerTitle/index.vue'))
const ContentLayers = loadAsyncComponent(() => import('./ContentLayers/index.vue'))
const ContentCharts = loadAsyncComponent(() => import('./ContentCharts/index.vue'))
const ContentConfigurations = loadAsyncComponent(() => import('./ContentConfigurations/index.vue'))
const ContentLoad = loadAsyncComponent(() => import('./ContentLoad/index.vue'))

// 从后端加载真实大屏配置
onMounted(async () => {
  const id = route.params.id
  const projectId = typeof id === 'string' ? id : (Array.isArray(id) ? id[0] : '')
  if (projectId) {
    try {
      const res: any = await getProjectApi(projectId)
      if (res && res.code === 0 && res.data) {
        if (res.data.name) {
          chartEditStore.setEditCanvasConfig('projectName', res.data.name)
        }
        if (res.data.content) {
          const contentObj = typeof res.data.content === 'string' ? JSON.parse(res.data.content) : res.data.content
          if (contentObj.editCanvasConfig) {
            chartEditStore.editCanvasConfig = Object.assign(chartEditStore.editCanvasConfig, contentObj.editCanvasConfig)
          }
          if (contentObj.componentList && Array.isArray(contentObj.componentList)) {
            chartEditStore.componentList = contentObj.componentList
          }
          if (contentObj.requestGlobalConfig) {
            chartEditStore.requestGlobalConfig = contentObj.requestGlobalConfig
          }
        }
      }
    } catch (e) {
      console.warn('从后端加载大屏失败，使用本地状态', e)
    }
  }
})

// 右键
const {
  menuOptions,
  onClickOutSide,
  mousePosition,
  handleMenuSelect
} = useContextMenu()
</script>

<style lang="scss" scoped>
@include go("chart") {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  @include background-image("background-image");
}
</style>
