import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { ResultEnum } from '@/enums/httpEnum'
import { ErrorPageNameMap, PageEnum } from '@/enums/pageEnum'
import { redirectErrorPage, getLocalStorage, cryptoDecode } from '@/utils'
import { StorageEnum } from '@/enums/storageEnum'

const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? import.meta.env.VITE_DEV_PATH : import.meta.env.VITE_PRO_PATH,
  timeout: ResultEnum.TIMEOUT
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 优先读取 ACCESS_TOKEN，其次读取 GO_LOGIN_INFO_STORE
    let token = localStorage.getItem('ACCESS_TOKEN')
    if (!token) {
      try {
        const info = getLocalStorage(StorageEnum.GO_LOGIN_INFO_STORE)
        if (info) {
          const decodeInfo = cryptoDecode(info)
          token = decodeInfo?.token
        }
      } catch (e) {}
    }

    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 默认租户
    config.headers['tenant-id'] = '1'
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const data = res.data
    if (data && typeof data === 'object') {
      const { code, msg } = data as { code: number; msg: string }
      // ruoyi-vue-pro 后端规范：code === 0 为成功
      if (code === 0 || code === 200) {
        return Promise.resolve(data)
      }
      // 401 未登录 / token 过期
      if (code === 401) {
        localStorage.removeItem('ACCESS_TOKEN')
        localStorage.removeItem('REFRESH_TOKEN')
        if (window['$message']) {
          window['$message'].error(msg || '登录已过期，请重新登录')
        }
        return Promise.reject(data)
      }
      // 其他业务错误统一提示
      if (code !== undefined && code !== null && code !== 0 && code !== 200) {
        if (window['$message']) {
          window['$message'].error(msg || '请求处理失败')
        }
      }
    }
    return Promise.resolve(res.data)
  },
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ACCESS_TOKEN')
      localStorage.removeItem('REFRESH_TOKEN')
    }
    return Promise.reject(err)
  }
)

export default axiosInstance
