import { http } from '@/api/http'
import { RequestHttpEnum } from '@/enums/httpEnum'

export interface ProjectItem {
  id: number | string
  name: string
  picUrl?: string
  content?: string
  status?: number // 0-已发布 1-未发布
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

// 获得我的项目分页
export const getMyProjectPageApi = (params: { pageNo: number; pageSize: number }) => {
  return http(RequestHttpEnum.GET)('/admin-api/report/go-view/project/my-page', params)
}

// 获得项目详情
export const getProjectApi = (id: number | string) => {
  return http(RequestHttpEnum.GET)('/admin-api/report/go-view/project/get', { id })
}

// 创建项目
export const createProjectApi = (data: { name: string; picUrl?: string; content?: string; remark?: string }) => {
  return http(RequestHttpEnum.POST)('/admin-api/report/go-view/project/create', data)
}

// 更新项目（含保存画布 content）
export const updateProjectApi = (data: {
  id: number | string
  name?: string
  picUrl?: string
  content?: string
  status?: number
  remark?: string
}) => {
  return http(RequestHttpEnum.PUT)('/admin-api/report/go-view/project/update', data)
}

// 删除项目
export const deleteProjectApi = (id: number | string) => {
  return http(RequestHttpEnum.DELETE)('/admin-api/report/go-view/project/delete', { id })
}
