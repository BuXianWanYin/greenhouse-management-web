<template>
    <transition name="slide-fade">
        <div v-if="visible" class="chat-window">
            <div class="chat-header">
                <div class="header-content">
                    <div class="title-section">
                        <div class="title">智能助手</div>
                    </div>
                    <div class="close-btn" @click="$emit('close')">×</div>
                </div>
            </div>
            <div class="chat-body">
                <div class="messages" ref="messagesContainer">
                    <template v-for="(message, index) in messages" :key="index">
                        <!-- 时间分割线 -->
                        <div v-if="shouldShowTime(index)" class="time-divider">
                            <span class="date">{{ message.date }}</span>
                            <span class="time">{{ message.time }}</span>
                        </div>
                        <div :class="['message-wrapper', message.type, 'animate-in']"
                            :style="{ animationDelay: `${index * 0.1}s` }">
                            <div class="message-content">
                                <div v-if="message.text" class="text-content">
                                    <span v-if="message.isHistory" v-html="formatMessageText(message.text)"></span>
                                    <writer v-else :text="message.text" :delay="30"
                                        :start-delay="message.type === 'received' ? 500 : 0" @update="onWriterUpdate" />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <div class="chat-footer">
                <div class="input-wrapper">
                    <input v-model="inputMessage" @keyup.enter="sendMessage" type="text" placeholder="输入消息..." />
                    <button @click="sendMessage" class="send-btn">发送</button>
                </div>
            </div>
        </div>
    </transition>

</template>

<script setup lang="ts">
import writer from './writer.vue'
import { useSettingStore } from '@/store/modules/setting'
import { startSSE } from '@/utils/event'
import { nextTick, onUnmounted } from 'vue'
import { AgricultureRobotService } from '@/api/agriculture/robot'
import { useUserStore } from '@/store/modules/user'
import { onMounted,watch } from 'vue'

const settingStore = useSettingStore()
const systemThemeColor = computed(() => settingStore.systemThemeColor)

const userStore = useUserStore()

const sseController = new AbortController()

interface ChatMessage {
    text?: string
    type: 'sent' | 'received'
    time: string
    date: string
    isHistory?: boolean // Added isHistory field
}

/**
 * 获取当前时间并格式化为聊天消息所需的日期和时间字符串
 * @returns { date: 'X月X日', time: '上午/下午 H:MM' }
 * 用于生成新消息的时间显示（如用户发送或机器人回复时）
 */
const formatTime = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const period = hours < 12 ? '上午' : '下午'
    const displayHours = hours % 12 || 12
    return {
        date: `${month}月${date}日`,
        time: `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`
    }
}

/**
 * 根据时间戳格式化为聊天消息所需的日期和时间字符串
 * @param timestamp - 毫秒级时间戳（如 1700000000000）
 * @returns { date: 'X月X日', time: '上午/下午 H:MM' }
 * 用于将数据库存储的时间戳转为聊天界面友好的日期和时间显示
 */
const formatTimeFromTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours < 12 ? '上午' : '下午'
    const displayHours = hours % 12 || 12
    return {
        date: `${month}月${day}日`,
        time: `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`
    }
}

/**
 * 格式化消息文本，处理换行符和HTML标签
 * @param text - 原始消息文本
 * @returns 格式化后的HTML字符串
 */
const formatMessageText = (text: string): string => {
    if (!text) return ''
    
    // 将换行符转换为 <br> 标签
    let formattedText = text.replace(/\n/g, '<br>')
    
    // 处理连续的换行符，避免过多的空行
    formattedText = formattedText.replace(/<br><br><br>/g, '<br><br>')
    
    // 如果文本包含HTML标签，直接返回（假设是安全的）
    if (text.includes('<') && text.includes('>')) {
        return formattedText
    }
    
    return formattedText
}

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const inputMessage = ref('')
const messages = ref<ChatMessage[]>([
    {
        text: '你好！我是你的智能助手，有什么可以帮你的吗？',
        type: 'received',
        ...formatTime()
    }
])

const messagesContainer = ref<HTMLElement | null>(null)

const pageNum = ref(1)
const pageSize = 6
const hasMore = ref(true)
const isLoading = ref(false)

// 添加点击事件处理函数
const handleClickOutside = (event: MouseEvent) => {
  // 获取聊天窗口的 DOM 元素
  const chatWindow = document.querySelector('.chat-window')
  // 获取机器人容器的 DOM 元素（如果有的话）
  const botContainer = document.querySelector('#bot-container')
  // 判断点击的目标是否在聊天窗口或机器人容器之外
  // 1. chatWindow 存在且点击目标不在 chatWindow 内部
  // 2. botContainer 不存在，或者点击目标也不在 botContainer 内部
  if (
    chatWindow &&
    !chatWindow.contains(event.target as Node) && // 点击目标不在聊天窗口内
    (!botContainer || !botContainer.contains(event.target as Node)) // 没有 botContainer 或点击目标也不在 botContainer 内
  ) {
    // 如果点击在窗口外部，则触发关闭事件
    emit('close')
  }
}

// 绑定和解绑
onMounted(() => {
  // 组件挂载时，给 document 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        pageNum.value = 1
        hasMore.value = true
        loadMessages(false).then(() => {
          // nextTick后再绑定scroll事件
          nextTick(() => {
            if (messagesContainer.value) {
              messagesContainer.value.removeEventListener('scroll', onScroll) // 防止重复绑定
              messagesContainer.value.addEventListener('scroll', onScroll)
            }
          })
        })
      } else {
        // 关闭时解绑
        if (messagesContainer.value) {
          messagesContainer.value.removeEventListener('scroll', onScroll)
        }
      }
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  sseController.abort()
})

const shouldShowTime = (index: number): boolean => {
    if (index === 0) return true
    const currentMessage = messages.value[index]
    const prevMessage = messages.value[index - 1]
    return currentMessage.date !== prevMessage.date ||
        (currentMessage.date === prevMessage.date && currentMessage.time !== prevMessage.time)
}

// 滚动消息区域到底部，保证最新消息可见
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTo({
            top: messagesContainer.value.scrollHeight,
            behavior: 'smooth'
        });
    }
}

const loadMessages = async (isLoadMore = false) => {
  const res = await AgricultureRobotService.listInfo({
    userId: userStore.getUserInfo.id,
    pageNum: pageNum.value,
    pageSize
  })
  if (res && res.rows) {
    const newMsgs = res.rows.map(item => ({
      text: item.content,
      type: item.type === 'user' ? 'sent' : 'received',
      time: formatTimeFromTimestamp(Number(item.timestamp)).time,
      date: formatTimeFromTimestamp(Number(item.timestamp)).date,
      isHistory: true
    })) as ChatMessage[] // 强制类型
    if (isLoadMore) {
      // 懒加载，插入到头部，保持滚动位置
      const oldHeight = messagesContainer.value?.scrollHeight || 0
      messages.value = [...newMsgs.reverse(), ...messages.value]
      await nextTick()
      if (messagesContainer.value) {
        const newHeight = messagesContainer.value.scrollHeight
        messagesContainer.value.scrollTop = newHeight - oldHeight
      }
    } else {
      // 首次加载，直接滚动到底部
      messages.value = newMsgs.reverse()
      console.log('messages', messages.value.map(m => m.time))
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }
    hasMore.value = res.total > messages.value.length
  }
}

const onScroll = () => {
  if (!hasMore.value || isLoading.value) return
  if (messagesContainer.value && messagesContainer.value.scrollTop < 50) {
    isLoading.value = true
    pageNum.value += 1
    loadMessages(true).finally(() => {
      isLoading.value = false
    })
  }
}

// 只在DOM渲染后绑定scroll事件
const setupScrollListener = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.removeEventListener('scroll', onScroll)
      messagesContainer.value.addEventListener('scroll', onScroll)
    }
  })
}

const removeScrollListener = () => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', onScroll)
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    pageNum.value = 1
    hasMore.value = true
    loadMessages(false).then(setupScrollListener)
  } else {
    removeScrollListener()
  }
})


const onWriterUpdate = () => {
    nextTick(() => {
        scrollToBottom();
    });
};

// 发送消息（用户提问和机器人回复）
const sendMessage = async () => {
    if (!inputMessage.value.trim()) return

    const timeInfo = formatTime()
    const messageData: ChatMessage = {
        type: 'sent',
        text: inputMessage.value.trim(),
        ...timeInfo,
        isHistory: false
    }

    messages.value.push(messageData);

    // 存储用户消息
    AgricultureRobotService.addRobot({
        type: 'user',
        content: inputMessage.value.trim(),  // 消息内容，保留换行符
        userId: userStore.getUserInfo.id,  // 用户id
        timestamp: Date.now()  // 时间戳
    })

    const botMsgIndex = messages.value.length;
    messages.value.push({
        text: '',
        type: 'received',
        ...formatTime()
    });

    // 用于累加机器人完整回复内容
    let botResponse = ''
    startSSE.post({
        url: '/agriculture/ai/chatStream',
        data: {
            prompt: inputMessage.value.trim()
        },
        container: sseController,
        // 每收到一段 bot 回复时触发
        onMessage: (data) => {
            if (messages.value[botMsgIndex].text != undefined) {
                // 拼接到消息展示
                messages.value[botMsgIndex].text += data.response
                // 累加到 botResponse，等待流结束后统一存储
                botResponse += data.response
            }
        },
        // SSE 连接关闭时（即 bot 回复完整时）触发
        onClose: () => {
            // 只在 bot 回复完整后存一次到数据库，保留换行符
            AgricultureRobotService.addRobot({
                type: 'bot',
                content: botResponse,
                userId: userStore.getUserInfo.id,
                timestamp: Date.now()
            })
            // 清空累加内容，准备下次使用
            botResponse = ''
        }
    });

    inputMessage.value = ''
}
</script>

<style lang="scss" scoped>
.chat-window {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 450px;
    height: 680px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    z-index: 999;
    overflow: hidden;
    transition: all 0.3s ease;
}

.chat-header {
    padding: 16px 20px;
    background: v-bind(systemThemeColor);
    color: white;
    box-shadow: 0 2px 12px v-bind('`${systemThemeColor}26`');
    animation: gradientFlow 10s ease infinite;
    background-size: 200% 200%;

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .title {
        font-size: 18px;
        font-weight: 600;
    }

    .pending-count {
        font-size: 13px;
        opacity: 0.9;
        display: flex;
        gap: 4px;
        align-items: center;

        .count {
            background: rgba(255, 255, 255, 0.2);
            padding: 0 6px;
            border-radius: 10px;
            font-size: 12px;
        }
    }

    .close-btn {
        cursor: pointer;
        font-size: 24px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.3s;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }
}

.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f8f9fa;
    /* 隐藏滚动条但保留滑动功能 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;

    /* IE 10+ */
    &::-webkit-scrollbar {
        display: none;
        /* Chrome/Safari/Webkit */
    }

    .time-divider {
        text-align: center;
        margin: 16px 0;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;

        .date {
            font-size: 13px;
            color: #666;
            background: #f8f9fa;
            padding: 4px 12px;
            border-radius: 12px;
            margin-bottom: 4px;
            transform: translateY(0);
            transition: transform 0.3s ease;
            animation: fadeInDown 0.5s ease forwards;

            &:hover {
                transform: translateY(-2px);
            }
        }

        .time {
            font-size: 12px;
            color: #999;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: fadeInUp 0.5s ease forwards;

            &::before,
            &::after {
                content: '';
                width: 24px;
                height: 1px;
                background: #e0e0e0;
            }
        }
    }

    .messages {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
        overflow-y: auto;

        /* 隐藏滚动条但保留滚动功能 */
        scrollbar-width: none;
        /* Firefox */
        -ms-overflow-style: none;
        /* IE 10+ */

        &::-webkit-scrollbar {
            display: none;
            /* Chrome/Safari/Webkit */
        }
    }

    .message-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 85%;
        margin: 4px 0;
        transform-origin: left center;
        opacity: 0;
        transform: translateY(20px);

        &.animate-in {
            animation: messageIn 0.5s ease forwards;
        }

        &.sent {
            align-self: flex-end;
            transform-origin: right center;

            .message-content {
                background: v-bind(systemThemeColor);
                color: white;
                border-radius: 18px 18px 4px 18px;
                box-shadow: 0 2px 8px v-bind('`${systemThemeColor}26`');
                position: relative;
                overflow: hidden;

                &::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transform: translateX(-100%);
                    animation: shine 3s infinite;
                }
            }
        }

        &.received {
            align-self: flex-start;

            .message-content {
                background: white;
                color: #333;
                border-radius: 18px 18px 18px 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                position: relative;
                overflow: hidden;

                &::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, #24c6dc, #5433ff);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease;
                }

                &:hover::after {
                    transform: scaleX(1);
                }
            }
        }
    }

    .message-content {
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.6;
        word-break: break-word;
        letter-spacing: 0.3px;

        .text-content {
            margin-bottom: 8px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

    }

    .message-time {
        font-size: 12px;
        color: #999;
        padding: 0 4px;
    }
}

    .chat-footer {
    padding: 16px;
    background: white;
    border-top: 1px solid #eee;

    .input-wrapper {
        display: flex;
        gap: 8px;
        background: #f8f9fa;
        padding: 8px;
        border-radius: 24px;
    }

    input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 8px 12px;
        outline: none;
        font-size: 14px;

        &::placeholder {
            color: #999;
        }
    }

    .send-btn {
        padding: 8px 20px;
        background: v-bind(systemThemeColor);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 150%;
            height: 150%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
            transition: transform 0.5s ease, opacity 0.5s ease;
        }

        &:hover {
            transform: translateY(-2px);

            &::before {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
    }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}


@keyframes messageIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shine {
    0% {
        transform: translateX(-100%);
    }

    20% {
        transform: translateX(100%);
    }

    100% {
        transform: translateX(100%);
    }
}

@keyframes gradientFlow {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>