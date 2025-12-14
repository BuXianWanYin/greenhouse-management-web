import axios, { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import EmojiText from '../emojo'
import errorCode from '@/utils/errorCode'
import { ApiStatus } from '@/utils/http/status'
import { tansParams } from '@/utils/utils'

/**
 * 是否正在显示重新登录弹窗
 * 用于防止重复弹出登录提示
 */
let isReloginShow = false

/**
 * 创建 Axios 实例
 * 配置请求和响应的默认行为
 */ 
const axiosInstance = axios.create({
  timeout: 15000, // 请求超时时间(毫秒)
  baseURL: import.meta.env.VITE_API_BASE_URL, // API地址
  withCredentials: true, // 异步请求携带cookie
  /**
   * 请求数据转换器
   * 将请求数据转换为 JSON 字符串，form-urlencoded 格式除外
   */
  transformRequest: [
    (data, headers) => {
      const contentType = headers['Content-Type'] as string
      // 如果是 form-urlencoded 格式，直接返回数据
      if (contentType && contentType.includes('x-www-form-urlencoded')) {
        try {
          return data
        } catch {
          return JSON.stringify(data)
        }
      }
      // 其他情况转换为 JSON 字符串
      return JSON.stringify(data)
    }
  ],
  /**
   * 状态码验证函数
   * 只接受 2xx 范围内的状态码为成功
   */
  validateStatus: (status) => status >= 200 && status < 300,
  /**
   * 默认请求头配置
   * 根据不同的请求方法设置不同的 Content-Type
   */
  headers: {
    get: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, // GET 请求使用 form-urlencoded
    post: { 'Content-Type': 'application/json;charset=utf-8' }, // POST 请求使用 JSON
    put: { 'Content-Type': 'application/json;charset=utf-8' } // PUT 请求使用 JSON
  },
  /**
   * 响应数据转换器
   * 将 JSON 格式的响应数据解析为对象
   */
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      // 如果是 JSON 格式，解析为对象
      if (contentType && contentType.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/**
 * 请求拦截器
 * 在发送请求之前添加认证 token
 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    // 如果 token 存在，则设置请求头
    if (accessToken) {
      request.headers.set({
        Authorization: accessToken
      })
    }

    return request // 返回修改后的配置
  },
  (error) => {
    // 请求配置错误时显示错误消息
    ElMessage.error(`服务器异常！ ${EmojiText[ApiStatus.error]}`)
    return Promise.reject(error) // 返回拒绝的 Promise
  }
)

/**
 * 响应拦截器
 * 统一处理响应数据，根据状态码进行不同的处理
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 未设置状态码则默认成功状态
    const code = response.data.code || ApiStatus.success
    // 获取错误信息，优先使用错误码映射，其次使用响应消息，最后使用默认消息
    const msg =
      errorCode[code as keyof typeof errorCode] || response.data.msg || errorCode['default']
    // 二进制数据（blob 或 arraybuffer）则直接返回，不进行解析
    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer'
    ) {
      return response
    }
    // 处理 401 未授权状态
    if (code === 401) {
      // 防止重复弹出登录提示
      if (!isReloginShow) {
        isReloginShow = true
        // 显示登录过期确认框
        ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面或者重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          isReloginShow = false
          // 用户确认后执行登出操作
          useUserStore().logOut()
        }).catch(() => {
          isReloginShow = false
        })
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === ApiStatus.error) {
      // 处理 500 服务器错误
      ElMessage({ message: msg, type: 'error' })
      return Promise.reject(new Error(msg))
    } else if (code === ApiStatus.forbidden) {
      // 处理 403 禁止访问
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code === ApiStatus.warning) {
      // 处理自定义警告状态码 601
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code !== ApiStatus.success) {
      // 处理其他非成功状态码
      ElNotification.error({ title: msg })
      return Promise.reject('error')
    } else {
      // 请求成功，返回响应数据
      return Promise.resolve(response)
    }
  },
  (error) => {
    // 处理请求错误
    if (axios.isCancel(error)) {
      // 请求被取消（可能是重复请求）
      console.log('repeated request: ' + error.message)
    } else {
      // 获取错误消息，优先使用响应中的错误信息
      const errorMessage = error.response?.data.message
      ElMessage.error(
        errorMessage
          ? `${errorMessage} ${EmojiText[ApiStatus.error]}`
          : `请求超时或服务器异常！${EmojiText[ApiStatus.error]}`
      )
    }
    return Promise.reject(error)
  }
)

/**
 * 通用请求方法
 * @param config Axios 请求配置
 * @returns Promise<T> 返回响应数据
 */
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  // GET 请求将 params 参数转换为 URL 查询字符串
  if (config.method === 'GET' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1) // 移除末尾的 '&' 或 '?'
    config.params = {}
    config.url = url
  }
  try {
    const res = await axiosInstance.request<T>({ ...config })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      // 在这里处理 Axios 错误
    }
    return Promise.reject(e)
  }
}

/**
 * API 方法集合
 * 提供常用的 HTTP 请求方法封装
 */
const api = {
  /**
   * GET 请求
   * @param config 请求配置
   * @returns Promise<T> 返回响应数据
   */
  get<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'GET' })
  },
  /**
   * POST 请求
   * @param config 请求配置
   * @returns Promise<T> 返回响应数据
   */
  post<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'POST' })
  },
  /**
   * PUT 请求
   * @param config 请求配置
   * @returns Promise<T> 返回响应数据
   */
  put<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'PUT' })
  },
  /**
   * DELETE 请求
   * @param config 请求配置
   * @returns Promise<T> 返回响应数据
   */
  del<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'DELETE' })
  }
}

export default api
