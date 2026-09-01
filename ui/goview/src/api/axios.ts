import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { ResultEnum } from '@/enums/httpEnum'
import { getPureToken } from '@/utils/auth'

const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? import.meta.env.VITE_DEV_PATH : import.meta.env.VITE_PRO_PATH,
  timeout: ResultEnum.TIMEOUT
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getPureToken()
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
      // 401 提示
      if (code === 401) {
        if (window['$message']) {
          window['$message'].warning(msg || '账号未登录或登录已过期，请在管理后台重新登录')
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
    return Promise.reject(err)
  }
)

export default axiosInstance
