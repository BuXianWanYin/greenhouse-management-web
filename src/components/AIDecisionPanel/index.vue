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
        >刷新</el-button>
      </div>
    </template>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="suggestion" class="suggestion-content">
      <div class="suggestion-text" v-html="formatSuggestion(suggestion)"></div>
    </div>
    
    <el-empty v-else description="暂无AI建议" :image-size="80" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Refresh } from '@element-plus/icons-vue'
import { AgricultureDecisionService } from '@/api/agriculture/decisionApi'

const props = defineProps<{
  type: 'plan' | 'personnel' | 'environment' | 'resource' | 'alert'
  targetId?: number | string
  autoLoad?: boolean
}>()

const loading = ref(false)
const suggestion = ref<string>('')

// 加载建议
const loadSuggestion = async () => {
  // resource类型时，targetId可以为空（表示分析所有资源）
  if (props.type !== 'resource' && !props.targetId) {
    return
  }
  
  loading.value = true
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
    } else {
      ElMessage.error(res.msg || '获取AI建议失败')
    }
  } catch (error: any) {
    console.error('获取AI建议失败:', error)
    ElMessage.error(error.message || '获取AI建议失败')
  } finally {
    loading.value = false
  }
}

// 刷新建议
const handleRefresh = () => {
  loadSuggestion()
}

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
</style>

