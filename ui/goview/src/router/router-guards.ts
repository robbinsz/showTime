import { Router } from 'vue-router'
import { PageEnum } from '@/enums/pageEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { loginCheck, setLocalStorage, cryptoEncode, getPureToken } from '@/utils'

export function createRouterGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // 1. 提取并同步 Token
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

    // 2. 检查是否已登录
    const isLogin = loginCheck()
    if (!isLogin) {
      if (to.name === PageEnum.BASE_LOGIN_NAME) {
        return next()
      }
      return next({ name: PageEnum.BASE_LOGIN_NAME })
    }

    // 3. 已登录时，若访问登录页，直接跳转到项目列表页
    if (to.name === PageEnum.BASE_LOGIN_NAME) {
      return next({ name: PageEnum.BASE_HOME_ITEMS_NAME })
    }

    // 4. 若访问顶级 /project，直接跳转到项目列表
    if (to.name === PageEnum.BASE_HOME_NAME || to.path === '/project') {
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