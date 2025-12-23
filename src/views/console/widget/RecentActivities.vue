<template>
  <div class="recent-activities art-custom-card">
    <div class="card-header">
      <span class="title">最近动态</span>
      <span class="subtitle">近7天活动记录</span>
    </div>
    <div class="card-body">
      <div class="activity-list" v-if="activities.length > 0">
        <div 
          class="activity-item" 
          v-for="(activity, index) in activities" 
          :key="index"
        >
          <el-avatar 
            :size="32" 
            class="activity-avatar" 
            :class="activity.avatar ? '' : activity.icon"
            :src="activity.avatar"
          >
            <template v-if="!activity.avatar">{{ getAvatarText(activity.title) }}</template>
          </el-avatar>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-desc">{{ activity.content }}</div>
          </div>
          <div class="activity-time">{{ activity.time }}</div>
        </div>
      </div>
      <el-empty v-else description="暂无动态" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Activity {
  type: string
  icon: string
  title: string
  content: string
  time: string
  avatar?: string
}

defineProps({
  activities: { type: Array as () => Activity[], default: () => [] }
})

const getAvatarText = (title: string) => {
  const match = title.match(/^(.+?)\s/)
  if (match) {
    return match[1].charAt(0)
  }
  return title.charAt(0)
}
</script>

<style lang="scss" scoped>
.recent-activities {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--art-main-bg-color);
  border-radius: calc(var(--custom-radius) + 4px);
  overflow: hidden;

  .card-header {
    padding: 18px 20px 12px;
    border-bottom: 1px solid var(--art-border-color);
    
    .title {
      display: block;
      font-size: 16px;
      font-weight: 500;
      color: var(--art-text-gray-900);
    }
    
    .subtitle {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: var(--art-gray-500);
    }
  }

  .card-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;

    .activity-list {
      .activity-item {
        display: flex;
        align-items: flex-start;
        padding: 12px 0;
        border-bottom: 1px solid var(--art-border-color);

        &:last-child {
          border-bottom: none;
        }

        .activity-avatar {
          flex-shrink: 0;
          margin-right: 12px;
          font-size: 13px;
          color: #fff;

          &.success {
            background: linear-gradient(135deg, #34d399, #10b981);
          }

          &.primary {
            background: linear-gradient(135deg, #60a5fa, #3b82f6);
          }

          &.warning {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
          }

          &.info {
            background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          }
        }

        .activity-content {
          flex: 1;
          min-width: 0;

          .activity-title {
            font-size: 13px;
            font-weight: 500;
            color: var(--art-text-gray-800);
            margin-bottom: 4px;
          }

          .activity-desc {
            font-size: 12px;
            color: var(--art-gray-500);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .activity-time {
          font-size: 11px;
          color: var(--art-gray-400);
          flex-shrink: 0;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
