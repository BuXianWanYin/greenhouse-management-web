/**
 * API 状态码枚举
 * 定义常用的 HTTP 状态码和自定义状态码
 */
export enum ApiStatus {
  success = 200, // 请求成功
  error = 500, // 服务器内部错误
  unauthorized = 401, // 未授权，需要登录
  forbidden = 403, // 禁止访问，权限不足
  notFound = 404, // 资源未找到
  timeout = 408, // 请求超时
  conflict = 409, // 请求冲突
  tooManyRequests = 429, // 请求过于频繁
  warning = 601 // 自定义警告状态码
}
