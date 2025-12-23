<template>
    <div class="task-footer">
        <el-collapse v-model="activeNames">
            <el-collapse-item title="任务详情与日志" name="detail">
                <div class="footer-content">
                    <!-- 左侧：任务详情和人员信息 -->
                    <div class="left-panel">
                        <!-- 任务详情 -->
                        <div class="detail-section">
                            <div class="section-title">任务详情</div>
                            <div v-if="!isEditingRemark" class="remark-content">
                                <span v-if="props.form.remark">{{ props.form.remark }}</span>
                                <span v-else class="no-data">--暂无描述--</span>
                                <el-button 
                                    v-if="!props.readonly"
                                    type="primary" 
                                    link 
                                    size="small"
                                    @click="isEditingRemark = true"
                                >
                                    {{ props.form.remark ? '编辑' : '添加描述' }}
                                </el-button>
                            </div>
                            <div v-else class="remark-edit">
                                <el-input
                                    v-model="editRemark"
                                    type="textarea"
                                    :rows="3"
                                    placeholder="请输入任务描述"
                                />
                                <div class="edit-actions">
                                    <el-button size="small" type="primary" @click="saveRemark">
                                        确定
                                    </el-button>
                                    <el-button size="small" @click="cancelEditRemark">
                                        取消
                                    </el-button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 人员信息 -->
                        <div class="detail-section">
                            <div class="section-title">人员信息</div>
                            <div class="employee-list">
                                <MultipleSelect
                                    v-model="localEmployeeList"
                                    :options="props.userList"
                                    key-name="nickName"
                                    value-name="userId"
                                    :disabled="props.readonly"
                                    @change="handleEmployeeChange"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- 右侧：操作日志 -->
                    <div class="right-panel">
                        <div class="section-title">操作日志</div>
                        <div class="log-list">
                            <div 
                                v-for="(log, index) in props.logList" 
                                :key="index"
                                class="log-item"
                            >
                                <span class="log-index">{{ props.logList.length - index }}.</span>
                                <span class="log-time">{{ log.createTime }}</span>
                                <span class="log-operator">{{ log.operName }}</span>
                                <span class="log-desc">{{ log.operDes }}</span>
                            </div>
                            <div v-if="!props.logList || props.logList.length === 0" class="no-data">
                                暂无操作日志
                            </div>
                        </div>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import MultipleSelect from '../../TaskDetail/MultipleSelect.vue'

const props = defineProps({
    form: {
        type: Object,
        required: true
    },
    userList: {
        type: Array,
        default: () => []
    },
    selectEmployeeList: {
        type: Array,
        default: () => []
    },
    logList: {
        type: Array,
        default: () => []
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update-remark', 'employee-change'])

const activeNames = ref(['detail'])
const isEditingRemark = ref(false)
const editRemark = ref('')
const localEmployeeList = ref([])

// 同步员工列表
watch(() => props.selectEmployeeList, (newVal) => {
    localEmployeeList.value = [...newVal]
}, { immediate: true, deep: true })

// 保存备注
const saveRemark = () => {
    emit('update-remark', editRemark.value)
    isEditingRemark.value = false
}

// 取消编辑
const cancelEditRemark = () => {
    editRemark.value = props.form.remark || ''
    isEditingRemark.value = false
}

// 开始编辑时同步当前值
watch(isEditingRemark, (val) => {
    if (val) {
        editRemark.value = props.form.remark || ''
    }
})

// 处理员工变更
const handleEmployeeChange = (e) => {
    emit('employee-change', e)
}
</script>

<style lang="scss" scoped>
.task-footer {
    margin-top: 15px;
    border-top: 1px solid #ebeef5;
    
    :deep(.el-collapse) {
        border: none;
        
        .el-collapse-item__header {
            font-weight: bold;
            font-size: 14px;
            padding-left: 0;
            border-bottom: none;
        }
        
        .el-collapse-item__wrap {
            border-bottom: none;
        }
        
        .el-collapse-item__content {
            padding-bottom: 0;
        }
    }
    
    .footer-content {
        display: flex;
        gap: 30px;
        
        .left-panel {
            flex: 1;
            min-width: 0;
        }
        
        .right-panel {
            width: 400px;
            flex-shrink: 0;
        }
        
        .section-title {
            font-weight: 500;
            font-size: 14px;
            color: #303133;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ebeef5;
        }
        
        .detail-section {
            margin-bottom: 20px;
        }
        
        .remark-content {
            font-size: 13px;
            color: #606266;
            line-height: 1.6;
            
            .el-button {
                margin-left: 10px;
            }
        }
        
        .remark-edit {
            .edit-actions {
                margin-top: 10px;
                text-align: right;
            }
        }
        
        .employee-list {
            margin-top: 5px;
        }
        
        .log-list {
            max-height: 200px;
            overflow-y: auto;
            
            .log-item {
                font-size: 13px;
                line-height: 1.8;
                color: #606266;
                
                .log-index {
                    margin-right: 4px;
                }
                
                .log-time {
                    color: #909399;
                    margin-right: 8px;
                }
                
                .log-operator {
                    color: #e6a23c;
                    font-weight: 500;
                    margin-right: 8px;
                }
                
                .log-desc {
                    color: #303133;
                }
            }
        }
        
        .no-data {
            color: #909399;
            font-size: 13px;
        }
    }
}
</style>
