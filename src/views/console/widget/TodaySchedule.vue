<template>
  <div class="today-schedule art-custom-card">
    <div class="card-header">
      <span class="title">今日排班</span>
      <span class="subtitle">{{ todayDate }}</span>
    </div>
    <div class="card-body">
      <div class="schedule-table" v-if="scheduleList.length > 0">
        <div class="table-header">
          <span class="col-name">姓名</span>
          <span class="col-pasture">温室/批次</span>
          <span class="col-time">时间</span>
        </div>
        <div class="table-body">
          <div 
            class="schedule-row" 
            v-for="(item, index) in scheduleList" 
            :key="index"
          >
            <span class="col-name">
              <el-avatar :size="24" class="user-avatar">
                {{ item.userName?.charAt(0) || '员' }}
              </el-avatar>
              {{ item.userName }}
            </span>
            <span class="col-pasture">
              <template v-if="item.pastureName && item.batchName">
                {{ item.pastureName }}/{{ item.batchName }}
              </template>
              <template v-else-if="item.pastureName">
                {{ item.pastureName }}
              </template>
              <template v-else>
                -
              </template>
            </span>
            <span class="col-time">{{ item.startTime }}-{{ item.endTime }}</span>
          </div>
        </div>
      </div>
      <el-empty v-else description="今日暂无排班" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ScheduleItem {
  scheduleId: number
  userName: string
  pastureName: string
  batchName?: string
  ruleName: string
  workType: string
  startTime: string
  endTime: string
}

defineProps({
  scheduleList: { type: Array as () => ScheduleItem[], default: () => [] }
})

const todayDate = computed(() => {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${month}月${day}日 ${weekDays[today.getDay()]}`
})
</script>

<style lang="scss" scoped>
.today-schedule {
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
    padding: 0;

    .schedule-table {
      .table-header {
        display: flex;
        padding: 12px 16px;
        background: var(--art-bg-color);
        font-size: 12px;
        font-weight: 500;
        color: var(--art-gray-600);
      }

      .table-body {
        .schedule-row {
          display: flex;
          padding: 12px 16px;
          border-bottom: 1px solid var(--art-border-color);
          transition: background 0.2s;

          &:hover {
            background: var(--art-bg-color);
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }

      .col-name {
        flex: 1.2;
        display: flex;
        align-items: center;
        font-size: 13px;
        color: var(--art-text-gray-800);

        .user-avatar {
          margin-right: 8px;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          font-size: 12px;
        }
      }

      .col-pasture {
        flex: 1;
        font-size: 13px;
        color: var(--art-text-gray-700);
        display: flex;
        align-items: center;
      }

      .col-time {
        flex: 1;
        font-size: 12px;
        color: var(--art-gray-500);
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
  }
}

@media (max-width: 768px) {
  .today-schedule {
    .card-body {
      .schedule-table {
        .col-pasture {
          display: none;
        }
      }
    }
  }
}
</style>
