<template>
    <div class="task-header">
        <!-- 任务头部信息 -->
        <el-row :gutter="20">
            <el-col :span="4" class="header-item">
                <StatusSelect 
                    v-model="localForm.status" 
                    :disabled="props.readonly" 
                    @change="handleStatusChange"
                >
                    当前状态
                </StatusSelect>
            </el-col>
            <el-col :span="4" class="header-item">
                <RadioSelect 
                    :options="props.userList" 
                    v-model="localForm.responsiblePersonId" 
                    key-name="nickName"
                    value-name="userId" 
                    :disabled="props.readonly" 
                    @change="handleResponsibleChange"
                >
                    责任人
                </RadioSelect>
            </el-col>
            <el-col :span="4" class="header-item">
                <CalendarSelect 
                    v-model="localForm.planStart" 
                    disabled
                >
                    计划开始时间
                </CalendarSelect>
            </el-col>
            <el-col :span="4" class="header-item">
                <CalendarSelect 
                    v-model="localForm.planFinish" 
                    disabled
                >
                    计划完成时间
                </CalendarSelect>
            </el-col>
            <el-col :span="4" class="header-item">
                <CalendarSelect 
                    v-model="localForm.actualStart" 
                    :showTime="false" 
                    :disabled="props.readonly"
                    @change="handleActualStartChange"
                >
                    实际开始时间
                </CalendarSelect>
            </el-col>
            <el-col :span="4" class="header-item">
                <CalendarSelect 
                    v-model="localForm.actualFinish" 
                    :showTime="false" 
                    :disabled="props.readonly"
                    :disabledDate="disableActualFinishDate"
                    @change="handleActualFinishChange"
                >
                    实际结束时间
                </CalendarSelect>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import StatusSelect from '../../TaskDetail/StatusSelect.vue'
import RadioSelect from '../../TaskDetail/RadioSelect.vue'
import CalendarSelect from '../../TaskDetail/CalendarSelect.vue'

const props = defineProps({
    form: {
        type: Object,
        required: true
    },
    userList: {
        type: Array,
        default: () => []
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update', 'submit'])

const localForm = reactive({
    status: '',
    responsiblePersonId: null,
    planStart: null,
    planFinish: null,
    actualStart: null,
    actualFinish: null
})

// 监听props.form变化，同步到localForm
watch(() => props.form, (newVal) => {
    if (newVal) {
        localForm.status = newVal.status
        localForm.responsiblePersonId = newVal.responsiblePersonId
        localForm.planStart = newVal.planStart
        localForm.planFinish = newVal.planFinish
        localForm.actualStart = newVal.actualStart
        localForm.actualFinish = newVal.actualFinish
    }
}, { immediate: true, deep: true })

const handleStatusChange = (val) => {
    emit('update', 'status', val)
    emit('submit')
}

const handleResponsibleChange = (val) => {
    emit('update', 'responsiblePersonId', val)
    // 更新责任人名称
    const user = props.userList.find(u => u.userId === val)
    if (user) {
        emit('update', 'responsiblePersonName', user.nickName)
    }
    emit('submit')
}

const handleActualStartChange = (val) => {
    emit('update', 'actualStart', val)
    emit('submit')
}

const handleActualFinishChange = (val) => {
    emit('update', 'actualFinish', val)
    emit('submit')
}

const disableActualFinishDate = (date) => {
    if (!localForm.actualStart) return false
    const startDate = new Date(localForm.actualStart)
    startDate.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate.getTime() < startDate.getTime()
}
</script>

<style lang="scss" scoped>
.task-header {
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;
    
    .header-item {
        display: flex;
        align-items: center;
    }
}
</style>
