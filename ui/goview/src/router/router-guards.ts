import { Router } from 'vue-router'
import { PageEnum } from '@/enums/pageEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { setLocalStorage, cryptoEncode, getPureToken } from '@/utils'

export function createRouterGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // 1. 提取并同步 Token 到 GoView 缓存体系中
    const token = getPureToken()
    if (token) {
      localStorage.setItem('ACCESS_TOKEN', token)
      setLocalStorage(
        StorageEnum.GO_LOGIN_INFO_STORE,
        cryptoEncode(
          JSON.stringify({
            token: token,
            username: 'admin',
            nickName: '管理员'
          })
        )
      )
    }

    const Loading = window['$loading']
    Loading && Loading.start()

    // 2. 拦截并消除所有登录页跳转，深度融合统一进入大屏项目列表
    if (to.name === PageEnum.BASE_LOGIN_NAME || to.path === '/login') {
      return next({ name: PageEnum.BASE_HOME_ITEMS_NAME })
    }

    // 3. 顶级 /project 自动进入项目列表
    if (to.name === PageEnum.BASE_HOME_NAME || to.path === '/project' || to.path === '/') {
      return next({ name: PageEnum.BASE_HOME_ITEMS_NAME })
    }

    next()
  })

  router.afterEach((to) => {
    const Loading = window['$loading']
    document.title = (to?.meta?.title as string) || document.title
    Loading && Loading.finish()
  })

  router.onError((error) => {
    console.error('GoView 路由异常:', error)
  })
}