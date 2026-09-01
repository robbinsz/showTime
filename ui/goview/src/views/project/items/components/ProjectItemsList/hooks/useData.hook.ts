import { ref, onMounted } from 'vue'
import { goDialog } from '@/utils'
import { DialogEnum } from '@/enums/pluginEnum'
import { getMyProjectPageApi, deleteProjectApi, updateProjectApi } from '@/api/project'

export interface ProjectCardItem {
  id: string | number
  title: string
  release: boolean
  label?: string
  picUrl?: string
  createTime?: string
}

// 数据初始化
export const useDataListInit = () => {
  const list = ref<ProjectCardItem[]>([])
  const loading = ref(false)
  const pageNo = ref(1)
  const pageSize = ref(20)
  const total = ref(0)

  // 获取后端项目列表
  const fetchList = async () => {
    loading.value = true
    try {
      const res: any = await getMyProjectPageApi({
        pageNo: pageNo.value,
        pageSize: pageSize.value
      })
      if (res && res.code === 0 && res.data) {
        const rawList = res.data.list || []
        total.value = res.data.total || 0
        list.value = rawList.map((item: any) => ({
          id: item.id,
          title: item.name || '未命名大屏',
          release: item.status === 0,
          label: '大屏项目',
          picUrl: item.picUrl,
          createTime: item.createTime
        }))
      }
    } catch (e) {
      console.error('获取大屏项目列表失败', e)
    } finally {
      loading.value = false
    }
  }

  // 删除
  const deleteHandle = (cardData: any, index: number) => {
    goDialog({
      type: DialogEnum.DELETE,
      promise: true,
      onPositiveCallback: async () => {
        try {
          const res: any = await deleteProjectApi(cardData.id)
          if (res && res.code === 0) {
            return true
          }
          throw new Error(res?.msg || '删除失败')
        } catch (e: any) {
          window['$message']?.error(e?.message || '删除失败')
          throw e
        }
      },
      promiseResCallback: () => {
        window['$message']?.success('删除成功')
        list.value.splice(index, 1)
        total.value = Math.max(0, total.value - 1)
      }
    })
  }

  // 发布状态切换
  const toggleRelease = async (cardData: any) => {
    const nextStatus = cardData.release ? 1 : 0
    try {
      const res: any = await updateProjectApi({
        id: cardData.id,
        status: nextStatus
      })
      if (res && res.code === 0) {
        cardData.release = !cardData.release
        window['$message']?.success(cardData.release ? '发布成功' : '已取消发布')
      }
    } catch (e) {
      window['$message']?.error('操作失败')
    }
  }

  onMounted(() => {
    fetchList()
  })

  return {
    list,
    loading,
    pageNo,
    pageSize,
    total,
    fetchList,
    deleteHandle,
    toggleRelease
  }
}
