<template>
  <div class="task-progress-wrapper">
    <div class="progress-card art-custom-card today-task">
      <div class="card-content">
        <div class="card-title">今日任务完成</div>
        <div class="progress-stats">
          <span class="completed">{{ progressData.todayCompleted || 0 }}</span>
          <span class="separator">/</span>
          <span class="total">{{ progressData.todayTotal || 0 }}</span>
        </div>
        <div class="progress-bar-wrapper">
          <el-progress 
            :percentage="todayPercentage" 
            :stroke-width="6"
            :show-text="false"
            color="#3b82f6"
          />
        </div>
        <div class="progress-percent">{{ todayPercentage }}%</div>
      </div>
    </div>
    
    <div class="progress-card art-custom-card week-task">
      <div class="card-content">
        <div class="card-title">本周任务完成</div>
        <div class="progress-stats">
          <span class="completed">{{ progressData.weekCompleted || 0 }}</span>
          <span class="separator">/</span>
          <span class="total">{{ progressData.weekTotal || 0 }}</span>
        </div>
        <div class="progress-bar-wrapper">
          <el-progress 
            :percentage="weekPercentage" 
            :stroke-width="6"
            :show-text="false"
            color="#10b981"
          />
        </div>
        <div class="progress-percent">{{ weekPercentage }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ProgressData {
  todayTotal: number
  todayCompleted: number
  weekTotal: number
  weekCompleted: number
  totalTasks: number
  totalCompleted: number
  totalInProgress: number
}

const props = defineProps({
  progressData: { type: Object as () => ProgressData, default: () => ({}) }
})

const todayPercentage = computed(() => {
  if (!props.progressData.todayTotal || props.progressData.todayTotal === 0) return 0
  return Math.round((props.progressData.todayCompleted / props.progressData.todayTotal) * 100)
})

const weekPercentage = computed(() => {
  if (!props.progressData.weekTotal || props.progressData.weekTotal === 0) return 0
  return Math.round((props.progressData.weekCompleted / props.progressData.weekTotal) * 100)
})
</script>

<style lang="scss" scoped>
.task-progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;

  .progress-card {
    flex: 1;
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px);
    padding: 16px 18px;
    display: flex;
    align-items: center;

    .card-content {
      width: 100%;
      
      .card-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--art-text-gray-700);
        margin-bottom: 6px;
      }

      .progress-stats {
        display: flex;
        align-items: baseline;
        margin-bottom: 8px;

        .completed {
          font-size: 24px;
          font-weight: 600;
          color: var(--art-text-gray-900);
        }

        .separator {
          font-size: 16px;
          color: var(--art-gray-400);
          margin: 0 3px;
        }

        .total {
          font-size: 16px;
          color: var(--art-gray-500);
        }
      }

      .progress-bar-wrapper {
        margin-bottom: 4px;
      }

      .progress-percent {
        font-size: 11px;
        color: var(--art-gray-500);
        text-align: right;
      }
    }

    &.today-task {
      .card-title {
        color: #3b82f6;
      }
    }

    &.week-task {
      .card-title {
        color: #10b981;
      }
    }
  }
}

@media (max-width: 768px) {
  .task-progress-wrapper {
    flex-direction: row;
    
    .progress-card {
      padding: 12px 14px;
      
      .card-content {
        .progress-stats {
          .completed {
            font-size: 20px;
          }
          
          .total {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
