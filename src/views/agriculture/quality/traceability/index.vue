<template>
  <div class="app-container-sm">
    <!-- 查询表单 -->
    <el-card class="card-margin-bottom">
      <el-form
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="100px"
        class="form-minus-bottom"
      >
        <el-form-item label="批次名称" prop="batchName">
          <el-input
            v-model="queryParams.batchName"
            placeholder="请输入批次名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="溯源编码" prop="traceCode">
          <el-input
            v-model="queryParams.traceCode"
            placeholder="请输入溯源编码"
            clearable
            size="small"
            @keyup.enter="handleQuery"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" size="small" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item class="fr">
          <el-button
            type="primary"
            :icon="Plus"
            size="small"
            @click="handleGenerate"
            v-hasPermi="['agriculture:quality:trace:generate']"
          >生成溯源</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 溯源详情展示 -->
    <el-card v-if="traceDetail" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>溯源详情</span>
          <el-tag type="success" size="large">{{ traceDetail.traceCode }}</el-tag>
        </div>
      </template>

      <!-- 基本信息 -->
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="批次名称">{{ traceDetail.batchName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="种质名称">{{ traceDetail.className || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属温室">{{ traceDetail.pastureName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="溯源编码">{{ traceDetail.traceCode || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 种植信息 -->
      <el-card class="trace-section" v-if="traceDetail.plantingInfo">
        <template #header>
          <span>种植信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="批次ID">{{ traceDetail.plantingInfo.batchId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="批次名称">{{ traceDetail.plantingInfo.batchName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="种植面积">{{ traceDetail.plantingInfo.plantingArea || '-' }} 亩</el-descriptions-item>
          <el-descriptions-item label="种植日期">{{ traceDetail.plantingInfo.plantingDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="预期采收时间">{{ traceDetail.plantingInfo.expectedHarvestTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实际采收时间">{{ traceDetail.plantingInfo.actualHarvestTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="批次状态">
            <el-tag v-if="traceDetail.plantingInfo.status === '0'">未开始</el-tag>
            <el-tag type="warning" v-else-if="traceDetail.plantingInfo.status === '1'">进行中</el-tag>
            <el-tag type="success" v-else-if="traceDetail.plantingInfo.status === '2'">已完成</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 任务执行记录 -->
      <el-card class="trace-section" v-if="traceDetail.taskRecords && traceDetail.taskRecords.length > 0">
        <template #header>
          <span>任务执行记录</span>
        </template>
        <el-table :data="traceDetail.taskRecords" border>
          <el-table-column label="任务名称" prop="taskName" min-width="150" />
          <el-table-column label="计划开始" prop="planStart" min-width="120" />
          <el-table-column label="计划结束" prop="planFinish" min-width="120" />
          <el-table-column label="实际开始" prop="actualStart" min-width="120" />
          <el-table-column label="实际结束" prop="actualFinish" min-width="120" />
          <el-table-column label="状态" prop="status" min-width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === '0'">未分配</el-tag>
              <el-tag type="warning" v-else-if="scope.row.status === '1'">已分配</el-tag>
              <el-tag type="info" v-else-if="scope.row.status === '2'">进行中</el-tag>
              <el-tag type="success" v-else-if="scope.row.status === '3'">已完成</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 质量检测记录 -->
      <el-card class="trace-section" v-if="traceDetail.qualityInspections && traceDetail.qualityInspections.length > 0">
        <template #header>
          <span>质量检测记录</span>
        </template>
        <el-table :data="traceDetail.qualityInspections" border>
          <el-table-column label="检测类型" prop="inspectionType" min-width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.inspectionType === 'growth'">生长期</el-tag>
              <el-tag type="warning" v-else-if="scope.row.inspectionType === 'harvest'">采收期</el-tag>
              <el-tag type="info" v-else-if="scope.row.inspectionType === 'storage'">存储期</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="检测日期" prop="inspectionDate" min-width="120" />
          <el-table-column label="检测项目" prop="inspectionItem" min-width="150" />
          <el-table-column label="检测结果" prop="inspectionResult" min-width="200" show-overflow-tooltip />
          <el-table-column label="是否合格" prop="qualified" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.qualified === '1' ? 'success' : 'danger'">
                {{ scope.row.qualified === '1' ? '合格' : '不合格' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 采收记录 -->
      <el-card class="trace-section" v-if="traceDetail.harvestInfo">
        <template #header>
          <span>采收记录</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="采收日期">{{ traceDetail.harvestInfo.harvestDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="采收时间">{{ traceDetail.harvestInfo.harvestTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="采收重量">{{ traceDetail.harvestInfo.harvestWeight || '-' }} 公斤</el-descriptions-item>
          <el-descriptions-item label="采收面积">{{ traceDetail.harvestInfo.harvestArea || '-' }} 亩</el-descriptions-item>
          <el-descriptions-item label="采收数量">{{ traceDetail.harvestInfo.harvestQuantity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="质量等级">
            <el-tag v-if="traceDetail.harvestInfo.qualityLevel === 'A'" type="success">优</el-tag>
            <el-tag v-else-if="traceDetail.harvestInfo.qualityLevel === 'B'" type="warning">良</el-tag>
            <el-tag v-else-if="traceDetail.harvestInfo.qualityLevel === 'C'">合格</el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="采收次数">{{ traceDetail.harvestInfo.harvestCount || 0 }} 次</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 环境监测数据 -->
      <el-card class="trace-section" v-if="traceDetail.environmentData && traceDetail.environmentData.length > 0">
        <template #header>
          <span>环境监测数据</span>
        </template>
        <el-table :data="traceDetail.environmentData" border>
          <el-table-column label="监测时间" prop="collectTime" min-width="160" />
          <el-table-column label="温度" prop="temperature" min-width="100" />
          <el-table-column label="湿度" prop="humidity" min-width="100" />
          <el-table-column label="光照" prop="light" min-width="100" />
          <el-table-column label="CO2" prop="co2" min-width="100" />
        </el-table>
      </el-card>
    </el-card>

    <!-- 生成溯源对话框 -->
    <el-dialog title="生成溯源信息" v-model="generateDialogVisible" width="500px" append-to-body>
      <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="100px">
        <el-form-item label="批次" prop="batchId">
          <el-select
            v-model="generateForm.batchId"
            placeholder="请选择批次"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="batch in batchList"
              :key="batch.batchId"
              :label="batch.batchName"
              :value="batch.batchId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitGenerate">确 定</el-button>
          <el-button @click="generateDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureQualityService } from '@/api/agriculture/qualityApi'
import { TraceDetailVO } from '@/types/agriculture/quality'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'

const loading = ref(false)
const traceDetail = ref<TraceDetailVO | null>(null)
const queryFormRef = ref<FormInstance>()
const generateFormRef = ref<FormInstance>()
const batchList = ref<any[]>([])
const generateDialogVisible = ref(false)

const queryParams = reactive({
  batchName: '',
  traceCode: ''
})

const generateForm = reactive({
  batchId: null
})

const generateRules = reactive({
  batchId: [{ required: true, message: '批次不能为空', trigger: 'change' }]
})

/** 查询溯源详情 */
const handleQuery = async () => {
  if (!queryParams.traceCode && !queryParams.batchName) {
    ElMessage.warning('请输入批次名称或溯源编码')
    return
  }
  
  loading.value = true
  try {
    if (queryParams.traceCode) {
      // 通过溯源编码查询
      const res = await AgricultureQualityService.getTraceDetail(queryParams.traceCode)
      if (res.code === 200) {
        traceDetail.value = res.data
      }
    } else if (queryParams.batchName) {
      // 通过批次名称查询批次ID，然后构建追溯数据
      const batch = batchList.value.find(b => b.batchName === queryParams.batchName)
      if (batch) {
        const res = await AgricultureQualityService.buildTraceData(batch.batchId)
        if (res.code === 200) {
          traceDetail.value = res.data
        }
      } else {
        ElMessage.warning('未找到该批次')
      }
    }
  } catch (error) {
    console.error('查询溯源详情失败:', error)
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  traceDetail.value = null
}

/** 生成溯源 */
const handleGenerate = () => {
  generateForm.batchId = null
  generateDialogVisible.value = true
}

/** 提交生成溯源 */
const submitGenerate = async () => {
  if (!generateFormRef.value) return
  await generateFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await AgricultureQualityService.generateTrace(generateForm.batchId)
        if (res.code === 200) {
          ElMessage.success('生成溯源信息成功')
          generateDialogVisible.value = false
          // 查询生成的溯源详情
          queryParams.traceCode = res.data.traceCode
          await handleQuery()
        }
      } catch (error) {
        console.error('生成溯源信息失败:', error)
        ElMessage.error('生成失败')
      }
    }
  })
}

/** 获取批次列表 */
const getBatchList = async () => {
  try {
    const res = await AgricultureCropBatchService.listBatch({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200) {
      batchList.value = res.rows || []
    }
  } catch (error) {
    console.error('获取批次列表失败:', error)
  }
}

onMounted(() => {
  getBatchList()
})
</script>

<style lang="scss" scoped>
.card-margin-bottom {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trace-section {
  margin-top: 20px;
}
</style>

