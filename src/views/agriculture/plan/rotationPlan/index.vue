<template>
  <div class="page-content">
    <!-- 轮作计划 -->
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
                  label="计划名称"
                  prop="planName"
                  @keyup.enter="search"
                  v-model="queryParams.planName"
                />
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-form-item label="计划年份" prop="planYear">
                    <el-date-picker
                      v-model="queryParams.planYear"
                      type="year"
                      placeholder="选择年份"
                      format="YYYY"
                      value-format="YYYY"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <form-select
                  label="计划类型"
                  prop="planType"
                  v-model="queryParams.planType"
                  :options="planTypeOptions"
                />
                <form-select
                  label="计划状态"
                  prop="planStatus"
                  v-model="queryParams.planStatus"
                  :options="statusOptions"
                />
              </el-row>
            </el-form>
          </template>
          <template #bottom>
            <el-button @click="handleAdd" v-auth="['agriculture:rotationplan:add']" v-ripple>新增</el-button>
            <el-button @click="handleExport" v-auth="['agriculture:rotationplan:export']" v-ripple>导出</el-button>
          </template>
        </table-bar>

        <!-- 轮作计划列表 -->
        <art-table
          :data="planList"
          :total="total"
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          v-loading="loading"
        >
          <template #default>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="计划ID" prop="planId" width="100" v-if="columns[0].show" />
            <el-table-column label="计划名称" prop="planName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
            <el-table-column label="计划年份" prop="planYear" width="100" align="center" v-if="columns[2].show" />
            <el-table-column label="计划类型" prop="planType" width="120" align="center" v-if="columns[3].show">
              <template #default="scope">
                <el-tag v-if="scope.row.planType === 'annual'" type="primary">年度计划</el-tag>
                <el-tag v-else-if="scope.row.planType === 'seasonal'" type="success">季度计划</el-tag>
                <el-tag v-else-if="scope.row.planType === 'rotation'" type="info">轮作计划</el-tag>
                <el-tag v-else>{{ scope.row.planType || '--' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="轮作周期" prop="rotationCycle" width="120" align="center" v-if="columns[4].show" />
            <el-table-column label="计划状态" prop="planStatus" width="100" align="center" v-if="columns[5].show">
              <template #default="scope">
                <el-tag v-if="scope.row.planStatus === '0'" type="info">未开始</el-tag>
                <el-tag v-else-if="scope.row.planStatus === '1'" type="success">执行中</el-tag>
                <el-tag v-else-if="scope.row.planStatus === '2'" type="primary">已完成</el-tag>
                <el-tag v-else-if="scope.row.planStatus === '3'" type="danger">已取消</el-tag>
                <el-tag v-else>{{ scope.row.planStatus || '--' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="开始日期" prop="startDate" width="120" align="center" v-if="columns[6].show" />
            <el-table-column label="结束日期" prop="endDate" width="120" align="center" v-if="columns[7].show" />
            <el-table-column label="总面积(亩)" prop="totalArea" width="120" align="center" v-if="columns[8].show" />
            <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[9].show" />
            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="handleDetail(scope.row)" v-auth="['agriculture:rotationplan:query']">
                  <el-icon><View /></el-icon>详情
                </el-button>
                <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:rotationplan:edit']">
                  <el-icon><EditPen /></el-icon>修改
                </el-button>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:rotationplan:remove']">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </template>
        </art-table>

    <!-- 添加或修改种植计划对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="form.planName" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="计划年份" prop="planYear">
          <el-date-picker
            v-model="form.planYear"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计划类型" prop="planType">
          <el-select v-model="form.planType" placeholder="请选择计划类型" style="width: 100%">
            <el-option label="年度计划" value="annual" />
            <el-option label="季度计划" value="seasonal" />
            <el-option label="轮作计划" value="rotation" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属温室" prop="pastureId">
          <el-select v-model="form.pastureId" placeholder="请选择所属温室" clearable filterable style="width: 100%">
            <el-option
              v-for="item in pastureOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="轮作周期(年)" prop="rotationCycle" v-if="form.planType === 'rotation'">
          <el-input-number v-model="form.rotationCycle" :min="1" placeholder="请输入轮作周期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="计划状态" prop="planStatus">
          <el-select v-model="form.planStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="未开始" value="0" />
            <el-option label="执行中" value="1" />
            <el-option label="已完成" value="2" />
            <el-option label="已取消" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总面积(亩)" prop="totalArea">
          <el-input-number v-model="form.totalArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="计划描述" prop="planDescription">
          <el-input v-model="form.planDescription" type="textarea" :rows="4" placeholder="请输入计划描述" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 轮作计划详情对话框 -->
    <el-dialog title="轮作计划详情" v-model="detailOpen" width="1200px" append-to-body>
      <div class="detail-content">
        <!-- 轮作明细 -->
        <table-bar
          :showTop="false"
          @search="searchDetailInDialog"
          @reset="resetDetailSearchInDialog"
          @changeColumn="changeColumnDetail"
          :columns="columnsDetail"
        >
          <template #top>
            <el-form :model="detailQueryParams" ref="detailSearchFormRef" label-width="82px">
              <el-row :gutter="20">
                <form-input
                  label="季节类型"
                  prop="seasonType"
                  @keyup.enter="searchDetailInDialog"
                  v-model="detailQueryParams.seasonType"
                />
              </el-row>
            </el-form>
          </template>
          <template #bottom>
            <el-button @click="handleAddDetailInDialog" v-auth="['agriculture:rotationdetail:add']" v-ripple>新增</el-button>
          </template>
        </table-bar>

        <!-- 轮作明细列表 -->
        <art-table
          :data="detailListData"
          :total="detailTotal"
          :current-page="detailQueryParams.pageNum"
          :page-size="detailQueryParams.pageSize"
          @size-change="handleDetailSizeChange"
          @current-change="handleDetailCurrentChange"
          v-loading="detailLoading"
        >
          <template #default>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="明细ID" prop="detailId" width="100" v-if="columnsDetail[0].show" />
            <el-table-column label="种质名称" prop="classId" width="150" v-if="columnsDetail[1].show">
              <template #default="scope">
                {{ getClassName(scope.row.classId) }}
              </template>
            </el-table-column>
            <el-table-column label="轮作顺序" prop="rotationOrder" width="100" align="center" v-if="columnsDetail[2].show" />
            <el-table-column label="季节类型" prop="seasonType" width="120" align="center" v-if="columnsDetail[3].show">
              <template #default="scope">
                {{ getSeasonTypeName(scope.row.seasonType) }}
              </template>
            </el-table-column>
            <el-table-column label="种植面积(亩)" prop="plantingArea" width="120" align="center" v-if="columnsDetail[4].show" />
            <el-table-column label="种植密度" prop="plantingDensity" width="120" align="center" v-if="columnsDetail[5].show" />
            <el-table-column label="预期开始" prop="expectedStartDate" width="120" align="center" v-if="columnsDetail[6].show" />
            <el-table-column label="预期结束" prop="expectedEndDate" width="120" align="center" v-if="columnsDetail[7].show" />
            <el-table-column label="关联批次" prop="batchName" width="150" align="center" v-if="columnsDetail[8].show">
              <template #default="scope">
                {{ scope.row.batchName || '--' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="handleUpdateDetailInDialog(scope.row)" v-auth="['agriculture:rotationdetail:edit']">
                  <el-icon><EditPen /></el-icon>修改
                </el-button>
                <el-button link type="danger" @click="handleDeleteDetailInDialog(scope.row)" v-auth="['agriculture:rotationdetail:remove']">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </template>
        </art-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改轮作明细对话框 -->
    <el-dialog :title="titleDetail" v-model="openDetail" width="600px" append-to-body>
      <el-form ref="detailRef" :model="formDetail" :rules="rulesDetail" label-width="120px">
        <el-form-item label="计划ID" prop="planId" v-if="!detailOpen">
          <el-input v-model="formDetail.planId" placeholder="请输入计划ID" />
        </el-form-item>
        <el-form-item label="计划名称" v-if="detailOpen">
          <el-input :value="detailInfo.planName || detailInfo.rotationName" disabled />
        </el-form-item>
        <el-form-item label="种质" prop="classId">
          <el-select v-model="formDetail.classId" placeholder="请选择种质" filterable style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="轮作顺序" prop="rotationOrder">
          <el-input-number v-model="formDetail.rotationOrder" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="季节类型" prop="seasonType">
          <el-select v-model="formDetail.seasonType" placeholder="请选择季节类型" style="width: 100%">
            <el-option label="春季" value="1" />
            <el-option label="夏季" value="2" />
            <el-option label="秋季" value="3" />
            <el-option label="冬季" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="种植面积(亩)" prop="plantingArea">
          <el-input-number v-model="formDetail.plantingArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="种植密度" prop="plantingDensity">
          <el-input v-model="formDetail.plantingDensity" placeholder="请输入种植密度" />
        </el-form-item>
        <el-form-item label="预期开始日期" prop="expectedStartDate">
          <el-date-picker
            v-model="formDetail.expectedStartDate"
            type="date"
            placeholder="选择预期开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预期结束日期" prop="expectedEndDate">
          <el-date-picker
            v-model="formDetail.expectedEndDate"
            type="date"
            placeholder="选择预期结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formDetail.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFormDetail">确 定</el-button>
          <el-button @click="cancelDetail">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Refresh, Plus, Download, EditPen, Delete, View, List } from '@element-plus/icons-vue'
import { AgricultureRotationPlanService } from '@/api/agriculture/plantingPlanApi'
import { AgricultureRotationDetailService } from '@/api/agriculture/planDetailApi'
import { AgricultureClassService } from '@/api/agriculture/classApi'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureRotationPlanResult } from '@/types/agriculture/plantingPlan'
import { AgricultureRotationDetailResult } from '@/types/agriculture/planDetail'
import { downloadExcel } from '@/utils/utils'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 轮作计划相关
const planList = ref<AgricultureRotationPlanResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const searchFormRef = ref<FormInstance>()
const planRef = ref<FormInstance>()

const columns = reactive([
  { name: '计划ID', show: true },
  { name: '计划名称', show: true },
  { name: '计划年份', show: true },
  { name: '计划类型', show: true },
  { name: '轮作周期', show: true },
  { name: '计划状态', show: true },
  { name: '开始日期', show: true },
  { name: '结束日期', show: true },
  { name: '总面积(亩)', show: true },
  { name: '创建时间', show: true }
])

const statusOptions = ref([
  { label: '未开始', value: '0' },
  { label: '执行中', value: '1' },
  { label: '已完成', value: '2' },
  { label: '已取消', value: '3' }
])

const planTypeOptions = ref([
  { label: '年度计划', value: 'annual' },
  { label: '季度计划', value: 'seasonal' },
  { label: '轮作计划', value: 'rotation' }
])

const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormState = {
  planId: null,
  planName: '',
  planYear: undefined as string | undefined,
  planType: undefined as string | undefined,
  pastureId: undefined as number | string | undefined,
  rotationCycle: undefined as number | string | undefined,
  planDescription: '',
  planStatus: '0',
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  totalArea: undefined as number | string | undefined,
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
  remark: '',
  delFlag: '0'
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planName: '',
  planYear: '',
  planType: '',
  planStatus: ''
})

const rules = reactive({
  planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
  planYear: [{ required: true, message: '计划年份不能为空', trigger: 'change' }],
  planType: [{ required: true, message: '计划类型不能为空', trigger: 'change' }],
  planStatus: [{ required: true, message: '计划状态不能为空', trigger: 'change' }]
})

// 轮作计划和种质映射数据
const rotationPlanMap = ref<Map<string | number, string>>(new Map())
const classMap = ref<Map<string | number, string>>(new Map())
const classOptions = ref<any[]>([])
const pastureOptions = ref<any[]>([])

// 明细表单相关（用于详情对话框）
const openDetail = ref(false)
const titleDetail = ref('')
const detailRef = ref<FormInstance>()

// 明细列表列配置（用于详情对话框）
const columnsDetail = reactive([
  { name: '明细ID', show: true },
  { name: '种质名称', show: true },
  { name: '轮作顺序', show: true },
  { name: '季节类型', show: true },
  { name: '种植面积(亩)', show: true },
  { name: '种植密度', show: true },
  { name: '预期开始', show: true },
  { name: '预期结束', show: true },
  { name: '关联批次', show: true }
])

const changeColumnDetail = (list: any) => {
  columnsDetail.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormStateDetail = {
  detailId: null,
  planId: undefined as number | string | undefined,
  rotationId: undefined as number | string | undefined, // 兼容旧字段
  classId: '',
  rotationOrder: 1,
  seasonType: '',
  plantingArea: null,
  plantingDensity: '',
  expectedStartDate: '',
  expectedEndDate: '',
  remark: ''
}

const formDetail = reactive({ ...initialFormStateDetail })

const rulesDetail = reactive({
  planId: [{ required: true, message: '计划ID不能为空', trigger: 'blur' }],
  classId: [{ required: true, message: '种质ID不能为空', trigger: 'blur' }],
  rotationOrder: [{ required: true, message: '轮作顺序不能为空', trigger: 'blur' }],
  seasonType: [{ required: true, message: '季节类型不能为空', trigger: 'blur' }]
})

/** 查询轮作计划列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureRotationPlanService.listPlan(queryParams)
    if (res.code === 200) {
      planList.value = res.rows || []
      total.value = res.total || 0
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询轮作计划列表失败:', error)
    ElMessage.error('查询失败')
  } finally {
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
  title.value = '添加种植计划'
}

// 详情相关
const detailOpen = ref(false)
const detailLoading = ref(false)
const detailInfo = ref<AgricultureRotationPlanResult>({} as AgricultureRotationPlanResult)
const detailRotationId = ref<string>('')
const detailListData = ref<AgricultureRotationDetailResult[]>([])
const detailTotal = ref(0)
const detailQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planId: '',
  rotationId: '', // 兼容旧字段
  seasonType: ''
})
const detailSearchFormRef = ref<FormInstance>()

/** 详情按钮操作 */
const handleDetail = async (row: AgricultureRotationPlanResult) => {
  detailOpen.value = true
  const planId = row.planId || row.rotationId // 兼容旧字段
  detailRotationId.value = String(planId)
  detailInfo.value = row
  // 重置查询参数
  detailQueryParams.pageNum = 1
  detailQueryParams.pageSize = 10
  detailQueryParams.planId = String(planId)
  detailQueryParams.rotationId = String(planId) // 兼容旧字段
  detailQueryParams.seasonType = ''
  // 先清空数据，避免显示旧数据
  detailListData.value = []
  detailTotal.value = 0
  // 加载轮作明细
  await loadDetailList()
}

/** 加载轮作明细列表（用于详情对话框） */
const loadDetailList = async () => {
  if (!detailRotationId.value) {
    detailListData.value = []
    detailTotal.value = 0
    return
  }
  detailLoading.value = true
  try {
    const queryParams = {
      pageNum: detailQueryParams.pageNum,
      pageSize: detailQueryParams.pageSize,
      planId: detailRotationId.value,
      rotationId: detailRotationId.value, // 兼容旧字段
      seasonType: detailQueryParams.seasonType
    }
    const res = await AgricultureRotationDetailService.listDetail(queryParams)
    if (res.code === 200) {
      detailListData.value = res.rows || []
      detailTotal.value = res.total || 0
      
      // 查询每个明细关联的批次
      await loadBatchNamesForDetails()
    } else {
      detailListData.value = []
      detailTotal.value = 0
      ElMessage.error(res.msg || '获取轮作明细列表失败')
    }
  } catch (error) {
    console.error('获取轮作明细列表异常:', error)
    detailListData.value = []
    detailTotal.value = 0
    ElMessage.error('获取轮作明细列表失败')
  } finally {
    detailLoading.value = false
  }
}

/** 详情对话框中的搜索 */
const searchDetailInDialog = () => {
  detailQueryParams.pageNum = 1
  loadDetailList()
}

/** 详情对话框中的重置 */
const resetDetailSearchInDialog = () => {
  if (detailSearchFormRef.value) {
    detailSearchFormRef.value.resetFields()
  }
  detailQueryParams.seasonType = ''
  searchDetailInDialog()
}

/** 详情对话框中的分页大小改变 */
const handleDetailSizeChange = (size: number) => {
  detailQueryParams.pageSize = size
  loadDetailList()
}

/** 详情对话框中的当前页改变 */
const handleDetailCurrentChange = (page: number) => {
  detailQueryParams.pageNum = page
  loadDetailList()
}

/** 详情对话框中新增明细 */
const handleAddDetailInDialog = () => {
  resetDetail()
  formDetail.planId = detailRotationId.value
  formDetail.rotationId = detailRotationId.value // 兼容旧字段
  openDetail.value = true
  titleDetail.value = '添加轮作明细'
}

/** 详情对话框中修改明细 */
const handleUpdateDetailInDialog = async (row: AgricultureRotationDetailResult) => {
  resetDetail()
  openDetail.value = true
  titleDetail.value = '修改轮作明细'
  const res = await AgricultureRotationDetailService.getDetail(row.detailId)
  if (res.code === 200) {
    Object.assign(formDetail, res.data)
  }
}

/** 详情对话框中删除明细 */
const handleDeleteDetailInDialog = async (row: AgricultureRotationDetailResult) => {
  await ElMessageBox.confirm('是否确认删除轮作明细编号为"' + row.detailId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureRotationDetailService.deleteDetail(row.detailId)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        loadDetailList()
      }
    })
    .catch(() => {})
}

/** 为轮作明细加载批次名称 */
const loadBatchNamesForDetails = async () => {
  if (!detailListData.value || detailListData.value.length === 0) return
  
  try {
    // 查询所有相关的批次（根据轮作计划ID）
    const batchRes = await AgricultureCropBatchService.listBatch({
      rotationPlanId: detailRotationId.value,
      pageNum: 1,
      pageSize: 1000
    })
    
    if (batchRes.code === 200 && batchRes.rows) {
      // 为每个明细匹配批次名称
      detailListData.value.forEach((detail: any) => {
        const seasonMap: { [key: string]: string } = {
          '1': 'spring',
          '2': 'summer',
          '3': 'autumn',
          '4': 'winter'
        }
        const seasonType = seasonMap[String(detail.seasonType)] || detail.seasonType
        
        // 查找匹配的批次（轮作计划ID和季节类型都匹配）
        const matchedBatch = batchRes.rows.find((batch: any) => 
          String(batch.rotationPlanId) === String(detailRotationId.value) &&
          String(batch.seasonType) === String(seasonType)
        )
        
        if (matchedBatch) {
          detail.batchName = matchedBatch.batchName
        } else {
          detail.batchName = '--'
        }
      })
    }
  } catch (error) {
    console.error('加载批次名称失败:', error)
  }
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureRotationPlanResult) => {
  reset()
  open.value = true
  title.value = '修改种植计划'
  const planId = row.planId || row.rotationId // 兼容旧字段
  const res = await AgricultureRotationPlanService.getPlan(planId)
  if (res.code === 200) {
    const data = res.data
    // 兼容旧字段，映射到新字段
    if (data.rotationId && !data.planId) {
      data.planId = data.rotationId
    }
    if (data.rotationName && !data.planName) {
      data.planName = data.rotationName
    }
    if (data.rotationStatus && !data.planStatus) {
      data.planStatus = data.rotationStatus
    }
    if (data.rotationDescription && !data.planDescription) {
      data.planDescription = data.rotationDescription
    }
    Object.assign(form, data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!planRef.value) return
  await planRef.value.validate(async (valid) => {
    if (valid) {
      const planId = form.planId || (form as any).rotationId // 兼容旧字段
      if (planId) {
        const updateData = {
          ...form,
          planId: planId
        }
        const res = await AgricultureRotationPlanService.updatePlan(updateData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        // 新增时设置 delFlag = 0
        const addData = {
          ...form,
          delFlag: '0'
        }
        const res = await AgricultureRotationPlanService.addPlan(addData)
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
const handleDelete = async (row: AgricultureRotationPlanResult) => {
  const planId = row.planId || row.rotationId // 兼容旧字段
  await ElMessageBox.confirm('是否确认删除种植计划编号为"' + planId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureRotationPlanService.deletePlan(planId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureRotationPlanService.exportExcel(queryParams))
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, initialFormState)
}

/** 提交明细按钮 */
const submitFormDetail = async () => {
  if (!detailRef.value) return
  await detailRef.value.validate(async (valid) => {
    if (valid) {
      if (formDetail.detailId) {
        const res = await AgricultureRotationDetailService.updateDetail(formDetail)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          openDetail.value = false
          // 如果详情对话框打开，刷新详情对话框中的列表
          if (detailOpen.value) {
            loadDetailList()
          }
        }
      } else {
        const res = await AgricultureRotationDetailService.addDetail(formDetail)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          openDetail.value = false
          // 如果详情对话框打开，刷新详情对话框中的列表
          if (detailOpen.value) {
            loadDetailList()
          }
        }
      }
    }
  })
}

// 取消明细按钮
const cancelDetail = () => {
  openDetail.value = false
  resetDetail()
}

// 表单重置（明细）
const resetDetail = () => {
  Object.assign(formDetail, initialFormStateDetail)
}

/** 获取季节类型中文名称 */
const getSeasonTypeName = (seasonType: string | undefined | null): string => {
  if (!seasonType) return '--'
  
  const seasonMap: { [key: string]: string } = {
    '1': '春季',
    '2': '夏季',
    '3': '秋季',
    '4': '冬季',
    'spring': '春季',
    'summer': '夏季',
    'autumn': '秋季',
    'fall': '秋季',
    'winter': '冬季',
    '春季': '春季',
    '夏季': '夏季',
    '秋季': '秋季',
    '冬季': '冬季'
  }
  
  const key = String(seasonType).toLowerCase()
  return seasonMap[key] || seasonType
}

/** 获取轮作名称 */
const getRotationName = (rotationId: string | number | undefined | null): string => {
  if (!rotationId) return '--'
  return rotationPlanMap.value.get(rotationId) || String(rotationId)
}

/** 获取种质名称 */
const getClassName = (classId: string | number | undefined | null): string => {
  if (!classId) return '--'
  return classMap.value.get(classId) || String(classId)
}

/** 加载种植计划映射 */
const loadRotationPlanMap = async () => {
  try {
    const res = await AgricultureRotationPlanService.listPlan({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200 && res.rows) {
      rotationPlanMap.value.clear()
      res.rows.forEach((plan: AgricultureRotationPlanResult) => {
        const planId = plan.planId || (plan as any).rotationId // 兼容旧字段
        const planName = plan.planName || (plan as any).rotationName // 兼容旧字段
        if (planId) {
          rotationPlanMap.value.set(String(planId), String(planName || ''))
        }
      })
    }
  } catch (error) {
    console.error('加载种植计划映射失败:', error)
  }
}

/** 加载种质映射 */
const loadClassMap = async () => {
  try {
    const res = await AgricultureClassService.listClass({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200 && res.rows) {
      classMap.value.clear()
      classOptions.value = res.rows || []
      res.rows.forEach((item: any) => {
        classMap.value.set(item.classId, item.className)
      })
    }
  } catch (error) {
    console.error('加载种质映射失败:', error)
  }
}

/** 加载温室列表 */
const loadPastureList = async () => {
  try {
    const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200) {
      pastureOptions.value = res.rows || []
    }
  } catch (error) {
    console.error('加载温室列表失败:', error)
  }
}

// 初始化
onMounted(() => {
  // 加载映射数据
  loadRotationPlanMap()
  loadClassMap()
  loadPastureList()
  
  getList()
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}

.detail-content {
  padding: 10px 0;
}
</style>
