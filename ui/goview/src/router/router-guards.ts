import { Router } from 'vue-router'
import { PageEnum } from '@/enums/pageEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { loginCheck, setLocalStorage, cryptoEncode } from '@/utils'

export function createRouterGuards(router: Router) {
  // 前置
  router.beforeEach(async (to, from, next) => {
    // 处理动态参数
    // @ts-ignore
    if (!window.route) window.route = { params: {} }
    // @ts-ignore
    Object.assign(window.route.params, to.query)

    // 1. 处理来自管理端单点登录 (SSO) 传入的 accessToken / token
    const accessToken = (to.query.accessToken || to.query.token) as string | undefined
    const refreshToken = (to.query.refreshToken) as string | undefined

    if (accessToken) {
      localStorage.setItem('ACCESS_TOKEN', accessToken)
      if (refreshToken) {
        localStorage.setItem('REFRESH_TOKEN', refreshToken)
      }
      // 同步设置 GoView 登录凭证缓存，避免旧组件读取异常
      setLocalStorage(
        StorageEnum.GO_LOGIN_INFO_STORE,
        cryptoEncode({
          token: accessToken,
          username: 'admin',
          nickName: '管理员'
        })
      )
    }

    const Loading = window['$loading']
    Loading && Loading.start()

    const isErrorPage = router.getRoutes().findIndex(item => item.name === to.name)
    if (isErrorPage === -1) {
      return next({ name: PageEnum.ERROR_PAGE_NAME_404 })
    }

    // 2. 判断登录态
    const isLogin = loginCheck()
    if (!isLogin) {
      if (to.name === PageEnum.BASE_LOGIN_NAME) {
        return next()
      }
      return next({ name: PageEnum.BASE_LOGIN_NAME })
    }

    // 3. 已登录状态下访问登录页，直接跳转主页
    if (to.name === PageEnum.BASE_LOGIN_NAME) {
      return next({ name: PageEnum.BASE_HOME_NAME })
    }

    next()
  })

  router.afterEach((to, _, failure) => {
    const Loading = window['$loading']
    document.title = (to?.meta?.title as string) || document.title
    Loading && Loading.finish()
  })

  // 错误
  router.onError(error => {
    console.log(error, '路由错误')
  })
}