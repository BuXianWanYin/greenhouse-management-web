<template>
    <div class="daily-material">
        <div class="section-header">
            <span class="section-title">当日农资使用</span>
            <el-button 
                v-if="!props.readonly"
                type="primary" 
                size="small" 
                @click="handleAdd"
            >
                新增
            </el-button>
        </div>
        
        <el-table
            v-loading="loading"
            :data="materialList"
            size="small"
            empty-text="暂无农资使用记录"
            style="width: 100%"
        >
            <el-table-column label="图片" align="center" width="80">
                <template #default="{ row }">
                    <div class="resource-image-cell">
                        <img 
                            v-if="getResourceImage(row.resourceId)" 
                            :src="getResourceImage(row.resourceId)" 
                            class="resource-thumbnail"
                        />
                        <el-icon v-else class="image-placeholder"><PictureFilled /></el-icon>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="农资名称" align="center" prop="resourceId" min-width="120">
                <template #default="{ row }">
                    {{ getResourceName(row.resourceId) }}
                </template>
            </el-table-column>
            <el-table-column label="数量" align="center" prop="usageQuantity" min-width="80" />
            <el-table-column label="单位" align="center" prop="measureUnit" min-width="80" />
            <el-table-column label="类型" align="center" prop="usageType" min-width="90">
                <template #default="{ row }">
                    <el-tag :type="row.usageType === '0' ? 'success' : 'warning'" size="small">
                        {{ getUsageTypeLabel(row.usageType) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center" min-width="90">
                <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.status)" size="small">
                        {{ getStatusLabel(row.status, row.usageType) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作人" align="center" prop="operator" min-width="100" />
            <el-table-column 
                v-if="!props.readonly"
                label="操作" 
                align="center" 
                width="80"
                fixed="right"
            >
                <template #default="{ row }">
                    <el-button 
                        v-if="canReturn(row)"
                        size="small" 
                        type="success" 
                        link 
                        @click="handleReturn(row)"
                    >
                        归还
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增对话框 -->
        <el-dialog
            v-model="dialogVisible"
            title="新增农资使用"
            width="500px"
            append-to-body
        >
            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="100px"
            >
                <el-form-item label="农资名称" prop="resourceId">
                    <el-select
                        v-model="form.resourceId"
                        placeholder="请选择农资"
                        filterable
                        style="width: 100%"
                        @change="handleResourceChange"
                    >
                        <el-option
                            v-for="item in resourceList"
                            :key="item.resourceId"
                            :label="item.resourceName"
                            :value="item.resourceId"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="使用数量" prop="usageQuantity">
                    <el-input-number
                        v-model="form.usageQuantity"
                        :min="1"
                        :precision="0"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="计量单位" prop="measureUnit">
                    <el-input v-model="form.measureUnit" disabled />
                </el-form-item>
                <el-form-item label="使用日期" prop="usageDate">
                    <el-date-picker
                        v-model="form.usageDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="选择日期"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="使用类型" prop="usageType">
                    <el-select v-model="form.usageType" style="width: 100%" :disabled="isUsageTypeDisabled">
                        <el-option label="领用" value="0" />
                        <el-option label="消耗" value="1" />
                    </el-select>
                    <div v-if="isUsageTypeDisabled" class="type-tip">
                        机械类型农资只能选择"领用"
                    </div>
                </el-form-item>
                <el-form-item label="操作人员" prop="operator">
                    <el-select v-model="form.operator" placeholder="请选择" filterable style="width: 100%">
                        <el-option
                            v-for="item in props.taskEmployeeList"
                            :key="item.userId"
                            :label="item.nickName"
                            :value="item.nickName"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.remark" type="textarea" :rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PictureFilled } from '@element-plus/icons-vue'
import { AgricultureResourceUsageService } from '@/api/agriculture/resourceUsageApi'
import { AgricultureResourceService } from '@/api/agriculture/resourceApi'
import { AgricultureTaskLogService } from '@/api/agriculture/logApi'

const props = defineProps({
    taskId: {
        type: [Number, String],
        required: true
    },
    batchId: {
        type: [Number, String],
        default: null
    },
    selectedDate: {
        type: String,
        default: ''
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

const emit = defineEmits(['log', 'refresh'])

const loading = ref(false)
const materialList = ref([])
const resourceList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
    usageId: null,
    resourceId: '',
    batchId: '',
    taskId: '',
    usageQuantity: 1,
    measureUnit: '',
    usageDate: '',
    usageType: '1',
    operator: '',
    remark: ''
})

const rules = {
    resourceId: [{ required: true, message: '请选择农资', trigger: 'change' }],
    usageQuantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    usageDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
    usageType: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

// 获取当日农资使用列表
const getList = async () => {
    if (!props.selectedDate) return
    loading.value = true
    try {
        const response = await AgricultureResourceUsageService.getUsageByTaskId(props.taskId)
        if (response.code === 200 && response.data) {
            materialList.value = response.data.filter(item => {
                const date = item.usageDate ? item.usageDate.split(' ')[0] : ''
                return date === props.selectedDate
            })
        }
    } finally {
        loading.value = false
    }
}

// 获取农资列表
const fetchResourceList = async () => {
    const response = await AgricultureResourceService.listResource({ pageNum: 1, pageSize: 9999 })
    if (response.code === 200) {
        resourceList.value = response.rows || []
    }
}

// 获取农资名称
const getResourceName = (resourceId) => {
    const resource = resourceList.value.find(item => item.resourceId == resourceId)
    return resource?.resourceName || '-'
}

// 获取农资图片
const getResourceImage = (resourceId) => {
    const resource = resourceList.value.find(item => item.resourceId == resourceId)
    return resource?.resourceImage || null
}

// 获取使用类型标签
const getUsageTypeLabel = (type) => {
    const map = { '0': '领用', '1': '消耗', '2': '入库' }
    return map[type] || type
}

// 获取状态标签
const getStatusLabel = (status, usageType) => {
    if (usageType === '0' && status === '2') return '使用中'
    if (usageType === '0' && status === '0') return '已归还'
    if (usageType === '1' && status === '0') return '已消耗'
    if (status === '1') return '已撤销'
    return '正常'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
    if (status === '2') return 'warning'
    if (status === '1') return 'danger'
    return 'success'
}

// 判断是否可归还
const canReturn = (row) => {
    if (row.usageType !== '0') return false
    const resource = resourceList.value.find(item => item.resourceId == row.resourceId)
    if (resource?.resourceType !== '1') return false
    return !row.status || row.status === '' || row.status === '2'
}

// 农资选择变化
const handleResourceChange = (resourceId) => {
    const resource = resourceList.value.find(item => item.resourceId === resourceId)
    if (resource) {
        form.measureUnit = resource.measureUnit || ''
        form.usageType = resource.resourceType === '1' ? '0' : '1'
    }
}

// 是否禁用使用类型
const isUsageTypeDisabled = computed(() => {
    const resource = resourceList.value.find(item => item.resourceId === form.resourceId)
    return resource?.resourceType === '1'
})

// 新增
const handleAdd = () => {
    resetForm()
    form.usageDate = props.selectedDate
    form.taskId = String(props.taskId)
    form.batchId = props.batchId ? String(props.batchId) : ''
    form.operator = props.currentUser.userName || ''
    dialogVisible.value = true
}

// 归还
const handleReturn = async (row) => {
    try {
        await ElMessageBox.confirm(`确认归还农资"${getResourceName(row.resourceId)}"？`, '确认', {
            type: 'warning'
        })
        const response = await AgricultureResourceUsageService.returnUsage(row.usageId)
        if (response.code === 200) {
            ElMessage.success('归还成功')
            await addTaskLog(`归还农资 - ${getResourceName(row.resourceId)}`)
            getList()
            emit('refresh')
        } else {
            ElMessage.error(response.msg || '归还失败')
        }
    } catch (e) {
        // 取消
    }
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const resource = resourceList.value.find(item => item.resourceId === form.resourceId)
                const submitData = {
                    ...form,
                    usageDate: form.usageDate.includes(' ') ? form.usageDate : `${form.usageDate} 00:00:00`,
                    status: resource?.resourceType === '1' && form.usageType === '0' ? '2' : '0',
                    resourceId: Number(form.resourceId),
                    usageQuantity: Number(form.usageQuantity)
                }
                
                await AgricultureResourceUsageService.addUsage(submitData)
                ElMessage.success('新增成功')
                await addTaskLog(`新增农资使用 - ${getUsageTypeLabel(form.usageType)}`)
                dialogVisible.value = false
                getList()
                emit('refresh')
            } catch (error) {
                console.error('操作失败:', error)
            }
        }
    })
}

// 重置表单
const resetForm = () => {
    form.usageId = null
    form.resourceId = ''
    form.batchId = ''
    form.taskId = ''
    form.usageQuantity = 1
    form.measureUnit = ''
    form.usageDate = ''
    form.usageType = '1'
    form.operator = ''
    form.remark = ''
    formRef.value?.resetFields()
}

// 添加日志
const addTaskLog = async (des) => {
    await AgricultureTaskLogService.addLog({
        taskId: props.taskId,
        operDes: des,
        operName: props.currentUser.userName,
        operId: props.currentUser.userId,
        createBy: props.currentUser.userId,
        updateBy: props.currentUser.userId
    })
    emit('log')
}

// 监听日期变化
watch(() => props.selectedDate, () => {
    getList()
}, { immediate: true })

onMounted(() => {
    fetchResourceList()
})
</script>

<style lang="scss" scoped>
.daily-material {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .section-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
        }
    }
    
    .type-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
    }
    
    .resource-image-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .resource-thumbnail {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
        }
        
        .image-placeholder {
            font-size: 24px;
            color: #c0c4cc;
        }
    }
}
</style>
