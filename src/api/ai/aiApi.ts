import request from '@/utils/http'

// AI
class AiService {
  // 在线聊天
  static chatStream(data: object) {
    return request.post({
      url: '/agriculture/ai/chatStream',
      data: data
    })
  }
}

export default AiService
