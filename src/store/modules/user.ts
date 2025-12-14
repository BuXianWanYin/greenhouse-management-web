import { defineStore } from 'pinia'
import { LanguageEnum } from '@/enums/appEnum'
import { router, setPageTitle } from '@/router'
import { UserInfo } from '@/types/store'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { getSysStorage } from '@/utils/storage'
import { MenuListType } from '@/types/menu'
import { AvatarImga } from '@/utils/utils'

/**
 * 用户状态接口
 */
interface UserState {
  language: LanguageEnum // 语言
  isLogin: boolean // 是否登录
  isLock: boolean // 是否锁屏
  lockPassword: string // 锁屏密码
  info: Partial<UserInfo> // 用户信息
  searchHistory: MenuListType[] // 搜索历史
  accessToken: string // 添加访问令牌
  refreshToken: string // 添加刷新令牌
}

/**
 * 用户状态管理 Store
 * 用于管理用户信息、登录状态、语言设置、搜索历史等
 */
export const useUserStore = defineStore({
  id: 'userStore',
  state: (): UserState => ({
    language: LanguageEnum.ZH,
    isLogin: false,
    isLock: false,
    lockPassword: '',
    info: {},
    searchHistory: [],
    accessToken: '',
    refreshToken: ''
  }),
  getters: {
    getUserInfo(): Partial<UserInfo> {
      return this.info
    },
    getSettingState() {
      return useSettingStore().$state
    },
    getWorktabState() {
      return useWorktabStore().$state
    }
  },
  actions: {
    /**
     * 初始化用户状态
     * 从本地存储中恢复用户信息、登录状态等
     */
    initState() {
      let sys = getSysStorage()

      if (sys) {
        try {
          sys = JSON.parse(sys)
          const { info, isLogin, language, searchHistory, isLock, lockPassword, refreshToken } =
            sys.user

          this.info = info || {}
          this.isLogin = isLogin || false
          this.isLock = isLock || false
          this.language = language || LanguageEnum.ZH
          this.searchHistory = searchHistory || []
          this.lockPassword = lockPassword || ''
          this.refreshToken = refreshToken || ''
          this.accessToken = localStorage.getItem('accessToken') || ''
          
          // 如果有token但没有登录状态，自动设置登录状态
          if (this.accessToken && !this.isLogin) {
            this.isLogin = true
          }
        } catch (error) {
          console.error('初始化用户状态失败:', error)
          // 如果解析失败，尝试从localStorage获取token
          this.accessToken = localStorage.getItem('accessToken') || ''
          if (this.accessToken) {
            this.isLogin = true
          }
        }
      } else {
        // 如果没有系统存储，尝试从localStorage获取token
        this.accessToken = localStorage.getItem('accessToken') || ''
        if (this.accessToken) {
          this.isLogin = true
        }
      }
    },
    // 用户数据持久化存储
    saveUserData() {
      saveStoreStorage({
        user: {
          info: this.info,
          isLogin: this.isLogin,
          language: this.language,
          isLock: this.isLock,
          lockPassword: this.lockPassword,
          searchHistory: this.searchHistory,
          refreshToken: this.refreshToken,
          worktab: this.getWorktabState,
          setting: this.getSettingState
        }
      })
    },
    /**
     * 设置用户信息
     * @param info 用户信息对象
     */
    setUserInfo(info: UserInfo) {
      info.avatar = AvatarImga(info.avatar) as string
      this.info = info
      this.saveUserData()
    },
    /**
     * 设置登录状态
     * @param isLogin 是否已登录
     */
    setLoginStatus(isLogin: boolean) {
      this.isLogin = isLogin
    },
    /**
     * 设置语言
     * @param lang 语言枚举值
     */
    setLanguage(lang: LanguageEnum) {
      setPageTitle(router.currentRoute.value)
      this.language = lang
    },
    /**
     * 设置搜索历史
     * @param list 搜索历史列表
     */
    setSearchHistory(list: Array<MenuListType>) {
      this.searchHistory = list
    },
    /**
     * 设置锁屏状态
     * @param isLock 是否锁屏
     */
    setLockStatus(isLock: boolean) {
      this.isLock = isLock
    },
    /**
     * 设置锁屏密码
     * @param password 锁屏密码
     */
    setLockPassword(password: string) {
      this.lockPassword = password
    },
    /**
     * 设置访问令牌和刷新令牌
     * @param accessToken 访问令牌
     * @param refreshToken 刷新令牌（可选）
     */
    setToken(accessToken: string, refreshToken?: string) {
      this.accessToken = accessToken
      if (refreshToken) {
        this.refreshToken = refreshToken
      }
      localStorage.setItem('accessToken', accessToken)
      this.saveUserData()
    },
    /**
     * 设置用户头像
     * @param url 头像地址
     */
    setAvatar(url: string) {
      this.info.avatar = AvatarImga(url)
    },
    /**
     * 用户登出
     * 清空用户信息、令牌，跳转到登录页
     */
    logOut() {
      setTimeout(() => {
        this.info = {}
        this.isLogin = false
        this.isLock = false
        this.lockPassword = ''
        this.accessToken = ''
        this.refreshToken = ''
        localStorage.removeItem('accessToken')
        useWorktabStore().opened = []
        this.saveUserData()
        sessionStorage.removeItem('iframeRoutes')
        router.push('/login')
      }, 300)
    }
  }
})

/**
 * 初始化版本号
 * @param version 版本号
 */
function initVersion(version: string) {
  const vs = localStorage.getItem('version')
  if (!vs) {
    localStorage.setItem('version', version)
  }
}

/**
 * 数据持久化存储
 * @param newData 要存储的新数据
 */
function saveStoreStorage<T>(newData: T) {
  const version = import.meta.env.VITE_VERSION
  initVersion(version)
  const vs = localStorage.getItem('version') || version
  const storedData = JSON.parse(localStorage.getItem(`sys-v${vs}`) || '{}')

  // 合并新数据与现有数据
  const mergedData = { ...storedData, ...newData }
  localStorage.setItem(`sys-v${vs}`, JSON.stringify(mergedData))
}
