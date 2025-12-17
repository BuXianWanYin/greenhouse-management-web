<template>
  <div class="alert-list">
    <div v-if="alerts.length === 0" class="empty-tips">
      <i class="iconfont-sys">&#xe8d7;</i>
      <p>暂无预警</p>
    </div>
    <div v-else class="alert-items">
      <div
        v-for="alert in alerts"
        :key="alert.alertId"
        class="alert-item"
        :class="getAlertLevelClass(alert.alertLevel)"
      >
        <div class="alert-icon">
          <el-icon :size="20" :color="getAlertLevelColor(alert.alertLevel)">
            <Bell />
          </el-icon>
        </div>
        <div class="alert-content">
          <div class="alert-title">{{ alert.alertTitle }}</div>
          <div class="alert-message">{{ alert.alertMessage }}</div>
          <div class="alert-meta">
            <span class="alert-time">{{ formatTime(alert.alertTime) }}</span>
            <span v-if="alert.pastureName" class="alert-pasture">{{ alert.pastureName }}</span>
          </div>
        </div>
        <div class="alert-actions">
          <el-button
            link
            type="primary"
            size="small"
            @click="$emit('handle', alert)"
          >处理</el-button>
          <el-button
            link
            type="info"
            size="small"
            @click="$emit('ignore', alert)"
          >忽略</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bell } from '@element-plus/icons-vue'
import { AgricultureAlertResult } from '@/types/agriculture/alert'

const props = defineProps<{
  alerts: AgricultureAlertResult[]
}>()

defineEmits<{
  handle: [alert: AgricultureAlertResult]
  ignore: [alert: AgricultureAlertResult]
}>()

const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAlertLevelClass = (level: number) => {
  const levelMap: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'danger',
    3: 'critical'
  }
  return levelMap[level] || 'info'
}

const getAlertLevelColor = (level: number) => {
  const colorMap: Record<number, string> = {
    0: '#909399',
    1: '#E6A23C',
    2: '#F56C6C',
    3: '#F56C6C'
  }
  return colorMap[level] || '#909399'
}
</script>

<style lang="scss" scoped>
.alert-list {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;

  .empty-tips {
    padding: 40px 20px;
    text-align: center;
    color: var(--el-text-color-secondary);

    i {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
      opacity: 0.5;
    }
  }

  .alert-items {
    .alert-item {
      display: flex;
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.info {
        border-left: 3px solid #909399;
      }

      &.warning {
        border-left: 3px solid #E6A23C;
      }

      &.danger {
        border-left: 3px solid #F56C6C;
      }

      &.critical {
        border-left: 3px solid #F56C6C;
      }

      .alert-icon {
        margin-right: 12px;
        display: flex;
        align-items: flex-start;
        padding-top: 2px;
      }

      .alert-content {
        flex: 1;
        min-width: 0;

        .alert-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
          color: var(--el-text-color-primary);
        }

        .alert-message {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-bottom: 6px;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .alert-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: var(--el-text-color-secondary);

          .alert-pasture {
            &::before {
              content: '·';
              margin-right: 4px;
            }
          }
        }
      }

      .alert-actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-left: 8px;
      }
    }
  }
}
</style>

