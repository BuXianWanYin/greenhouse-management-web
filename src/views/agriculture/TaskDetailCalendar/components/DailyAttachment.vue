<template>
    <div class="daily-attachment">
        <div class="section-header">
            <span class="section-title">附件管理</span>
        </div>
        
        <el-alert
            type="info"
            :closable="false"
            show-icon
            class="attachment-tip"
        >
            <template #title>
                附件为任务级别，不区分日期。上传的图片和视频会显示在整个任务周期内。
            </template>
        </el-alert>
        
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
                :disabled="props.readonly"
                multiple
            >
                <el-icon v-if="!props.readonly"><Plus /></el-icon>
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
                :disabled="props.readonly"
                multiple
                accept="video/*"
            >
                <el-icon v-if="!props.readonly"><VideoCamera /></el-icon>
                <template #file="{ file }">
                    <div class="video-item">
                        <video :src="file.url" class="video-preview" />
                        <div v-if="!props.readonly" class="video-actions" @click.stop="handleVideoDelete(file)">
                            <el-icon><Delete /></el-icon>
                        </div>
                    </div>
                </template>
            </el-upload>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus, VideoCamera, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AgricultureCropBatchTaskService } from '@/api/agriculture/cropBatchTaskApi'
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

const emit = defineEmits(['log'])

const userStore = useUserStore()
const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/common/upload`
const uploadHeaders = { Authorization: userStore.accessToken }

const taskImages = ref([])
const taskVideos = ref([])

const imageFileList = computed(() => {
    return taskImages.value.map((url, idx) => ({
        name: `图片${idx + 1}`,
        url,
        uid: url
    }))
})

const videoFileList = computed(() => {
    return taskVideos.value.map((url, idx) => ({
        name: `视频${idx + 1}`,
        url,
        uid: url
    }))
})

// 获取任务附件
const fetchTaskAttachments = async () => {
    try {
        const response = await AgricultureCropBatchTaskService.getBatchTask(props.taskId)
        if (response.data) {
            if (typeof response.data.taskImages === 'string') {
                taskImages.value = response.data.taskImages ? response.data.taskImages.split(',') : []
            } else {
                taskImages.value = response.data.taskImages || []
            }
            if (typeof response.data.taskVideos === 'string') {
                taskVideos.value = response.data.taskVideos ? response.data.taskVideos.split(',') : []
            } else {
                taskVideos.value = response.data.taskVideos || []
            }
        }
    } catch (error) {
        console.error('获取附件失败:', error)
    }
}

// 更新任务图片
const updateTaskImages = async () => {
    try {
        await AgricultureCropBatchTaskService.updateBatchTask({
            taskId: props.taskId,
            taskImages: taskImages.value.join(',')
        })
    } catch (error) {
        console.error('更新图片失败:', error)
    }
}

// 更新任务视频
const updateTaskVideos = async () => {
    try {
        await AgricultureCropBatchTaskService.updateBatchTask({
            taskId: props.taskId,
            taskVideos: taskVideos.value.join(',')
        })
    } catch (error) {
        console.error('更新视频失败:', error)
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
const handleImageSuccess = (response) => {
    taskImages.value.push(response.url)
    ElMessage.success('图片上传成功')
    addTaskLog('上传图片')
    updateTaskImages()
}

// 图片移除
const handleImageRemove = (file, fileList) => {
    taskImages.value = fileList.map(f => f.url)
    addTaskLog('删除图片')
    updateTaskImages()
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
const handleVideoSuccess = (response) => {
    taskVideos.value.push(response.url)
    ElMessage.success('视频上传成功')
    addTaskLog('上传视频')
    updateTaskVideos()
}

// 视频移除
const handleVideoRemove = (file, fileList) => {
    taskVideos.value = fileList.map(f => f.url)
    addTaskLog('删除视频')
    updateTaskVideos()
}

// 视频删除
const handleVideoDelete = async (file) => {
    const index = taskVideos.value.indexOf(file.url)
    if (index > -1) {
        taskVideos.value.splice(index, 1)
    }
    await addTaskLog('删除视频')
    await updateTaskVideos()
    ElMessage.success('视频删除成功')
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

watch(() => props.taskId, () => {
    fetchTaskAttachments()
}, { immediate: true })
</script>

<style lang="scss" scoped>
.daily-attachment {
    .section-header {
        margin-bottom: 12px;
        
        .section-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
        }
    }
    
    .attachment-tip {
        margin-bottom: 15px;
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
    
    .video-item {
        width: 100%;
        height: 100%;
        position: relative;
        
        .video-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .video-actions {
            position: absolute;
            top: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 0 0 0 4px;
            
            &:hover {
                background: rgba(245, 108, 108, 0.8);
            }
        }
    }
}
</style>
