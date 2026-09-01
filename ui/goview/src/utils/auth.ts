import { StorageEnum } from '@/enums/storageEnum'
import { getLocalStorage } from '@/utils/storage'
import { cryptoDecode } from '@/utils/crypto'

/**
 * * 获取纯净的 AccessToken（兼容 URL Search、URL Hash、web-storage-cache 包装及 GoView 加密存储）
 */
export function getPureToken(): string {
  // 1. 优先从 window.location.search 获取 (?accessToken=xxx)
  try {
    const searchParams = new URLSearchParams(window.location.search)
    const queryToken = searchParams.get('accessToken') || searchParams.get('token')
    if (queryToken) {
      return queryToken
    }
  } catch (e) {}

  // 2. 从 window.location.hash 中提取 (#/path?accessToken=xxx)
  try {
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1]
      const hashParams = new URLSearchParams(hashQuery)
      const hashToken = hashParams.get('accessToken') || hashParams.get('token')
      if (hashToken) {
        return hashToken
      }
    }
  } catch (e) {}

  // 3. 从 localStorage 读取并解析可能存在的 web-storage-cache 结构
  try {
    const raw = localStorage.getItem('ACCESS_TOKEN')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && parsed.v) {
          return String(parsed.v)
        }
        if (typeof parsed === 'string') {
          return parsed
        }
      } catch (err) {
        return raw
      }
      return raw
    }
  } catch (e) {}

  // 4. 从 GoView 加密凭证中解析
  try {
    const info = getLocalStorage(StorageEnum.GO_LOGIN_INFO_STORE)
    if (info) {
      const decryptedStr = cryptoDecode(info)
      if (decryptedStr) {
        const decodeInfo = JSON.parse(decryptedStr)
        if (decodeInfo?.token) {
          return decodeInfo.token
        }
      }
    }
  } catch (e) {}

  return ''
}
