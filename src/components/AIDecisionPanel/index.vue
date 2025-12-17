<template>
  <el-card class="ai-decision-panel" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="title">
          <el-icon><MagicStick /></el-icon>
          AI智能建议
        </span>
        <el-button
          link
          type="primary"
          :icon="Refresh"
          :loading="loading"
          @click="handleRefresh"
          size="small"
          :disabled="loading"
        >{{ loading ? '分析中...' : '刷新' }}</el-button>
      </div>
    </template>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <div class="loading-text">
          <p class="main-text">AI正在分析数据并生成建议...</p>
          <p class="sub-text">预计需要1-2分钟，您可以继续进行其他操作</p>
          <p class="timer-text" v-if="elapsedTime > 0">已等待 {{ formatElapsedTime(elapsedTime) }}</p>
        </div>
      </div>
      <el-skeleton :rows="3" animated style="margin-top: 20px;" />
    </div>
    
    <div v-else-if="suggestion" class="suggestion-content">
      <div class="suggestion-text" v-html="formatSuggestion(suggestion)"></div>
    </div>
    
    <el-empty v-else description="暂无AI建议，点击刷新按钮获取" :image-size="80" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { MagicStick, Refresh, Loading } from '@element-plus/icons-vue'
import { AgricultureDecisionService } from '@/api/agriculture/decisionApi'

const props = defineProps<{
  type: 'plan' | 'personnel' | 'environment' | 'resource' | 'alert'
  targetId?: number | string
  autoLoad?: boolean
}>()

const loading = ref(false)
const suggestion = ref<string>('')
const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

// 启动计时器
const startTimer = () => {
  elapsedTime.value = 0
  timerInterval = setInterval(() => {
    elapsedTime.value++
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 格式化已用时间
const formatElapsedTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins}分${secs}秒`
  }
  return `${secs}秒`
}

// 加载建议
const loadSuggestion = async () => {
  // resource类型时，targetId可以为空（表示分析所有资源）
  if (props.type !== 'resource' && !props.targetId) {
    return
  }
  
  loading.value = true
  startTimer()
  
  // 显示通知提示用户可以进行其他操作
  ElNotification({
    title: 'AI分析已开始',
    message: '正在调用DeepSeek AI生成建议，预计需要1-2分钟。您可以继续进行其他操作，分析完成后会自动显示结果。',
    type: 'success',
    duration: 5000
  })
  
  try {
    let res
    switch (props.type) {
      case 'plan':
        res = await AgricultureDecisionService.generatePlanSuggestions(props.targetId!)
        break
      case 'personnel':
        res = await AgricultureDecisionService.recommendEmployees(props.targetId!)
        break
      case 'environment':
        res = await AgricultureDecisionService.generateEnvironmentSuggestions(props.targetId!)
        break
      case 'resource':
        res = await AgricultureDecisionService.generateResourceSuggestions(props.targetId)
        break
      case 'alert':
        res = await AgricultureDecisionService.generateAlertHandlingSuggestions(props.targetId!)
        break
      default:
        return
    }
    
    if (res.code === 200 && res.data) {
      suggestion.value = res.data
      ElNotification({
        title: 'AI分析完成',
        message: '智能建议已生成，请查看结果。',
        type: 'success',
        duration: 3000
      })
    } else {
      ElMessage.error(res.msg || '获取AI建议失败')
    }
  } catch (error: any) {
    console.error('获取AI建议失败:', error)
    // 区分超时错误和其他错误
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      ElMessage.error('AI分析超时，请稍后重试')
    } else {
      ElMessage.error(error.message || '获取AI建议失败')
    }
  } finally {
    loading.value = false
    stopTimer()
  }
}

// 刷新建议
const handleRefresh = () => {
  if (loading.value) return
  loadSuggestion()
}

// 组件卸载时清理计时器
onUnmounted(() => {
  stopTimer()
})

// 格式化建议文本（将换行符转换为HTML）
const formatSuggestion = (text: string) => {
  if (!text) return ''
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

// 监听targetId变化
watch(
  () => props.targetId,
  (newId) => {
    if (newId && props.autoLoad !== false) {
      loadSuggestion()
    }
  },
  { immediate: true }
)

// 暴露 loadSuggestion 方法供父组件调用
defineExpose({
  loadSuggestion
})
</script>

<style lang="scss" scoped>
.ai-decision-panel {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 16px;
    }
  }

  .loading-container {
    padding: 20px;

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px;
      border: 1px dashed var(--el-color-primary-light-5);

      .loading-icon {
        color: var(--el-color-primary);
        animation: spin 1.5s linear infinite;
        margin-bottom: 16px;
      }

      .loading-text {
        text-align: center;

        .main-text {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin: 0 0 8px 0;
        }

        .sub-text {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin: 0 0 8px 0;
        }

        .timer-text {
          font-size: 13px;
          color: var(--el-color-primary);
          margin: 0;
          font-weight: 500;
        }
      }
    }
  }

  .suggestion-content {
    padding: 16px;
    min-height: 100px;

    .suggestion-text {
      line-height: 1.8;
      color: var(--el-text-color-primary);
      white-space: pre-wrap;
      word-break: break-word;

      :deep(strong) {
        color: var(--el-color-primary);
        font-weight: 600;
      }

      :deep(em) {
        color: var(--el-text-color-regular);
        font-style: italic;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

