<template>
    <div class="date-detail">
        <!-- 日期标题 -->
        <div class="date-header">
            <span class="date-title">{{ formattedDate }}</span>
            <span class="date-weekday">{{ weekdayText }}</span>
        </div>

        <!-- Tab 切换 -->
        <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="人工工时" name="workHours">
                <DailyWorkHours
                    :taskId="props.taskId"
                    :selectedDate="props.selectedDate"
                    :taskEmployeeList="props.taskEmployeeList"
                    :currentUser="props.currentUser"
                    :readonly="props.readonly"
                    @log="handleLog"
                    @refresh="handleRefresh"
                />
            </el-tab-pane>
            <el-tab-pane label="农资使用" name="material">
                <DailyMaterial
                    :taskId="props.taskId"
                    :batchId="props.batchId"
                    :selectedDate="props.selectedDate"
                    :taskEmployeeList="props.taskEmployeeList"
                    :currentUser="props.currentUser"
                    :readonly="props.readonly"
                    @log="handleLog"
                    @refresh="handleRefresh"
                />
            </el-tab-pane>
            <el-tab-pane label="附件" name="attachment">
                <DailyAttachment
                    :taskId="props.taskId"
                    :selectedDate="props.selectedDate"
                    :readonly="props.readonly"
                    @log="handleLog"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DailyWorkHours from './DailyWorkHours.vue'
import DailyMaterial from './DailyMaterial.vue'
import DailyAttachment from './DailyAttachment.vue'

const props = defineProps({
    selectedDate: {
        type: String,
        default: ''
    },
    taskId: {
        type: [Number, String],
        required: true
    },
    batchId: {
        type: [Number, String],
        default: null
    },
    taskEmployeeList: {
        type: Array,
        default: () => []
    },
    currentUser: {
        type: Object,
        required: true
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['log', 'refresh-summary'])

const activeTab = ref('workHours')

// 格式化日期显示
const formattedDate = computed(() => {
    if (!props.selectedDate) return ''
    return props.selectedDate
})

// 获取星期几
const weekdayText = computed(() => {
    if (!props.selectedDate) return ''
    const date = new Date(props.selectedDate)
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return weekdays[date.getDay()]
})

const handleLog = () => {
    emit('log')
}

const handleRefresh = () => {
    emit('refresh-summary')
}

// 日期变化时重置tab
watch(() => props.selectedDate, () => {
    // 保持当前tab不变，只刷新数据
})
</script>

<style lang="scss" scoped>
.date-detail {
    .date-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;
        margin-bottom: 12px;
        
        .date-title {
            font-size: 16px;
            font-weight: bold;
            color: #303133;
        }
        
        .date-weekday {
            font-size: 14px;
            color: #909399;
        }
    }
    
    .detail-tabs {
        :deep(.el-tabs__header) {
            margin-bottom: 15px;
        }
        
        :deep(.el-tabs__nav-wrap::after) {
            height: 1px;
        }
    }
}
</style>
