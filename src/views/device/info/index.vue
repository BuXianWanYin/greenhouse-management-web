<template>
  <div class="page-content">
    <table-bar :showTop="false" @search="handleQuery" @reset="resetForm(queryRef)" @changeColumn="changeColumn"
      :columns="columns">
      <template #top>
        <el-form :model="queryParams" ref="queryRef" label-width="90px">
          <el-row :gutter="20">
            <form-input label="设备名称" prop="deviceName" v-model="queryParams.deviceName" @keyup.enter="handleQuery" />
            <el-form-item label="最后在线时间" prop="lastOnlineTime">
              <el-date-picker clearable v-model="queryParams.lastOnlineTime" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择最后在线时间">
              </el-date-picker>
            </el-form-item>
            <form-input label="温室id" prop="pastureId" v-model="queryParams.pastureId" @keyup.enter="handleQuery" />
            <form-input label="传感器指令" prop="sensorCommand" v-model="queryParams.sensorCommand"
              @keyup.enter="handleQuery" />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-hasPermi="['server:device:add']" v-ripple>新增 </el-button>
        <el-button @click="handleExport" v-hasPermi="['server:device:export']" v-ripple>导出</el-button>
        <el-button @click="openBatchBindDialog = true" v-hasPermi="['server:device:edit']" v-ripple style="margin-left: 8px;">一键绑定温室</el-button>
      </template>
    </table-bar>

    <div class="device-cards-container" v-loading="loading">
      <div v-for="device in deviceList" :key="device.id" class="device-card">
        <div class="card-header">
          <div class="device-name">
            <span>{{ device.deviceName }}</span>
          </div>
          <div class="device-status">
            <el-tag 
              :type="getDeviceOnlineStatus(device) === 'online' ? 'success' : 'info'"
              :class="{ 'tag-offline': getDeviceOnlineStatus(device) === 'offline' }"
              style="margin-right: 8px; display: flex; align-items: center; gap: 6px;">
              <span 
                :class="['online-indicator', { 'breathing': getDeviceOnlineStatus(device) === 'online' }]"
              ></span>
              {{ getDeviceOnlineStatus(device) === 'online' ? '在线' : '离线' }}
            </el-tag>
            <el-tag v-if="device.alarmStatus !== '0' && device.alarmStatus !== null" :type="device.alarmStatus === '1' ? 'warning' : 'danger'">
              {{ formatStatus(device.alarmStatus, 'alarmStatus') }}
            </el-tag>
          </div>
        </div>

        <div class="card-body">
          <div class="card-body-content">
            <!-- 左侧：设备图片 -->
            <div class="device-image-container">
              <img 
                v-if="device.deviceImage" 
                :src="device.deviceImage" 
                :alt="device.deviceName"
                class="device-image"
              />
              <div v-else class="device-image-placeholder">
                <el-icon class="placeholder-icon">
                  <Cpu />
                </el-icon>
                <span class="placeholder-text">暂无图片</span>
              </div>
            </div>
            
            <!-- 右侧：设备信息 -->
            <div class="device-info-container">
              <div class="info-row">
                <span class="label"><el-icon>
                    <HomeFilled />
                  </el-icon> 温室：</span>
                <span class="value">{{ device.pastureName || device.pastureId || '未绑定' }}</span>
              </div>
              <div class="info-row sensor-command">
                <span class="label"><el-icon>
                    <Operation />
                  </el-icon> 传感器指令：</span>
                <span class="value">{{ device.sensorCommand || '无' }}</span>
              </div>
              <div class="info-row">
                <span class="label"><el-icon>
                    <Cpu />
                    </el-icon> 设备类型：</span>
                <span class="value">{{ device.deviceTypeName || device.deviceTypeId || '未知' }}</span>
              </div>
              <div class="info-row" v-if="device.lastOnlineTime !== null && device.lastOnlineTime !== undefined">
                <span class="label"><el-icon>
                      <Clock />
                    </el-icon> 最后在线：</span>
                <span class="value">{{ formatDate(device.lastOnlineTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <el-button-group>
            <el-button :class="['card-action-btn', 'status', { 'mobile-btn': isMobile, 'small-mobile-btn': isSmallMobile }]" size="small" v-hasPermi="['server:device:status']"
              @click="handleStatus(device)">
              <el-icon>
                <Operation />
              </el-icon>运行状态
            </el-button>
            <el-button :class="['card-action-btn', 'threshold', { 'mobile-btn': isMobile, 'small-mobile-btn': isSmallMobile }]" size="small" v-hasPermi="['server:device:threshold']"
              @click="handleThreshold(device)">
              <el-icon>
                <Setting />
              </el-icon>设备配置
            </el-button>
            <el-button :class="['card-action-btn', 'edit', { 'mobile-btn': isMobile, 'small-mobile-btn': isSmallMobile }]" size="small" v-hasPermi="['server:device:edit']"
              @click="handleUpdate(device)">
              <el-icon>
                <Edit />
              </el-icon>编辑
            </el-button>
            <el-button :class="['card-action-btn', 'delete', { 'mobile-btn': isMobile, 'small-mobile-btn': isSmallMobile }]" size="small" v-hasPermi="['server:device:remove']"
              @click="handleDelete(device)">
              <el-icon>
                <Delete />
              </el-icon>删除
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
      :page-size="queryParams.pageSize" :current-page="queryParams.pageNum" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :page-sizes="[5, 10, 20, 50]"
      style="margin-top: 20px; text-align: center; display: flex; justify-content: center;" />


    <!-- 添加或修改设备信息对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form v-if="step === 1" ref="deviceRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="温室" prop="pastureId">
          <el-select v-model="form.pastureId" placeholder="请选择温室" clearable
            style="width: 100%" :loading="cascaderLoading">
            <el-option
              v-for="item in pastureOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value || ''"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备图片" prop="deviceImage">
          <div class="el-top upload-container">
            <el-upload class="cover-uploader" :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false"
              :on-success="handleImageSuccess" :on-error="handleImageError" :before-upload="beforeImageUpload">
              <div v-if="!form.deviceImage" class="upload-placeholder">
                <el-icon class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
              <img v-else :src="form.deviceImage" class="cover-image" />
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceTypeId">
          <el-select v-model="form.deviceTypeId" placeholder="请选择设备类型" style="width: 100%">
            <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <WeatherStationStatus v-model="showStatusDialog" :device="currentDevice"
      :status="currentDevice.controlStatus === '1' ? 'online' : 'offline'" @save="onStatusSave" @refresh="getList" />

    <ThresholdConfig v-model="showThresholdDialog" :device="thresholdDevice" @save="onThresholdSave"
      @save-row="onThresholdRowSave" />

    <!-- 一键绑定温室对话框 -->
    <el-dialog title="一键绑定温室" v-model="openBatchBindDialog" width="500px" append-to-body>
      <div style="display: flex; gap: 24px; align-items: flex-start;">
        <!-- 设备多选下拉 -->
        <el-select
          v-model="batchBindSelectedDeviceIds"
          multiple
          clearable
          collapse-tags
          placeholder="请选择设备"
          popper-class="custom-header"
          :max-collapse-tags="1"
          style="width: 220px"
        >
          <template #header>
            <el-checkbox
              v-model="batchBindCheckAll"
              :indeterminate="batchBindIndeterminate"
              @change="handleBatchBindCheckAll"
            >
              全选
            </el-checkbox>
          </template>
          <el-option
            v-for="item in batchBindDeviceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- 温室选择器 -->
        <el-select
          v-model="batchBindPastureId"
          placeholder="请选择温室"
          clearable
          style="width: 220px"
          :loading="cascaderLoading"
        >
          <el-option
            v-for="item in batchBindPastureOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleBatchBindSubmit">确定</el-button>
        <el-button @click="openBatchBindDialog = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { AgricultureDeviceService } from '@/api/device/deviceApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { AgricultureDeviceTypeService } from '@/api/device/devicetypeApi'
import { AgricultureDeviceHeartbeatService } from '@/api/device/deviceheartbeatApi'
import { ref, reactive, nextTick, onMounted, computed, provide, onUnmounted, watch } from 'vue'
import { resetForm, downloadExcel } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureDeviceResult } from '@/types/device/device'
import ThresholdConfig from './ThresholdConfig.vue'
import WeatherStationStatus from './WeatherStationStatus.vue'
import {
  Edit,
  Delete,
  Cpu,
  HomeFilled,
  Operation,
  Clock,
  Plus,
  Setting
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useMqttStore } from '@/store/modules/mqttStore'
import type { CheckboxValueType } from 'element-plus'

const deviceList = ref<AgricultureDeviceResult[]>([])
const open = ref(false)
const loading = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const deviceRef = ref<FormInstance>()
const showStatusDialog = ref(false)
const currentDevice = ref<any>({})
const showThresholdDialog = ref(false)
const thresholdDevice = ref<any>({})
const userStore = useUserStore()
const mqttStore = useMqttStore()
const currentDeviceId = ref<string | null>(null)

// 响应式屏幕尺寸检测
const screenWidth = ref(window.innerWidth)
const isMobile = computed(() => screenWidth.value <= 700)
const isSmallMobile = computed(() => screenWidth.value <= 480)

const handleResize = () => {
  screenWidth.value = window.innerWidth
  console.log('Screen width changed:', screenWidth.value, 'isMobile:', isMobile.value, 'isSmallMobile:', isSmallMobile.value)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
// 设备操作状态管理
const deviceOperationStatus = ref<Map<string, { isOperating: boolean; lastOperation: 'open' | 'close' | null }>>(new Map())
let { accessToken } = userStore
// 传递 token
const uploadHeaders = { Authorization: accessToken }
// 上传路径
const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/common/upload`
// 定义初始表单状态
const initialFormState = {
  id: null,
  deviceName: null,
  deviceTypeId: '',
  alarmStatus: null,
  lastOnlineTime: '',
  pastureId: undefined,
  sensorCommand: null,
  deviceImage: null
}
// 修改表单类型
const form = reactive<{
  id: string | null;
  deviceName: string | null;
  deviceTypeId: string;
  alarmStatus: string | null;
  lastOnlineTime: string;
  pastureId: string | undefined;
  sensorCommand: string | null;
  deviceImage: string | null;
}>({
  ...initialFormState
})
const queryParams = reactive({
  pageNum: 1,
  pageSize: 8,
  deviceName: '',
  deviceTypeId: '',
  alarmStatus: '',
  lastOnlineTime: '',
  pastureId: '',
  sensorCommand: ''
})
const rules = reactive({
  deviceName: [
    {
      required: true,
      message: '设备名称不能为空',
      trigger: ['blur', 'change']
    }
  ],
  deviceTypeId: [
    {
      required: true,
      message: '请选择传感器类型',
      trigger: ['change', 'blur']
    }
  ],
  pastureId: [
    {
      required: true,
      message: '请选择温室',
      trigger: ['change', 'blur']
    }
  ]
})

const cascaderLoading = ref(false)
const deviceTypeOptions = ref<{ value: string, label: string }[]>([])
const pastureOptions = ref<{ value: string, label: string }[]>([])

/** 查询设备所有类型 */
const fetchDeviceTypeOptions = async () => {
  const res = await AgricultureDeviceTypeService.listType({
    pageNum: 1,
    pageSize: 100
  })
  if (res.code === 200 && Array.isArray(res.rows)) {
    deviceTypeOptions.value = res.rows.map((item: any) => ({
      value: String(item.id),
      label: item.typeName
    }))
  }
}

/** 查询设备信息列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureDeviceService.listDevice(queryParams)
  if (res.code === 200) {
    deviceList.value = res.rows
    total.value = res.total
    
    // 批量查询所有设备的心跳数据，获取在线状态和 lastOnlineTime
    const heartbeatPromises = deviceList.value.map(async (device) => {
      try {
        const heartbeatRes: any = await AgricultureDeviceHeartbeatService.listHeartbeat({
          deviceId: device.id,
          pageNum: 1,
          pageSize: 1
        })
        if (heartbeatRes && heartbeatRes.code === 200 && heartbeatRes.rows && heartbeatRes.rows.length > 0) {
          const heartbeatData = heartbeatRes.rows[0]
          // 验证返回的数据的deviceId是否匹配当前设备
          if (heartbeatData.deviceId === device.id || String(heartbeatData.deviceId) === String(device.id)) {
            // 保存在线状态
            device.onlineStatus = heartbeatData.onlineStatus
            // 如果设备表中没有 lastOnlineTime，则使用心跳表的
            if ((!device.lastOnlineTime || device.lastOnlineTime === null) && heartbeatData.lastOnlineTime) {
              device.lastOnlineTime = heartbeatData.lastOnlineTime
            }
          }
        }
      } catch (error) {
        console.error(`查询设备 ${device.id} 的心跳数据失败:`, error)
      }
    })
    await Promise.all(heartbeatPromises)
    
    loading.value = false
    await mqttStore.subscribeAllDeviceTopics(deviceList.value)
  }
}

// 获取设备在线状态
const getDeviceOnlineStatus = (device: any): 'online' | 'offline' => {
  // 从设备表的用户控制开关判断（1=在线，0=离线）
  if (device.userControlSwitch === '1' || device.userControlSwitch === 1) {
    return 'online'
  }
  return 'offline'
}

const columns = reactive([
  { name: '主键ID', show: true },
  { name: '设备名称', show: true },
  { name: '设备类型ID', show: true },
  { name: '告警状态', show: true },
  { name: '最后在线时间', show: true },
  { name: '温室id', show: true },
  { name: '传感器指令', show: true }
])


const changeColumn = (list: any) => {
  columns.values = list
}

// 取消按钮
function cancel() {
  open.value = false
  nextTick(() => {
    if (deviceRef.value) {
      deviceRef.value.clearValidate()
    }
  })
}

// 表单重置
const reset = () => {
  Object.assign(form, {
    ...initialFormState
  })
  nextTick(() => {
    if (deviceRef.value) {
      deviceRef.value.clearValidate()
    }
  })
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 每页条数改变 */
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getList()
}

/** 当前页改变 */
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

// 多选框选中数据
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id)
  multiple.value = !selection.length
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加设备信息'
  currentDeviceId.value = null
  nextTick(() => {
    if (deviceRef.value) {
      deviceRef.value.clearValidate()
    }
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: any) => {
  reset();
  const _id = row.id || ids.value;
  const res = await AgricultureDeviceService.getDevice(_id);
  if (res.code === 200) {
    const data = res.data;
    Object.assign(form, {
      ...data,
      pastureId: data.pastureId ? String(data.pastureId) : undefined
    });
    open.value = true;
    title.value = '修改设备信息';
    currentDeviceId.value = data.id || null
    nextTick(() => {
      if (deviceRef.value) {
        deviceRef.value.clearValidate();
      }
    });
  }
};

/** 提交按钮 */
const submitForm = async () => {
  if (!deviceRef.value) return
  await deviceRef.value.validate(async (valid) => {
    if (valid) {
      const submitData = {
        ...form
      }
      if (form.id != null) {
        const res = await AgricultureDeviceService.updateDevice(submitData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureDeviceService.addDevice(submitData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  const deviceName = row.deviceName || (row.id ? row.id : ids.value)
  const Tr = await ElMessageBox.confirm(`是否确认删除【${deviceName}】设备？`)
  if (Tr) {
    const res = await AgricultureDeviceService.deleteDevice(row.id || ids.value)
    if (res.code === 200) {
      getList()
      ElMessage.success(res.msg)
    }
  }
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureDeviceService.exportExcel(queryParams))
}

// 初始化
onMounted(() => {
  getList()
  fetchDeviceTypeOptions()
  fetchPastureOptions()
  // 初始化屏幕尺寸
  screenWidth.value = window.innerWidth
})

// 日期格式化方法
const formatDate = (date: string | null): string => {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hour = pad(d.getHours())
  const minute = pad(d.getMinutes())
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const formatStatus = (status: string | null, type: 'status' | 'alarmStatus'): string => {
  if (status === null) return '未知状态'
  const statusMap = {
    status: {
      '0': '离线',
      '1': '在线',
      '2': '故障'
    },
    alarmStatus: {
      '0': '数据正常',
      '1': '告警',
      '2': '异常'
    }
  }
  return statusMap[type]?.[status as '0' | '1' | '2'] || '未知状态'
}

/** 设备运行状态按钮操作 */
const handleStatus = (row: any) => {
  currentDevice.value = { ...row }
  showStatusDialog.value = true
}

const onStatusSave = (data: any) => {
  // 处理保存后的逻辑
  console.log('Status saved:', data)
  showStatusDialog.value = false
}

/** 设备配置按钮操作 */
const handleThreshold = (row: any) => {
  thresholdDevice.value = {
    ...row,
    deviceType: row.deviceTypeId
  }
  showThresholdDialog.value = true
}

const onThresholdSave = (data: any) => {
  // 批量保存逻辑
  console.log('批量保存阈值:', data)
  showThresholdDialog.value = false
}

const onThresholdRowSave = (row: any) => {
  // 单行保存逻辑
  console.log('单行保存阈值:', row)
}

const handleImageSuccess = (response: any) => {
  if (response.code === 200) {
    form.deviceImage = response.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

const handleImageError = () => {
  ElMessage.error('图片上传失败')
}

const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}





// 提供 deviceDataMap 给子组件
provide('deviceDataMap', computed(() => mqttStore.deviceDataMap))

// 一键绑定温室相关
const openBatchBindDialog = ref(false)
const batchBindSelectedDeviceIds = ref<CheckboxValueType[]>([])
const batchBindCheckAll = ref(false)
const batchBindIndeterminate = ref(false)
const batchBindPastureId = ref<string>('')
const batchBindDeviceOptions = computed(() => deviceList.value.map(d => ({ value: d.id, label: d.deviceName })))
const batchBindPastureOptions = ref<{ value: string, label: string }[]>([])

watch(batchBindSelectedDeviceIds, (val) => {
  if (val.length === 0) {
    batchBindCheckAll.value = false
    batchBindIndeterminate.value = false
  } else if (val.length === batchBindDeviceOptions.value.length) {
    batchBindCheckAll.value = true
    batchBindIndeterminate.value = false
  } else {
    batchBindIndeterminate.value = true
  }
})

const handleBatchBindCheckAll = (val: CheckboxValueType) => {
  batchBindIndeterminate.value = false
  if (val) {
    batchBindSelectedDeviceIds.value = batchBindDeviceOptions.value.map((_) => _.value)
  } else {
    batchBindSelectedDeviceIds.value = []
  }
}

const handleBatchBindSubmit = async () => {
  if (!batchBindSelectedDeviceIds.value.length) {
    ElMessage.warning('请选择要绑定的设备')
    return
  }
  if (!batchBindPastureId.value) {
    ElMessage.warning('请选择温室')
    return
  }
  // 批量更新设备
  const promises = batchBindSelectedDeviceIds.value.map(async (id) => {
    return AgricultureDeviceService.updateDevice({ id, pastureId: batchBindPastureId.value })
  })
  const results = await Promise.all(promises)
  const successCount = results.filter(r => r.code === 200).length
  if (successCount) {
    ElMessage.success(`成功绑定${successCount}台设备`)
    getList()
    openBatchBindDialog.value = false
    batchBindSelectedDeviceIds.value = []
    batchBindPastureId.value = ''
  } else {
    ElMessage.error('绑定失败')
  }
}

/** 查询温室列表 */
const fetchPastureOptions = async () => {
  const res = await AgriculturePastureService.listPasture({
    pageNum: 1,
    pageSize: 100
  })
  if (res.code === 200 && Array.isArray(res.rows)) {
    pastureOptions.value = res.rows.map((item: any) => ({
      value: String(item.id),
      label: item.name
    }))
    batchBindPastureOptions.value = pastureOptions.value
  }
}
</script>

<style scoped>
.device-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 20px;
  padding: 10px 5px;
}

@media (max-width: 1200px) {
  .device-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 700px) {
  .device-cards-container {
    grid-template-columns: 1fr;
    padding: 10px;
    gap: 12px;
  }
  
  .device-card {
    height: 100%;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .device-name {
    font-size: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .card-body-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .device-image-container {
    width: 100%;
    height: 180px;
    align-self: center;
  }
  
  .info-row {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .label {
    min-width: 100px;
  }
  
  .card-footer {
    padding: 12px 0px;
    min-height: 20px;
    gap: 4px;
  }
  
  .el-button-group {
    gap: 4px;
    flex-wrap: nowrap;
    justify-content: space-between;
    width: 100%;
  }
  

}

@media (max-width: 480px) {
  .device-cards-container {
    padding: 8px;
    gap: 8px;
  }
  
  .card-header {
    padding: 12px;
  }
  
  .device-name {
    font-size: 14px;
  }
  
  .card-body {
    padding: 12px;
  }
  
  .card-body-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .device-image-container {
    width: 100%;
    height: 160px;
  }
  
  .info-row {
    font-size: 13px;
    margin-bottom: 10px;
  }
  
  .label {
    min-width: 90px;
  }
  
  .card-footer {
    padding: 10px 0px;
    min-height: 20px;
    gap: 3px;
  }
  
  .el-button-group {
    width: 100%;
    gap: 3px;
    justify-content: space-between;
  }
  

}

.device-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-card:hover {
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.12);
}

.device-fault {
  border-left: 4px solid #f56c6c;
}

.card-header {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb00 100%);
  border-bottom: 1px solid #e0e0e042;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.device-name .el-icon {
  font-size: 20px;
  color: #409eff;
}

.device-status {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 20px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.card-body-content {
  display: flex;
  gap: 20px;
  flex: 1;
  align-items: flex-start;
}

/* 设备图片容器 */
.device-image-container {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.device-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 8px;
  color: #c0c4cc;
}

.placeholder-text {
  font-size: 12px;
  color: #909399;
}

/* 设备信息容器 */
.device-info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止内容溢出 */
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}


.info-row {
  display: flex;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #909399;
  min-width: 120px;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex-grow: 1;
  word-break: break-all;
  white-space: pre-line;
}

.card-footer {
  padding: 24px 0px;
  background: #f1f1f15c;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  min-height: 24px;
  align-items: center;
  margin-top: auto;
}

/* 保证按钮始终底部对齐 */
.device-card .card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 卡片内容区域 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 占位区域 */
.card-spacer {
  flex: 0 0 20px;
  min-height: 20px;
}

.el-button-group {
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.el-button {
  min-width: 80px;
  border-radius: 8px !important;
  font-weight: 500;
  letter-spacing: 1px;
  transition:
    background 0.2s,
    color 0.2s;
}

.el-button--primary {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.el-button--primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.el-button--danger {
  background: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}

.el-button--danger:hover {
  background: #fa8686;
  border-color: #fa8686;
}

.card-action-btn {
  position: relative;
  border: none !important;
  background: #fff !important;
  color: #409eff !important;
  border-radius: 1.5rem !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  font-weight: 500;
  min-width: 40px;
  min-height: 32px;
  padding: 0 24px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
}

.card-action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #409eff;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 0;
}

.card-action-btn .el-icon {
  font-size: 18px;
  position: relative;
  z-index: 1;
  margin-right: 4px;
}

.card-action-btn span {
  position: relative;
  z-index: 1;
  margin-left: 4px;
}

.card-action-btn.edit {
  color: #409eff !important;
}

.card-action-btn.edit:hover {
  color: #fff !important;
}

.card-action-btn.edit:hover::before {
  transform: translateX(0);
}

.card-action-btn.delete {
  color: #f56c6c !important;
}

.card-action-btn.delete::before {
  background-color: #f56c6c;
}

.card-action-btn.delete:hover {
  color: #fff !important;
}

.card-action-btn.delete:hover::before {
  transform: translateX(0);
}

.tag-offline {
  background: #f4f4f5 !important;
  color: #909399 !important;
  border-color: #e4e7ed !important;
}

.online-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  display: inline-block;
  flex-shrink: 0;
  position: relative;
  vertical-align: middle;
  align-self: center;
  margin-bottom: 2px;
  margin-right: 2px;
}

.online-indicator.breathing {
  background: #67c23a;
}

.online-indicator.breathing::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67c23a;
  opacity: 0.8;
  animation: breathe 2s ease-in-out infinite;
}

.online-indicator.breathing::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67c23a;
  opacity: 0.6;
  animation: breathe 2s ease-in-out 0.5s infinite;
}

@keyframes breathe {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

.info-row .label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-row .el-icon {
  font-size: 16px;
  color: #409eff;
}

.card-action-btn.status {
  color: #67c23a !important;
  position: relative;
  border: none !important;
  background: #fff !important;
  border-radius: 1.5rem !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  font-weight: 500;
  min-width: 44px;
  min-height: 32px;
  padding: 0 24px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-action-btn.status::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #67c23a;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 0;
}

.card-action-btn.status:hover {
  color: #fff !important;
}

.card-action-btn.status:hover::before {
  transform: translateX(0);
}

.card-action-btn.threshold {
  color: #e6a23c !important;
  position: relative;
  border: none !important;
  background: #fff !important;
  border-radius: 1.5rem !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  font-weight: 500;
  min-width: 44px;
  min-height: 32px;
  padding: 0 25px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-action-btn.threshold::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #e6a23c;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 0;
}

.card-action-btn.threshold:hover {
  color: #fff !important;
}

.card-action-btn.threshold:hover::before {
  transform: translateX(0);
}

.card-action-btn.status .el-icon,
.card-action-btn.threshold .el-icon {
  font-size: 16px;
  position: relative;
  z-index: 1;
}

.card-action-btn.status span,
.card-action-btn.threshold span {
  position: relative;
  z-index: 1;
  margin-left: 4px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #c0c4cc;
  /* 默认灰色 */
  flex-shrink: 0;
  align-self: center;
  margin: 0;
}

.status-indicator.online {
  background: #52c41a;
}

.status-indicator.online::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: #52c41a;
  animation: pulse 2s infinite;
  z-index: 0;
}

.status-indicator.offline {
  background: #c0c4cc;
}

.status-indicator.fault {
  background: #f56c6c;
}

.status-indicator.fault::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: #f56c6c;
  animation: pulse 2s infinite;
  z-index: 0;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  70% {
    transform: scale(2);
    opacity: 0;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }

  70% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }

  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.upload-container {
  .cover-uploader {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 6px;
    transition: var(--el-transition-duration);

    &:hover {
      border-color: var(--el-color-primary);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 260px;
      height: 160px;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;

      .upload-icon {
        font-size: 28px;
        color: #8c939d;
      }

      .upload-text {
        margin-top: 8px;
        font-size: 14px;
        color: #8c939d;
      }
    }

    .cover-image {
      display: block;
      width: 260px;
      height: 160px;
      object-fit: contain;
    }
  }

  .el-upload__tip {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }
}

/* 级联选择器样式 */
:deep(.el-cascader) {
  --el-cascader-menu-text-color: #606266;
  --el-cascader-menu-selected-text-color: #409eff;
  --el-cascader-menu-hover-text-color: #409eff;
  --el-cascader-menu-active-color: #409eff;
}

:deep(.el-cascader__dropdown) {
  .el-cascader-panel {
    .el-cascader-menu {
      .el-cascader-menu__item {
        &:hover {
          color: #409eff;
          background: #f5f7fa;
        }

        &.is-active {
          color: #409eff;
          font-weight: bold;
        }
      }
    }
  }
}

:deep(.el-cascader__tags) {
  .el-tag {
    background-color: #ecf5ff;
    border-color: #d9ecff;
    color: #409eff;
  }
}

.card-action-btn.open {
  color: #67c23a !important;
  position: relative;
  border: none !important;
  background: #fff !important;
  border-radius: 1.5rem !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  font-weight: 500;
  min-width: 44px;
  min-height: 32px;
  padding: 0 24px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-action-btn.open::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #67c23a;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 0;
}

.card-action-btn.open:hover {
  color: #fff !important;
}

.card-action-btn.open:hover::before {
  transform: translateX(0);
}

.card-action-btn.close {
  color: #f56c6c !important;
  position: relative;
  border: none !important;
  background: #fff !important;
  border-radius: 1.5rem !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  font-weight: 500;
  min-width: 44px;
  min-height: 32px;
  padding: 0 24px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-action-btn.close::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #f56c6c;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 0;
}

.card-action-btn.close:hover {
  color: #fff !important;
}

.card-action-btn.close:hover::before {
  transform: translateX(0);
}

/* 传感器指令内容字体缩小 */
.info-row .value {
  color: #303133;
  flex-grow: 1;
  word-break: break-all;
  white-space: pre-line;
}

/* 针对传感器指令行的特殊样式 */
.info-row.sensor-command .value {
  font-size: 14px;
}

/* 针对传感器指令行的特殊样式 */
.info-row:has(.label:contains("传感器指令")) .value {
  font-size: 14px;
}

/* 响应式按钮样式 */
.card-action-btn.mobile-btn {
  min-width: 32px !important;
  min-height: 24px !important;
  padding: 0 12px !important;
  font-size: 10px !important;
}

.card-action-btn.mobile-btn .el-icon {
  font-size: 16px !important;
}

.card-action-btn.small-mobile-btn {
  min-width: 28px !important;
  min-height: 20px !important;
  padding: 0 8px !important;
  font-size: 9px !important;
}

.card-action-btn.small-mobile-btn .el-icon {
  font-size: 15px !important;
}

/* 移动端card-content样式 */
.card-content.mobile-content {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-content: space-around;
}

.custom-header {
  .el-checkbox {
    display: flex;
    height: unset;
  }
}

/* 防止设备信息对话框标签换行 */
:deep(.el-dialog .el-form-item__label) {
  white-space: nowrap;
}
</style>
