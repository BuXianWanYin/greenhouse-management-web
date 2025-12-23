<template>
  <div class="quick-actions art-custom-card">
    <div class="card-header">
      <span class="title">快捷操作</span>
    </div>
    <div class="card-body">
      <div class="action-list">
        <div 
          class="action-item" 
          v-for="(action, index) in actions" 
          :key="index"
          @click="handleAction(action)"
        >
          <div class="action-icon" :style="{ background: action.bgColor }">
            <el-icon :size="18">
              <component :is="action.icon" />
            </el-icon>
          </div>
          <span class="action-label">{{ action.label }}</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { 
  ArrowRight, 
  Plus, 
  List, 
  User, 
  Calendar,
  Document
} from '@element-plus/icons-vue'

const router = useRouter()

const actions = [
  { 
    label: '新建批次', 
    icon: Plus, 
    path: '/agriculture/plan/batch',
    bgColor: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
  },
  { 
    label: '任务列表', 
    icon: List, 
    path: '/agriculture/plan/batchTask',
    bgColor: 'linear-gradient(135deg, #34d399, #10b981)'
  },
  { 
    label: '人员排班', 
    icon: Calendar, 
    path: '/personnel/schedule',
    bgColor: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
  },
  { 
    label: '种植计划', 
    icon: Document, 
    path: '/agriculture/plan/rotationPlan',
    bgColor: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
  }
]

const handleAction = (action: typeof actions[0]) => {
  router.push(action.path)
}
</script>

<style lang="scss" scoped>
.quick-actions {
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
  }

  .card-body {
    flex: 1;
    padding: 12px 16px;

    .action-list {
      .action-item {
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 8px;
        background: var(--art-bg-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          background: var(--el-color-primary-light-9);
          transform: translateX(4px);

          .arrow-icon {
            opacity: 1;
            color: var(--el-color-primary);
          }
        }

        .action-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          .el-icon {
            color: #fff;
          }
        }

        .action-label {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--art-text-gray-800);
        }

        .arrow-icon {
          font-size: 14px;
          color: var(--art-gray-400);
          opacity: 0;
          transition: all 0.2s;
        }
      }
    }
  }
}
</style>
