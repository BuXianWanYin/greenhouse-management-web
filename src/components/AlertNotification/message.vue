<template>
  
</template>

<script lang="ts">
import type { AlertData } from '@/types/agriculture/alertData'

// 格式化时间工具方法
export const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生成通知消息内容
export const createNotificationMessage = (alert: AlertData) => {
  const levelColor = alert.alertLevel === 0 ? '#E6A23C' : '#F56C6C'
  const levelBg = alert.alertLevel === 0 ? 'rgba(230,162,60,0.08)' : 'rgba(245,108,108,0.08)'
  return `
    <div style="padding: 4px 0;">
      <div style="font-weight: bold; margin-bottom: 8px; color: ${levelColor}; font-size: 14px;">${alert.alertMessage}</div>
      <div style="background: ${levelBg}; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px;">
        <div style="color: #303133; line-height: 1.8; font-size: 12px;">🏠 温室: <b>${alert.pastureName || '未知温室'}</b></div>
        <div style="color: #606266; line-height: 1.8; font-size: 12px;">📡 设备: ${alert.deviceName}</div>
        <div style="color: #606266; line-height: 1.8; font-size: 12px;">📊 参数: ${alert.paramName} = <b style=\"color:${levelColor}\">${alert.paramValue}</b></div>
        <div style="color: #909399; line-height: 1.8; font-size: 12px;">🕐 时间: ${formatTime(alert.alertTime)}</div>
      </div>
      <div class="alert-goto-link" data-pasture-id="${alert.pastureId}" data-device-type="${alert.deviceType || 'weather'}" style="color: #409EFF; font-size: 12px; cursor: pointer; text-align: right;">📍 查看设备数据 →</div>
    </div>
  `
}
</script>

<style lang="scss" scoped>
/* 样式 */
</style>
