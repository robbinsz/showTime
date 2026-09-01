import { StorageEnum } from '@/enums/storageEnum'
import { getLocalStorage } from '@/utils/storage'
import { cryptoDecode } from '@/utils/crypto'

/**
 * * 获取纯净的 AccessToken（兼容 GOVIEW_TOKEN、URL Search、Hash、父窗口跨窗读取及各种包装格式）
 */
export function getPureToken(): string {
  // 0. 优先读取同源注入的 GOVIEW_TOKEN
  try {
    const govToken = localStorage.getItem('GOVIEW_TOKEN')
    if (govToken && govToken !== 'undefined' && govToken !== 'null') {
      return govToken
    }
  } catch (e) {}

  // 1. 优先从 window.location.search 获取 (?accessToken=xxx)
  try {
    const searchParams = new URLSearchParams(window.location.search)
    const queryToken = searchParams.get('accessToken') || searchParams.get('token')
    if (queryToken && queryToken !== 'undefined' && queryToken !== 'null') {
      return queryToken
    }
  } catch (e) {}

  // 2. 从 window.location.hash 中提取 (#/path?accessToken=xxx)
  try {
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1]
      const hashParams = new URLSearchParams(hashQuery)
      const hashToken = hashParams.get('accessToken') || hashParams.get('token')
      if (hashToken && hashToken !== 'undefined' && hashToken !== 'null') {
        return hashToken
      }
    }
  } catch (e) {}

  // 3. 从同源父级窗口直接读取 localStorage（管理后台与 GoView 同源）
  try {
    if (window.parent && window.parent !== window && window.parent.localStorage) {
      const parentGov = window.parent.localStorage.getItem('GOVIEW_TOKEN')
      if (parentGov) return parentGov

      const parentRaw = window.parent.localStorage.getItem('ACCESS_TOKEN')
      if (parentRaw) {
        try {
          const parsed = JSON.parse(parentRaw)
          if (parsed && typeof parsed === 'object' && parsed.v) {
            return String(parsed.v)
          }
          if (typeof parsed === 'string') {
            return parsed
          }
        } catch (err) {
          return parentRaw
        }
        return parentRaw
      }
    }
  } catch (e) {}

  // 4. 从当前窗口 localStorage 读取 ACCESS_TOKEN
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

  // 5. 遍历 localStorage，提取任意有效的 token
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.toUpperCase().includes('TOKEN') || key.includes('wsCache'))) {
        const val = localStorage.getItem(key)
        if (val) {
          try {
            const parsed = JSON.parse(val)
            if (parsed?.v && typeof parsed.v === 'string' && parsed.v.length >= 16) {
              return parsed.v
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}

  // 6. 从 GoView 加密凭证中解析
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
