<template>
  <div class="page-content">
    <!-- 批次管理 -->
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="批次名称"
              prop="batchName"
              @keyup.enter="search"
              v-model="queryParams.batchName"
            />
            <form-select
              label="批次状态"
              prop="status"
              v-model="queryParams.status"
              :options="statusOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:batch:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:batch:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 批次列表 -->
    <art-table
      :data="batchList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="批次ID" prop="batchId" width="100" v-if="columns[0].show" />
        <el-table-column label="批次名称" prop="batchName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
        <el-table-column label="种质" prop="className" width="120" align="center" v-if="columns[2].show" />
        <el-table-column label="所属温室" prop="pastureId" width="120" align="center" v-if="columns[3].show" />
        <el-table-column label="种植面积(亩)" prop="cropArea" width="120" align="center" v-if="columns[4].show" />
        <el-table-column label="负责人" prop="nickName" width="100" align="center" v-if="columns[5].show" />
        <el-table-column label="开始时间" prop="startTime" width="120" align="center" v-if="columns[6].show" />
        <el-table-column label="状态" prop="status" width="100" align="center" v-if="columns[7].show">
          <template #default="scope">
            <el-tag v-if="String(scope.row.status) === '0'" type="info">未开始</el-tag>
            <el-tag v-else-if="String(scope.row.status) === '1'" type="success">进行中</el-tag>
            <el-tag v-else-if="String(scope.row.status) === '2'" type="primary">已完成</el-tag>
            <el-tag v-else-if="String(scope.row.status) === '3'" type="danger">已取消</el-tag>
            <el-tag v-else-if="scope.row.status" type="info">{{ scope.row.status }}</el-tag>
            <el-tag v-else type="info">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[8].show" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)" v-auth="['agriculture:batch:query']">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:batch:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:batch:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改批次对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="batchRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="批次名称" prop="batchName">
          <el-input v-model="form.batchName" placeholder="请输入批次名称" />
        </el-form-item>
        <el-form-item label="种植种质" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择种植种质" clearable style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属温室" prop="pastureId">
          <el-select v-model="form.pastureId" placeholder="请选择所属温室" clearable style="width: 100%">
            <el-option
              v-for="item in pastureOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="种植计划" prop="planId">
          <el-select 
            v-model="form.planId" 
            placeholder="请选择种植计划" 
            clearable 
            filterable 
            style="width: 100%"
            @change="handlePlanChange"
          >
            <el-option
              v-for="item in planOptions"
              :key="item.planId"
              :label="`${item.planName} (${item.planYear || '--'})`"
              :value="item.planId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="轮作计划/季节类型" prop="rotationPlanSeason">
          <el-cascader
            v-model="rotationPlanSeasonValue"
            :options="cascaderOptions"
            :props="cascaderProps"
            placeholder="请选择轮作计划和季节类型"
            clearable
            filterable
            style="width: 100%"
            @change="handleCascaderChange"
          />
        </el-form-item>
        <el-form-item label="种植面积(亩)" prop="cropArea">
          <el-input-number v-model="form.cropArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="种植密度(株/亩)" prop="plantingDensity">
          <el-input-number v-model="form.plantingDensity" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人" prop="responsiblePersonId">
          <el-select v-model="form.responsiblePersonId" placeholder="请选择负责人" clearable style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预期收获时间" prop="expectedHarvestTime">
          <el-date-picker
            v-model="form.expectedHarvestTime"
            type="datetime"
            placeholder="选择预期收获时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="未开始" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已完成" value="2" />
            <el-option label="已取消" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Refresh, Plus, Download, Document, EditPen, Delete, View } from '@element-plus/icons-vue'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { AgricultureClassService } from '@/api/agriculture/classApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { AgricultureRotationPlanService } from '@/api/agriculture/plantingPlanApi'
import { AgricultureRotationDetailService } from '@/api/agriculture/planDetailApi'
import { UserService } from '@/api/system/userApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureCropBatchResult } from '@/types/agriculture/batch'
import { downloadExcel } from '@/utils/utils'
import { useRouter } from 'vue-router'

const router = useRouter()
const batchList = ref<AgricultureCropBatchResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const searchFormRef = ref<FormInstance>()
const batchRef = ref<FormInstance>()
const classOptions = ref<any[]>([])
const pastureOptions = ref<any[]>([])
const rotationPlanOptions = ref<any[]>([])
const planOptions = ref<any[]>([])
const seasonTypeOptions = ref<Array<{label: string, value: string}>>([])
const userOptions = ref<any[]>([])
const rotationPlanSeasonValue = ref<(string | number)[]>([])
const cascaderOptions = ref<any[]>([])
const cascaderProps = {
  expandTrigger: 'hover' as const,
  value: 'value',
  label: 'label',
  children: 'children'
}

const columns = reactive([
  { name: '批次ID', show: true },
  { name: '批次名称', show: true },
  { name: '种质', show: true },
  { name: '所属温室', show: true },
  { name: '种植面积(亩)', show: true },
  { name: '负责人', show: true },
  { name: '开始时间', show: true },
  { name: '状态', show: true },
  { name: '创建时间', show: true }
])

const statusOptions = ref([
  { label: '未开始', value: '0' },
  { label: '进行中', value: '1' },
  { label: '已完成', value: '2' },
  { label: '已取消', value: '3' }
])

const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormState = {
  batchId: null,
  batchName: '',
  classId: undefined as number | undefined,
  pastureId: undefined as number | undefined,
  planYear: undefined as string | undefined,
  seasonType: undefined as string | undefined,
  rotationPlanId: undefined as number | undefined,
  planId: undefined as number | undefined,
  plantingDensity: undefined as number | undefined,
  cropArea: 0,
  responsiblePersonId: undefined as number | undefined,
  startTime: '',
  expectedHarvestTime: undefined as string | undefined,
  status: '0',
  harvest: '1',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  batchName: '',
  status: ''
})

const rules = reactive({
  batchName: [{ required: true, message: '批次名称不能为空', trigger: 'blur' }],
  classId: [{ required: true, message: '种植种质不能为空', trigger: 'change' }],
  pastureId: [{ required: true, message: '所属温室不能为空', trigger: 'change' }],
  cropArea: [{ required: true, message: '种植面积不能为空', trigger: 'blur' }]
})

/** 查询批次列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureCropBatchService.listBatch(queryParams)
  if (res.code === 200) {
    // 处理状态值，确保统一为字符串格式，空值默认为 '0'（未开始）
    batchList.value = (res.rows || []).map(item => ({
      ...item,
      status: item.status != null && item.status !== '' && item.status !== undefined ? String(item.status) : '0'
    }))
    total.value = res.total
    loading.value = false
  }
}

/** 搜索按钮操作 */
const search = () => {
  queryParams.pageNum = 1
  getList()
}

const handleQuery = search

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

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加批次'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureCropBatchResult) => {
  reset()
  open.value = true
  title.value = '修改批次'
  const res = await AgricultureCropBatchService.getBatch(row.batchId)
  if (res.code === 200) {
    // 确保状态值为字符串格式
    const data = {
      ...res.data,
      status: res.data.status != null && res.data.status !== '' && res.data.status !== undefined ? String(res.data.status) : '0'
    }
    Object.assign(form, data)
    
    // 设置级联选择器的值
    // 如果批次关联了种植计划且是轮作计划类型，需要通过planId找到对应的轮作计划
    if (data.planId && data.seasonType) {
      // 查找对应的轮作计划（如果种植计划类型是轮作计划）
      const plan = planOptions.value.find(p => p.planId == data.planId)
      if (plan && plan.planType === 'rotation') {
        // 查找对应的轮作计划（通过planId匹配）
        const rotationPlan = rotationPlanOptions.value.find(rp => rp.planId == data.planId || (rp as any).rotationId == data.planId)
        if (rotationPlan) {
          const rotationId = rotationPlan.planId || (rotationPlan as any).rotationId
          rotationPlanSeasonValue.value = [Number(rotationId), String(data.seasonType)]
        } else {
          rotationPlanSeasonValue.value = []
        }
      } else {
        rotationPlanSeasonValue.value = []
      }
    } else {
      rotationPlanSeasonValue.value = []
    }
  }
}

/** 详情按钮操作 */
const handleDetail = (row: AgricultureCropBatchResult) => {
  router.push({
    path: '/agriculture/plan/batch/detail',
    query: { batchId: row.batchId }
  })
}

/** 提交按钮 */
const submitForm = async () => {
  if (!batchRef.value) return
  await batchRef.value.validate(async (valid) => {
    if (valid) {
      // 确保状态值为字符串格式，并移除前端临时字段rotationPlanId
      const { rotationPlanId, ...formData } = form
      const submitData = {
        ...formData,
        status: form.status != null && form.status !== '' && form.status !== undefined ? String(form.status) : '0'
      }
      console.log('提交的数据:', submitData)
      if (form.batchId) {
        const res = await AgricultureCropBatchService.updateBatch(submitData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        } else {
          ElMessage.error(res.msg || '更新失败')
        }
      } else {
        const res = await AgricultureCropBatchService.addBatch(submitData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        } else {
          ElMessage.error(res.msg || '添加失败')
        }
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: AgricultureCropBatchResult) => {
  await ElMessageBox.confirm('是否确认删除批次编号为"' + row.batchId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureCropBatchService.deleteBatch(row.batchId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureCropBatchService.exportExcel(queryParams))
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, initialFormState)
  // 清空级联选择器的值
  rotationPlanSeasonValue.value = []
}

/** 获取种植列表 */
const getClassList = async () => {
  const res = await AgricultureClassService.listClass({})
  if (res.code === 200) {
    classOptions.value = res.rows || []
  }
}

/** 获取温室列表 */
const getPastureList = async () => {
  const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 1000 })
  if (res.code === 200) {
    pastureOptions.value = res.rows || []
  }
}

/** 获取轮作计划列表 */
const getRotationPlanList = async () => {
  const res = await AgricultureRotationPlanService.listPlan({ pageNum: 1, pageSize: 1000 })
  if (res.code === 200) {
    rotationPlanOptions.value = res.rows || []
    // 构建级联选择器的选项
    await buildCascaderOptions()
  }
}

/** 获取种植计划列表 */
const getPlanList = async () => {
  const res = await AgricultureRotationPlanService.listPlan({ pageNum: 1, pageSize: 1000 })
  if (res.code === 200) {
    planOptions.value = res.rows || []
  }
}

/** 种植计划改变事件 */
const handlePlanChange = (planId: number | string | null) => {
  if (planId) {
    // 查找选中的种植计划
    const selectedPlan = planOptions.value.find(plan => plan.planId == planId)
    if (selectedPlan) {
      // 自动填充计划年份
      form.planYear = selectedPlan.planYear
    }
  } else {
    form.planYear = undefined
  }
}

/** 构建级联选择器的选项 */
const buildCascaderOptions = async () => {
  const options: any[] = []
  
  for (const plan of rotationPlanOptions.value) {
    try {
      // 查询该轮作计划的明细
      const res = await AgricultureRotationDetailService.listDetail({
        rotationId: plan.rotationId,
        pageNum: 1,
        pageSize: 1000
      })
      
      if (res.code === 200 && res.rows && res.rows.length > 0) {
        // 从明细中提取季节类型
        const seasonTypeSet = new Set<string>()
        res.rows.forEach((detail: any) => {
          if (detail.seasonType) {
            // 将数字季节类型转换为字符串
            const seasonMap: { [key: string]: string } = {
              '1': 'spring',
              '2': 'summer',
              '3': 'autumn',
              '4': 'winter'
            }
            const seasonType = seasonMap[String(detail.seasonType)] || detail.seasonType
            seasonTypeSet.add(seasonType)
          }
        })
        
        // 构建季节类型选项
        const seasonTypeLabels: { [key: string]: string } = {
          'spring': '春季',
          'summer': '夏季',
          'autumn': '秋季',
          'winter': '冬季'
        }
        
        const children = Array.from(seasonTypeSet)
          .map(value => ({
            label: seasonTypeLabels[value] || value,
            value: value
          }))
          .sort((a, b) => {
            // 按季节顺序排序：春、夏、秋、冬
            const order = ['spring', 'summer', 'autumn', 'winter']
            return order.indexOf(a.value) - order.indexOf(b.value)
          })
        
        if (children.length > 0) {
          options.push({
            label: plan.rotationName,
            value: plan.rotationId,
            children: children
          })
        }
      }
    } catch (error) {
      console.error(`获取轮作计划 ${plan.rotationId} 的明细失败:`, error)
    }
  }
  
  cascaderOptions.value = options
}

/** 级联选择器改变事件 */
const handleCascaderChange = (value: any) => {
  if (Array.isArray(value) && value.length === 2) {
    form.rotationPlanId = Number(value[0])
    form.seasonType = String(value[1])
  } else {
    form.rotationPlanId = undefined
    form.seasonType = undefined
  }
}

/** 获取用户列表 */
const getUserList = async () => {
  try {
    // 先查询第一页，获取总数
    const firstRes = await UserService.listUser({ pageNum: 1, pageSize: 100 })
    if (firstRes.code === 200) {
      const total = firstRes.total || 0
      const firstPageRows = firstRes.rows || []
      
      // 如果总数小于等于100，直接使用第一页数据
      if (total <= 100) {
        userOptions.value = firstPageRows
        return
      }
      
      // 如果总数大于100，需要分页查询所有数据
      const allUsers = [...firstPageRows]
      const totalPages = Math.ceil(total / 100)
      
      // 并发查询剩余页
      const promises = []
      for (let page = 2; page <= totalPages; page++) {
        promises.push(UserService.listUser({ pageNum: page, pageSize: 100 }))
      }
      
      const results = await Promise.all(promises)
      results.forEach((res: any) => {
        if (res.code === 200 && res.rows) {
          allUsers.push(...res.rows)
        }
      })
      
      userOptions.value = allUsers
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 初始化
onMounted(() => {
  getList()
  getClassList()
  getPastureList()
  getRotationPlanList()
  getPlanList()
  getUserList()
  
  // 检查是否有从轮作计划明细传递的参数
  const route = router.currentRoute.value
  if (route.query.fromRotationDetail === 'true') {
    handleAddFromRotationDetail(route.query)
  }
})

/** 从轮作计划明细创建批次 */
const handleAddFromRotationDetail = async (params: any) => {
  reset()
  open.value = true
  title.value = '从轮作计划明细创建批次'
  
  // 填充表单数据
  if (params.classId) form.classId = Number(params.classId)
  if (params.planYear) form.planYear = String(params.planYear)
  if (params.plantingDensity) form.plantingDensity = Number(params.plantingDensity)
  if (params.plantingArea) form.cropArea = Number(params.plantingArea)
  if (params.expectedStartDate) {
    // 将日期格式转换为日期时间格式
    const startDate = String(params.expectedStartDate)
    form.startTime = startDate.includes(' ') ? startDate : `${startDate} 00:00:00`
  }
  if (params.expectedEndDate) {
    // 将日期格式转换为日期时间格式
    const endDate = String(params.expectedEndDate)
    form.expectedHarvestTime = endDate.includes(' ') ? endDate : `${endDate} 00:00:00`
  }
  if (params.pastureId) form.pastureId = Number(params.pastureId)
  
  // 设置级联选择器的值
  if (params.rotationPlanId && params.seasonType) {
    // 将数字季节类型转换为字符串
    const seasonMap: { [key: string]: string } = {
      '1': 'spring',
      '2': 'summer',
      '3': 'autumn',
      '4': 'winter'
    }
    const seasonType = seasonMap[String(params.seasonType)] || params.seasonType
    
    // 等待级联选项加载完成
    await buildCascaderOptions()
    
    // 设置级联选择器的值
    rotationPlanSeasonValue.value = [Number(params.rotationPlanId), seasonType]
    form.rotationPlanId = Number(params.rotationPlanId)
    form.seasonType = seasonType
  }
  
  // 生成批次名称
  if (params.rotationName && params.seasonType) {
    const seasonNames: { [key: string]: string } = {
      '1': '春季',
      '2': '夏季',
      '3': '秋季',
      '4': '冬季',
      'spring': '春季',
      'summer': '夏季',
      'autumn': '秋季',
      'winter': '冬季'
    }
    const seasonName = seasonNames[String(params.seasonType)] || ''
    form.batchName = `${params.rotationName}-${seasonName}批次`
  }
}
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}
</style>

