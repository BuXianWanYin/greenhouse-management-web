<template>
    <div class="daily-attachment">
        <!-- 附件管理 -->
        <div class="section-header">
            <span class="section-title">附件管理</span>
            <span class="section-date">{{ props.selectedDate }}</span>
        </div>
        
        <!-- 图片上传 -->
        <div class="upload-section">
            <div class="upload-title">图片</div>
            <el-upload
                class="image-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                list-type="picture-card"
                :file-list="imageFileList"
                :on-success="handleImageSuccess"
                :on-remove="handleImageRemove"
                :before-upload="beforeImageUpload"
                :limit="10"
                :disabled="props.readonly || !props.selectedDate"
                multiple
            >
                <el-icon v-if="!props.readonly && props.selectedDate"><Plus /></el-icon>
            </el-upload>
        </div>
        
        <!-- 视频上传 -->
        <div class="upload-section">
            <div class="upload-title">视频</div>
            <el-upload
                class="video-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                list-type="picture-card"
                :file-list="videoFileList"
                :on-success="handleVideoSuccess"
                :on-remove="handleVideoRemove"
                :before-upload="beforeVideoUpload"
                :limit="5"
                :disabled="props.readonly || !props.selectedDate"
                multiple
                accept="video/*"
            >
                <el-icon v-if="!props.readonly && props.selectedDate"><VideoCamera /></el-icon>
            </el-upload>
        </div>
        
        <div v-if="!props.selectedDate" class="no-date-tip">
            请先选择日期
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus, VideoCamera, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AgricultureTaskAttachmentService } from '@/api/agriculture/taskAttachmentApi'
import { AgricultureTaskLogService } from '@/api/agriculture/logApi'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
    taskId: {
        type: [Number, String],
        required: true
    },
    selectedDate: {
        type: String,
        default: ''
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['log', 'refresh'])

const userStore = useUserStore()
const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/common/upload`
const uploadHeaders = { Authorization: userStore.accessToken }

const attachments = ref([])

const imageFileList = computed(() => {
    return attachments.value
        .filter(item => item.fileType === '0')
        .map(item => ({
            name: item.fileName || '图片',
            url: item.fileUrl,
            uid: item.attachmentId
        }))
})

const videoFileList = computed(() => {
    return attachments.value
        .filter(item => item.fileType === '1')
        .map(item => ({
            name: item.fileName || '视频',
            url: item.fileUrl,
            uid: item.attachmentId
        }))
})

// 获取当日附件
const fetchAttachments = async () => {
    if (!props.taskId || !props.selectedDate) {
        attachments.value = []
        return
    }
    try {
        const response = await AgricultureTaskAttachmentService.listByDate(props.taskId, props.selectedDate)
        attachments.value = response.data || []
    } catch (error) {
        console.error('获取附件失败:', error)
        attachments.value = []
    }
}

// 添加日志
const addTaskLog = async (des) => {
    const currentUser = {
        userId: userStore.info.id,
        userName: userStore.info.nickName || userStore.info.userName || ''
    }
    await AgricultureTaskLogService.addLog({
        taskId: props.taskId,
        operDes: des,
        operName: currentUser.userName,
        operId: currentUser.userId,
        createBy: currentUser.userId,
        updateBy: currentUser.userId
    })
    emit('log')
}

// 图片上传成功
const handleImageSuccess = async (response) => {
    try {
        await AgricultureTaskAttachmentService.addAttachment({
            taskId: props.taskId,
            attachmentDate: props.selectedDate,
            fileUrl: response.url,
            fileType: '0',
            fileName: response.fileName || '图片',
            createBy: userStore.info.id
        })
        ElMessage.success('图片上传成功')
        await addTaskLog('上传图片')
        await fetchAttachments()
        emit('refresh')
    } catch (error) {
        console.error('保存图片失败:', error)
        ElMessage.error('保存图片失败')
    }
}

// 图片移除（el-upload on-remove 事件）
const handleImageRemove = async (file) => {
    try {
        await AgricultureTaskAttachmentService.deleteAttachment(file.uid)
        ElMessage.success('图片删除成功')
        await addTaskLog('删除图片')
        await fetchAttachments()
        emit('refresh')
    } catch (error) {
        console.error('删除图片失败:', error)
        ElMessage.error('删除图片失败')
    }
}

// 图片上传前校验
const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
    }
    if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!')
        return false
    }
    return true
}

// 视频上传成功
const handleVideoSuccess = async (response) => {
    try {
        await AgricultureTaskAttachmentService.addAttachment({
            taskId: props.taskId,
            attachmentDate: props.selectedDate,
            fileUrl: response.url,
            fileType: '1',
            fileName: response.fileName || '视频',
            createBy: userStore.info.id
        })
        ElMessage.success('视频上传成功')
        await addTaskLog('上传视频')
        await fetchAttachments()
        emit('refresh')
    } catch (error) {
        console.error('保存视频失败:', error)
        ElMessage.error('保存视频失败')
    }
}

// 视频移除（el-upload on-remove 事件）
const handleVideoRemove = async (file) => {
    try {
        await AgricultureTaskAttachmentService.deleteAttachment(file.uid)
        ElMessage.success('视频删除成功')
        await addTaskLog('删除视频')
        await fetchAttachments()
        emit('refresh')
    } catch (error) {
        console.error('删除视频失败:', error)
        ElMessage.error('删除视频失败')
    }
}

// 视频上传前校验
const beforeVideoUpload = (file) => {
    const isVideo = file.type.startsWith('video/')
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isVideo) {
        ElMessage.error('只能上传视频文件!')
        return false
    }
    if (!isLt50M) {
        ElMessage.error('视频大小不能超过 50MB!')
        return false
    }
    return true
}

watch([() => props.taskId, () => props.selectedDate], () => {
    fetchAttachments()
}, { immediate: true })
</script>

<style lang="scss" scoped>
.daily-attachment {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        .section-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
        }
        
        .section-date {
            font-size: 12px;
            color: #909399;
        }
    }
    
    .upload-section {
        margin-bottom: 20px;
        
        .upload-title {
            font-size: 13px;
            font-weight: 500;
            color: #606266;
            margin-bottom: 10px;
        }
    }
    
    .no-date-tip {
        text-align: center;
        color: #909399;
        padding: 40px 0;
        font-size: 14px;
    }
    
    :deep(.el-upload--picture-card) {
        width: 100px;
        height: 100px;
    }
    
    :deep(.el-upload-list--picture-card .el-upload-list__item) {
        width: 100px;
        height: 100px;
    }
}
</style>
