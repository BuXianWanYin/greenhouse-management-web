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
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-form-item label="种植作物" prop="classId">
                    <el-select v-model="queryParams.classId" filterable clearable placeholder="全部" style="width: 100%" @change="search">
                      <el-option v-for="crop in classOptions" :key="crop.classId" :label="crop.className" :value="crop.classId" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
          <template #bottom>
            <el-button @click="handleAdd" v-hasPermi="['agriculture:plantingplan:add']" v-ripple>新增</el-button>
            <el-button @click="handleExport" v-hasPermi="['agriculture:plantingplan:export']" v-ripple>导出</el-button>
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
                <el-tag v-else-if="scope.row.planType === 'rotation'" type="warning">轮作计划</el-tag>
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
            <el-table-column label="预期开始" prop="startDate" width="120" align="center" v-if="columns[6].show" />
            <el-table-column label="预期结束" prop="endDate" width="120" align="center" v-if="columns[7].show" />
            <el-table-column label="实际开始" prop="actualStartDate" width="120" align="center" v-if="columns[8].show">
              <template #default="scope">
                {{ scope.row.actualStartDate || '--' }}
              </template>
            </el-table-column>
            <el-table-column label="实际结束" prop="actualEndDate" width="120" align="center" v-if="columns[9].show">
              <template #default="scope">
                {{ scope.row.actualEndDate || '--' }}
              </template>
            </el-table-column>
            <el-table-column label="总面积(亩)" prop="totalArea" width="120" align="center" v-if="columns[10].show" />
            <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[11].show" />
            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['agriculture:plantingplan:list']">
                  <el-icon><View /></el-icon>详情
                </el-button>
                <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['agriculture:plantingplan:edit']">
                  <el-icon><EditPen /></el-icon>修改
                </el-button>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['agriculture:plantingplan:remove']">
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
        <el-form-item label="计划年份" prop="planYear" v-if="form.planType !== 'seasonal'">
          <el-date-picker
            v-model="form.planYear"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            style="width: 100%"
            @change="handlePlanYearChange"
          />
        </el-form-item>
        <el-form-item label="计划类型" prop="planType" v-if="form.planType !== 'seasonal'">
          <el-select 
            v-model="form.planType" 
            placeholder="请选择计划类型" 
            style="width: 100%" 
            @change="handlePlanTypeChange"
          >
            <el-option label="年度计划" value="annual" />
            <el-option v-if="form.planId || form.parentPlanId" label="季度计划" value="seasonal" />
            <el-option label="轮作计划" value="rotation" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属温室" prop="pastureId" v-if="form.planType !== 'seasonal'">
          <el-select 
            v-model="form.pastureId" 
            placeholder="请选择所属温室" 
            clearable 
            filterable 
            style="width: 100%"
            @change="handlePastureIdChange"
          >
            <el-option
              v-for="item in pastureOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="季节类型" prop="seasonType" v-if="form.planType === 'seasonal'">
          <el-select v-model="form.seasonType" placeholder="请选择季节类型" style="width: 100%">
            <el-option label="春季" value="spring" />
            <el-option label="夏季" value="summer" />
            <el-option label="秋季" value="autumn" />
            <el-option label="冬季" value="winter" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物" prop="classId" v-if="form.planType === 'seasonal'">
          <el-select v-model="form.classId" placeholder="请选择作物" filterable style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="轮作周期(年)" prop="rotationCycle" v-if="form.planType === 'rotation'">
          <el-input-number 
            v-model="form.rotationCycle" 
            :min="1" 
            :max="6"
            placeholder="请输入轮作周期" 
            style="width: 100%"
            @change="handleRotationCycleChange"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            轮作周期范围为1-6年
          </div>
        </el-form-item>
        <el-form-item label="计划状态" prop="planStatus">
          <el-select 
            v-model="form.planStatus" 
            placeholder="请选择状态" 
            style="width: 100%"
            :disabled="form.planType === 'annual' && hasSeasonalPlans || form.planType === 'rotation' || form.planType === 'seasonal'"
          >
            <el-option label="未开始" value="0" />
            <el-option label="执行中" value="1" />
            <el-option label="已完成" value="2" />
          </el-select>
          <div v-if="form.planType === 'annual' && hasSeasonalPlans" style="color: #909399; font-size: 12px; margin-top: 4px;">
            年度计划状态由季度计划状态自动计算，不可手动修改
          </div>
          <div v-if="form.planType === 'rotation' || form.planType === 'seasonal'" style="color: #909399; font-size: 12px; margin-top: 4px;">
            计划状态由系统根据执行情况自动更新，不可手动修改
          </div>
        </el-form-item>
        <el-form-item label="日期范围" prop="dateRange" v-if="form.planType === 'annual'">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled-date="disabledAnnualPlanDateRange"
            @change="handleAnnualPlanDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate" v-if="form.planType === 'seasonal'">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled-date="disabledSeasonalPlanStartDate"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate" v-if="form.planType === 'seasonal'">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled-date="disabledSeasonalPlanEndDate"
          />
        </el-form-item>
        <el-form-item label="日期范围" prop="dateYearRange" v-if="form.planType === 'rotation'">
          <el-date-picker
            v-model="form.dateYearRange"
            type="yearrange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始年份"
            end-placeholder="结束年份"
            format="YYYY"
            value-format="YYYY"
            style="width: 100%"
            disabled
          />
          <div v-if="form.planYear && form.rotationCycle" style="color: #909399; font-size: 12px; margin-top: 4px;">
            日期范围根据计划年份（{{ form.planYear }}年）和轮作周期（{{ form.rotationCycle }}年）自动计算
          </div>
          <div v-else-if="!form.planYear" style="color: #909399; font-size: 12px; margin-top: 4px;">
            请先选择计划年份
          </div>
          <div v-else-if="!form.rotationCycle" style="color: #909399; font-size: 12px; margin-top: 4px;">
            请先输入轮作周期
          </div>
        </el-form-item>
        <el-form-item label="总面积(亩)" prop="totalArea">
          <el-input-number 
            v-model="form.totalArea" 
            :min="0.01" 
            :precision="2" 
            style="width: 100%"
            :max="form.planType === 'seasonal' && parentAnnualPlanTotalArea !== null ? parentAnnualPlanTotalArea : undefined"
          />
          <div v-if="form.pastureId && form.planType !== 'seasonal'" style="color: #909399; font-size: 12px; margin-top: 4px;">
            <span v-if="getPastureArea(form.pastureId) > 0">
              温室面积：{{ getPastureArea(form.pastureId) }}亩
            </span>
            <span v-else>无法获取温室面积信息</span>
          </div>
          <div v-if="form.planType === 'seasonal' && parentAnnualPlanTotalArea !== null && form.totalArea && Number(form.totalArea) > parentAnnualPlanTotalArea" style="color: #F56C6C; font-size: 12px; margin-top: 4px;">
            年度计划总面积：{{ parentAnnualPlanTotalArea }}亩，季度计划总面积不能超过此值
          </div>
        </el-form-item>
        <el-form-item label="种植密度(株/亩)" prop="plantingDensity" v-if="form.planType === 'seasonal'">
          <el-input-number 
            v-model="form.plantingDensity" 
            :min="0" 
            :precision="0" 
            placeholder="请输入种植密度"
            style="width: 100%"
          />
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

    <!-- 轮作计划明细对话框 -->
    <el-dialog :title="detailTitle" v-model="detailOpen" width="90%" append-to-body>
      <div class="detail-content" v-if="detailInfo.planType === 'rotation'">
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
                <form-select
                  label="轮作顺序"
                  prop="rotationOrder"
                  v-model="detailQueryParams.rotationOrder"
                  :options="rotationOrderOptions"
                  clearable
                  @change="searchDetailInDialog"
                />
                <form-select
                  label="季节类型"
                  prop="seasonType"
                  v-model="detailQueryParams.seasonType"
                  :options="seasonTypeOptions"
                  clearable
                  @change="searchDetailInDialog"
                />
              </el-row>
            </el-form>
          </template>
          <template #bottom>
            <el-button @click="handleAddDetailInDialog" v-hasPermi="['agriculture:plandetail:add']" v-ripple>新增</el-button>
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
          style="width: 100%"
        >
          <template #default>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="轮作顺序" prop="rotationOrder" min-width="90" align="center" v-if="columnsDetail[0].show">
              <template #default="scope">
                <el-tag type="primary" effect="plain" size="small">第{{ scope.row.rotationOrder }}年</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="作物名称" prop="classId" min-width="100" v-if="columnsDetail[1].show" show-overflow-tooltip>
              <template #default="scope">
                {{ getClassName(scope.row.classId) }}
              </template>
            </el-table-column>
            <el-table-column label="季节类型" prop="seasonType" min-width="90" align="center" v-if="columnsDetail[2].show">
              <template #default="scope">
                <el-tag :type="getSeasonTypeTagType(scope.row.seasonType)" effect="dark" size="small">
                  {{ getSeasonTypeName(scope.row.seasonType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="种植面积(亩)" prop="plantingArea" min-width="100" align="center" v-if="columnsDetail[3].show" />
            <el-table-column label="种植密度" prop="plantingDensity" min-width="90" align="center" v-if="columnsDetail[4].show" />
            <el-table-column label="预期开始" prop="expectedStartDate" min-width="100" align="center" v-if="columnsDetail[5].show" />
            <el-table-column label="预期结束" prop="expectedEndDate" min-width="100" align="center" v-if="columnsDetail[6].show" />
            <el-table-column label="实际开始" prop="actualStartDate" min-width="100" align="center" v-if="columnsDetail[7].show" />
            <el-table-column label="实际结束" prop="actualEndDate" min-width="100" align="center" v-if="columnsDetail[8].show" />
            <el-table-column label="关联批次" prop="batchNames" min-width="120" align="center" v-if="columnsDetail[9].show" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.batchNames && scope.row.batchNames.length > 0 ? scope.row.batchNames.join('、') : '--' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="150" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="handleUpdateDetailInDialog(scope.row)" v-hasPermi="['agriculture:plandetail:edit']">
                  <el-icon><EditPen /></el-icon>修改
                </el-button>
                <el-button link type="danger" @click="handleDeleteDetailInDialog(scope.row)" v-hasPermi="['agriculture:plandetail:remove']">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </template>
        </art-table>
      </div>
      <!-- 年度/季度计划详情 -->
      <div class="detail-content" v-else>
        <!-- 年度计划详情，显示季度计划列表 -->
        <div v-if="detailInfo.planType === 'annual'">
          <!-- 季度计划列表 -->
          <table-bar
            :showTop="false"
            @search="searchSeasonalPlanInDialog"
            @reset="resetSeasonalPlanSearchInDialog"
            @changeColumn="changeColumnSeasonalPlan"
            :columns="columnsSeasonalPlan"
          >
            <template #top>
              <el-form :model="seasonalPlanQueryParams" ref="seasonalPlanSearchFormRef" label-width="82px">
                <el-row :gutter="20">
                  <form-input
                    label="计划名称"
                    prop="planName"
                    @keyup.enter="searchSeasonalPlanInDialog"
                    v-model="seasonalPlanQueryParams.planName"
                  />
                </el-row>
              </el-form>
            </template>
            <template #bottom>
              <el-button @click="handleAddSeasonalPlanInDialog" v-hasPermi="['agriculture:plantingplan:add']" v-ripple>新增季度计划</el-button>
            </template>
          </table-bar>

          <!-- 季度计划列表 -->
          <art-table
            :data="seasonalPlanListData"
            :total="seasonalPlanTotal"
            :current-page="seasonalPlanQueryParams.pageNum"
            :page-size="seasonalPlanQueryParams.pageSize"
            @size-change="handleSeasonalPlanSizeChange"
            @current-change="handleSeasonalPlanCurrentChange"
            v-loading="seasonalPlanLoading"
            style="width: 100%"
          >
            <template #default>
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="计划名称" prop="planName" min-width="100" show-overflow-tooltip v-if="columnsSeasonalPlan[0].show" />
              <el-table-column label="计划年份" prop="planYear" min-width="90" align="center" v-if="columnsSeasonalPlan[1].show">
                <template #default="scope">
                  <el-tag type="primary" effect="plain" size="small">{{ scope.row.planYear }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="季节类型" prop="seasonType" min-width="90" align="center" v-if="columnsSeasonalPlan[2].show">
                <template #default="scope">
                  <el-tag :type="getSeasonTypeTagType(scope.row.seasonType)" effect="dark" size="small">
                    {{ getSeasonTypeName(scope.row.seasonType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="所属温室" prop="pastureId" min-width="110" align="center" v-if="columnsSeasonalPlan[3].show" show-overflow-tooltip>
                <template #default="scope">
                  {{ getPastureName(scope.row.pastureId) }}
                </template>
              </el-table-column>
              <el-table-column label="作物" prop="classId" min-width="90" align="center" v-if="columnsSeasonalPlan[4].show" show-overflow-tooltip>
                <template #default="scope">
                  {{ getClassName(scope.row.classId) }}
                </template>
              </el-table-column>
              <el-table-column label="总面积(亩)" prop="totalArea" min-width="100" align="center" v-if="columnsSeasonalPlan[5].show" />
              <el-table-column label="种植密度(株/亩)" prop="plantingDensity" min-width="120" align="center" v-if="columnsSeasonalPlan[6].show" />
              <el-table-column label="预期开始" prop="startDate" min-width="100" align="center" v-if="columnsSeasonalPlan[7].show" />
              <el-table-column label="预期结束" prop="endDate" min-width="100" align="center" v-if="columnsSeasonalPlan[8].show" />
              <el-table-column label="实际开始" prop="actualStartDate" min-width="100" align="center" v-if="columnsSeasonalPlan[9].show">
                <template #default="scope">
                  {{ scope.row.actualStartDate || '--' }}
                </template>
              </el-table-column>
              <el-table-column label="实际结束" prop="actualEndDate" min-width="100" align="center" v-if="columnsSeasonalPlan[10].show">
                <template #default="scope">
                  {{ scope.row.actualEndDate || '--' }}
                </template>
              </el-table-column>
              <el-table-column label="计划状态" prop="planStatus" min-width="90" align="center" v-if="columnsSeasonalPlan[11].show">
                <template #default="scope">
                  <el-tag v-if="scope.row.planStatus === '0'" type="info">未开始</el-tag>
                  <el-tag v-else-if="scope.row.planStatus === '1'" type="success">执行中</el-tag>
                  <el-tag v-else-if="scope.row.planStatus === '2'" type="primary">已完成</el-tag>
                  <el-tag v-else>{{ scope.row.planStatus || '--' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="关联批次" prop="batchNames" min-width="150" align="center" v-if="columnsSeasonalPlan[12].show" show-overflow-tooltip>
                <template #default="scope">
                  <template v-if="scope.row.batchNames && scope.row.batchNames.length > 0">
                    <el-tag v-for="(name, index) in scope.row.batchNames" :key="index" size="small" style="margin: 2px;" type="success">
                      {{ name }}
                    </el-tag>
                  </template>
                  <span v-else>--</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="150" align="center">
                <template #default="scope">
                  <el-button link type="primary" @click="handleUpdateSeasonalPlanInDialog(scope.row)" v-hasPermi="['agriculture:plantingplan:edit']">
                    <el-icon><EditPen /></el-icon>修改
                  </el-button>
                  <el-button link type="danger" @click="handleDeleteSeasonalPlanInDialog(scope.row)" v-hasPermi="['agriculture:plantingplan:remove']">
                    <el-icon><Delete /></el-icon>删除
                  </el-button>
                </template>
              </el-table-column>
            </template>
          </art-table>
        </div>
        <!-- 季度计划详情，只显示基本信息 -->
        <div v-else>
          <el-descriptions :column="2" border v-loading="detailLoading">
            <el-descriptions-item label="计划ID">{{ detailInfo.planId || '--' }}</el-descriptions-item>
            <el-descriptions-item label="计划名称">{{ detailInfo.planName || '--' }}</el-descriptions-item>
            <el-descriptions-item label="计划年份">{{ detailInfo.planYear || '--' }}</el-descriptions-item>
            <el-descriptions-item label="计划类型">
              <el-tag type="success">季度计划</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="季节类型">
              {{ getSeasonTypeName(detailInfo.seasonType) }}
            </el-descriptions-item>
            <el-descriptions-item label="所属温室">
              {{ getPastureName(detailInfo.pastureId) || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="计划状态">
              <el-tag v-if="detailInfo.planStatus === '0'" type="info">未开始</el-tag>
              <el-tag v-else-if="detailInfo.planStatus === '1'" type="success">执行中</el-tag>
              <el-tag v-else-if="detailInfo.planStatus === '2'" type="primary">已完成</el-tag>
              <el-tag v-else-if="detailInfo.planStatus === '3'" type="danger">已取消</el-tag>
              <el-tag v-else>{{ detailInfo.planStatus || '--' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ detailInfo.startDate || '--' }}</el-descriptions-item>
            <el-descriptions-item label="结束日期">{{ detailInfo.endDate || '--' }}</el-descriptions-item>
            <el-descriptions-item label="实际开始日期">{{ detailInfo.actualStartDate || '--' }}</el-descriptions-item>
            <el-descriptions-item label="实际结束日期">{{ detailInfo.actualEndDate || '--' }}</el-descriptions-item>
            <el-descriptions-item label="总面积(亩)">{{ detailInfo.totalArea || '--' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailInfo.createTime || '--' }}</el-descriptions-item>
            <el-descriptions-item label="计划描述" :span="2">{{ detailInfo.planDescription || '--' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailInfo.remark || '--' }}</el-descriptions-item>
          </el-descriptions>
        </div>
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
          <el-input :value="detailInfo.planName" disabled />
        </el-form-item>
        <el-form-item label="作物" prop="classId">
          <el-select v-model="formDetail.classId" placeholder="请选择作物" filterable style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="轮作顺序" prop="rotationOrder">
          <el-input-number 
            v-model="formDetail.rotationOrder" 
            :min="1" 
            :max="detailInfo.rotationCycle ? Number(detailInfo.rotationCycle) : undefined"
            style="width: 100%" 
            placeholder="请输入轮作顺序"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            轮作顺序表示在轮作周期内的执行顺序，范围：1 - {{ detailInfo.rotationCycle || '轮作周期' }}年
            <br />
            例如：第1年种番茄（顺序1），第2年种黄瓜（顺序2），第3年种茄子（顺序3）
          </div>
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
          <el-input-number 
            v-model="formDetail.plantingArea" 
            :min="0" 
            :precision="2" 
            :max="detailInfo.totalArea ? Number(detailInfo.totalArea) : undefined"
            style="width: 100%" 
          />
          <div v-if="detailInfo.totalArea && formDetail.plantingArea && Number(formDetail.plantingArea) > Number(detailInfo.totalArea)" style="color: #F56C6C; font-size: 12px; margin-top: 4px;">
            轮作计划总面积：{{ detailInfo.totalArea }}亩，种植面积不能超过此值
          </div>
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
            :disabled-date="disabledRotationDetailStartDate"
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
            :disabled-date="disabledRotationDetailEndDate"
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
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
const hasSeasonalPlans = ref(false) // 年度计划是否有季度计划
const parentAnnualPlanDateRange = ref<[string, string] | null>(null) // 父年度计划的日期范围
const parentAnnualPlanTotalArea = ref<number | null>(null) // 父年度计划的总面积

const columns = reactive([
  { name: '计划ID', show: false },
  { name: '计划名称', show: true },
  { name: '计划年份', show: true },
  { name: '计划类型', show: true },
  { name: '轮作周期', show: true },
  { name: '计划状态', show: true },
  { name: '预期开始', show: true },
  { name: '预期结束', show: true },
  { name: '实际开始', show: true },
  { name: '实际结束', show: true },
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
  parentPlanId: undefined as number | string | null | undefined,
  seasonType: undefined as string | undefined,
  pastureId: undefined as number | string | undefined,
  classId: undefined as number | string | undefined,
  rotationCycle: undefined as number | string | undefined,
  planDescription: '',
  planStatus: '0',
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  dateYearRange: undefined as [string, string] | undefined, // 年份范围选择器的值（轮作计划）
  dateRange: undefined as [string, string] | undefined, // 日期范围选择器的值（年度计划）
  actualStartDate: undefined as string | undefined,
  actualEndDate: undefined as string | undefined,
  totalArea: undefined as number | string | undefined,
  plantingDensity: undefined as number | string | undefined,
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
  planStatus: '',
  classId: undefined as number | undefined // 新增作物筛选
})

const rules = reactive({
  planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
  planYear: [{ required: true, message: '计划年份不能为空', trigger: 'change' }],
  planType: [{ required: true, message: '计划类型不能为空', trigger: 'change' }],
  pastureId: [{ required: true, message: '所属温室不能为空', trigger: 'change' }],
  totalArea: [
    { required: true, message: '总面积不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value === undefined || value === null || value === '') {
          callback()
          return
        }
        
        // 检查是否大于0
        if (Number(value) <= 0) {
          callback(new Error('总面积必须大于0'))
          return
        }
        
        // 如果是季度计划，检查是否超过年度计划的总面积
        if (form.planType === 'seasonal' && parentAnnualPlanTotalArea.value) {
          if (Number(value) > parentAnnualPlanTotalArea.value) {
            callback(new Error(`总面积不能超过年度计划的总面积（${parentAnnualPlanTotalArea.value}亩）`))
            return
          }
        }
        
        // 检查是否超过温室面积（非季度计划）
        if (form.pastureId && form.planType !== 'seasonal') {
          const selectedPasture = pastureOptions.value.find(item => item.id === form.pastureId)
          if (selectedPasture && selectedPasture.area) {
            const pastureArea = Number(selectedPasture.area)
            if (!isNaN(pastureArea) && pastureArea > 0) {
              if (Number(value) > pastureArea) {
                callback(new Error(`总面积不能超过温室面积（${pastureArea}亩）`))
                return
              }
            }
          }
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ],
  planDescription: [{ required: true, message: '计划描述不能为空', trigger: 'blur' }],
  startDate: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (form.planType === 'seasonal') {
          if (!value || value === undefined || value === null || value === '') {
            callback(new Error('开始日期不能为空'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  endDate: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (form.planType === 'seasonal') {
          if (!value || value === undefined || value === null || value === '') {
            callback(new Error('结束日期不能为空'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  seasonType: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (form.planType === 'seasonal') {
          if (!value || value === undefined || value === null || value === '') {
            callback(new Error('季节类型不能为空'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  plantingDensity: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (form.planType === 'seasonal') {
          if (!value || value === undefined || value === null || value === '') {
            callback(new Error('种植密度不能为空'))
          } else if (Number(value) <= 0) {
            callback(new Error('种植密度必须大于0'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  classId: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (form.planType === 'seasonal') {
          if (!value || value === undefined || value === null || value === '') {
            callback(new Error('作物不能为空'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  rotationCycle: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (form.planType === 'rotation') {
          if (!value || value === undefined || value === null || value === '') {
            callback(new Error('轮作周期不能为空'))
          } else {
            const numValue = Number(value)
            if (numValue < 1) {
              callback(new Error('轮作周期必须大于等于1年'))
            } else if (numValue > 6) {
              callback(new Error('轮作周期不能超过6年'))
            } else {
              callback()
            }
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  planStatus: [{ required: true, message: '计划状态不能为空', trigger: 'change' }]
})

// 轮作计划和作物映射数据
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
  { name: '轮作顺序', show: true },
  { name: '作物名称', show: true },
  { name: '季节类型', show: true },
  { name: '种植面积(亩)', show: true },
  { name: '种植密度', show: true },
  { name: '预期开始', show: true },
  { name: '预期结束', show: true },
  { name: '实际开始', show: true },
  { name: '实际结束', show: true },
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
  classId: '',
  rotationOrder: 1,
  seasonType: '',
  plantingArea: null,
  plantingDensity: '',
  expectedStartDate: '',
  expectedEndDate: '',
  actualStartDate: '',
  actualEndDate: '',
  remark: ''
}

const formDetail = reactive({ ...initialFormStateDetail })

const rulesDetail = reactive({
  planId: [{ required: true, message: '计划ID不能为空', trigger: 'blur' }],
  classId: [{ required: true, message: '作物ID不能为空', trigger: 'blur' }],
  rotationOrder: [
    { required: true, message: '轮作顺序不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value === undefined || value === null || value === '') {
          callback(new Error('轮作顺序不能为空'))
          return
        }
        
        const order = Number(value)
        if (order < 1) {
          callback(new Error('轮作顺序不能小于1'))
          return
        }
        
        // 检查是否超过轮作周期
        const rotationCycle = detailInfo.value?.rotationCycle
        if (rotationCycle && order > Number(rotationCycle)) {
          callback(new Error(`轮作顺序不能超过轮作周期（${rotationCycle}年）`))
          return
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ],
  seasonType: [{ required: true, message: '季节类型不能为空', trigger: 'blur' }],
  plantingArea: [
    { required: true, message: '种植面积不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value === undefined || value === null || value === '') {
          callback()
          return
        }
        
        // 检查是否大于0
        if (Number(value) <= 0) {
          callback(new Error('种植面积必须大于0'))
          return
        }
        
        // 检查是否超过轮作计划的总面积
        if (detailInfo.value && detailInfo.value.totalArea) {
          const rotationPlanTotalArea = Number(detailInfo.value.totalArea)
          if (!isNaN(rotationPlanTotalArea) && rotationPlanTotalArea > 0) {
            if (Number(value) > rotationPlanTotalArea) {
              callback(new Error(`种植面积不能超过轮作计划的总面积（${rotationPlanTotalArea}亩）`))
              return
            }
          }
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ]
})

/** 查询轮作计划列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureRotationPlanService.listPlan(queryParams)
    if (res.code === 200) {
      // 排除季度计划（季度计划只在年度计划详情中显示）
      let filteredRows = res.rows || []
      // 如果 planType 为空或不是 'seasonal'，排除季度计划
      if (queryParams.planType !== 'seasonal') {
        filteredRows = filteredRows.filter((plan: AgricultureRotationPlanResult) => 
          plan.planType !== 'seasonal' && !plan.parentPlanId
        )
      }
      planList.value = filteredRows
      // 如果过滤了数据，总数应该重新计算
      // 如果用户选择了特定类型，使用后端返回的总数
      total.value = queryParams.planType === '' ? filteredRows.length : res.total || 0
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

/** 计划类型变化处理 */
const handlePlanTypeChange = (value: string) => {
  // 根据计划类型更新标题
  if (form.planId) {
    // 修改模式
    if (value === 'rotation') {
      title.value = '修改轮作计划'
    } else if (value === 'annual') {
      title.value = '修改年度计划'
      // 如果是年度计划，检查是否有季度计划
      if (form.planId) {
        checkSeasonalPlans(form.planId)
      }
    } else if (value === 'seasonal') {
      title.value = '修改季度计划'
    } else {
      title.value = '修改种植计划'
    }
  } else {
    // 新增模式
    if (value === 'rotation') {
      title.value = '添加轮作计划'
    } else if (value === 'annual') {
      title.value = '添加年度计划'
    } else if (value === 'seasonal') {
      title.value = '添加季度计划'
    } else {
      title.value = '添加种植计划'
    }
    // 新增时，年度计划没有季度计划
    hasSeasonalPlans.value = false
    // 新增时，确保状态为未开始
    if (value === 'annual' || value === 'rotation' || value === 'seasonal') {
      form.planStatus = '0'
    }
  }
  
  // 如果不是轮作计划，清空轮作周期
  if (value !== 'rotation') {
    form.rotationCycle = undefined
    form.dateYearRange = undefined
  } else {
    // 如果是轮作计划，清空单独的日期字段
    form.startDate = undefined
    form.endDate = undefined
  }
  // 如果不是季度计划，清空季节类型
  if (value !== 'seasonal') {
    form.seasonType = undefined
  }
  
  // 如果切换到年度计划且已有计划年份，自动设置日期范围
  if (value === 'annual' && form.planYear) {
    const startDate = `${form.planYear}-01-01`
    // 使用空字符串作为结束日期，这样 el-date-picker 可以正确显示开始日期
    form.dateRange = [startDate, '' as any]
  }
  
  // 如果切换到轮作计划且已有计划年份和轮作周期，自动计算日期范围
  if (value === 'rotation' && form.planYear && form.rotationCycle) {
    updateRotationPlanDateRange()
  }
  
  // 如果切换到季度计划，清空日期范围
  if (value === 'seasonal') {
    form.dateRange = undefined
  }
}

/** 计划年份变化处理 */
const handlePlanYearChange = (value: string | null) => {
  if (!value) {
    // 如果清空年份，也清空日期范围
    if (form.planType === 'annual') {
      form.dateRange = undefined
    }
    return
  }
  
  if (form.planType === 'annual') {
    // 年度计划：自动设置开始日期为本年的1月1日，并更新日期范围
    const startDate = `${value}-01-01`
    
    // 如果已有日期范围，更新开始日期；否则创建新的日期范围
    if (form.dateRange && Array.isArray(form.dateRange) && form.dateRange.length === 2) {
      const endDate = form.dateRange[1]
      // 检查结束日期是否在允许范围内
      const endDateObj = new Date(endDate)
      const planYear = Number(value)
      
      // 结束日期必须在计划年份或次年内（1月1日至次年3月31日）
      const minEndDate = new Date(planYear, 0, 1) // 1月1日
      const maxEndDate = new Date(planYear + 1, 2, 31) // 次年3月31日
      
      if (endDateObj >= minEndDate && endDateObj <= maxEndDate && endDateObj >= new Date(startDate)) {
        form.dateRange = [startDate, endDate]
      } else {
        // 结束日期不在允许范围内，只设置开始日期
        form.dateRange = [startDate, '' as any]
      }
    } else {
      // 没有日期范围或日期范围不完整，自动填充开始日期
      form.dateRange = [startDate, '' as any]
    }
  } else if (form.planType === 'rotation') {
    // 轮作计划：更新日期范围
    updateRotationPlanDateRange()
  } else {
    // 如果还没有选择计划类型，但选择了年份，先不处理
    // 等用户选择计划类型时，会触发 handlePlanTypeChange 来处理
  }
}

/** 更新轮作计划的日期范围 */
const updateRotationPlanDateRange = () => {
  if (form.planType !== 'rotation' || !form.planYear || !form.rotationCycle) {
    return
  }
  
  const startYear = Number(form.planYear)
  const cycleYears = Number(form.rotationCycle)
  
  if (!startYear || !cycleYears || cycleYears < 1) {
    return
  }
  
  // 计算结束年份：起始年份 + 轮作周期 - 1
  // 例如：2025年开始，3年周期，结束年份是2027（2025, 2026, 2027共3年）
  const endYear = startYear + cycleYears - 1
  
  // 设置日期范围
  form.dateYearRange = [String(startYear), String(endYear)]
  
  // 转换为开始和结束日期（YYYY-MM-DD格式）
  form.startDate = `${startYear}-01-01`
  form.endDate = `${endYear}-12-31`
}

/** 禁用年度计划日期范围 */
const disabledAnnualPlanDateRange = (time: Date) => {
  if (form.planType !== 'annual' || !form.planYear) {
    return false
  }
  
  const planYear = Number(form.planYear)
  if (!planYear) {
    return false
  }
  
  const timeYear = time.getFullYear()
  const timeMonth = time.getMonth() // 0-11
  const timeDate = time.getDate()
  
  // 开始日期：必须是计划年份的1月1日
  if (form.dateRange && Array.isArray(form.dateRange) && form.dateRange.length >= 1) {
    // 如果已选择开始日期，则限制结束日期
    const startDate = new Date(form.dateRange[0])
    if (startDate.getFullYear() === planYear && startDate.getMonth() === 0 && startDate.getDate() === 1) {
      // 开始日期是1月1日，限制结束日期范围：计划年份的1月1日至次年3月31日
      // 结束日期可以在计划年份或次年内，且不能早于开始日期
      const minYear = planYear
      const maxYear = planYear + 1
      
      // 如果不在计划年份或次年内，禁用
      if (timeYear < minYear || timeYear > maxYear) {
        return true
      }
      
      // 如果是计划年份，不能早于开始日期（1月1日）
      if (timeYear === minYear) {
        if (timeMonth === 0 && timeDate < 1) {
          return true
        }
        return false
      }
      
      // 如果是次年份，只能选择3月31日及之前
      if (timeYear === maxYear) {
        if (timeMonth > 2) { // 3月之后
          return true
        }
        if (timeMonth === 2 && timeDate > 31) { // 3月31日之后
          return true
        }
        return false
      }
      
      return false
    }
  } else {
    // 未选择开始日期时，限制开始日期必须是计划年份的1月1日
    if (timeYear !== planYear || timeMonth !== 0 || timeDate !== 1) {
      return true
    }
  }
  
  return false
}

/** 禁用季度计划开始日期 */
const disabledSeasonalPlanStartDate = (time: Date) => {
  if (form.planType !== 'seasonal' || !parentAnnualPlanDateRange.value) {
    return false
  }
  
  const [minDate, maxDate] = parentAnnualPlanDateRange.value
  const timeDate = new Date(time.getFullYear(), time.getMonth(), time.getDate())
  const minDateObj = new Date(minDate)
  const maxDateObj = new Date(maxDate)
  
  // 如果日期在父年度计划的日期范围外，禁用
  if (timeDate < minDateObj || timeDate > maxDateObj) {
    return true
  }
  
  // 如果已选择结束日期，开始日期不能晚于结束日期
  if (form.endDate) {
    const endDateObj = new Date(form.endDate)
    if (timeDate > endDateObj) {
      return true
    }
  }
  
  return false
}

/** 禁用季度计划结束日期 */
const disabledSeasonalPlanEndDate = (time: Date) => {
  if (form.planType !== 'seasonal' || !parentAnnualPlanDateRange.value) {
    return false
  }
  
  const [minDate, maxDate] = parentAnnualPlanDateRange.value
  const timeDate = new Date(time.getFullYear(), time.getMonth(), time.getDate())
  const minDateObj = new Date(minDate)
  const maxDateObj = new Date(maxDate)
  
  // 如果日期在父年度计划的日期范围外，禁用
  if (timeDate < minDateObj || timeDate > maxDateObj) {
    return true
  }
  
  // 如果已选择开始日期，结束日期不能早于开始日期
  if (form.startDate) {
    const startDateObj = new Date(form.startDate)
    if (timeDate < startDateObj) {
      return true
    }
  }
  
  return false
}

/** 禁用轮作明细开始日期 */
const disabledRotationDetailStartDate = (time: Date) => {
  // 需要轮作计划信息、计划年份和轮作顺序
  if (!detailInfo.value || !detailInfo.value.planYear || !formDetail.rotationOrder) {
    return false
  }
  
  const planYear = Number(detailInfo.value.planYear)
  const rotationOrder = Number(formDetail.rotationOrder)
  
  if (!planYear || !rotationOrder || rotationOrder < 1) {
    return false
  }
  
  // 计算该轮作顺序对应的年份：计划年份 + (轮作顺序 - 1)
  // 例如：计划年份2025，轮作顺序1 -> 2025年；轮作顺序2 -> 2026年
  const targetYear = planYear + (rotationOrder - 1)
  const timeYear = time.getFullYear()
  const timeDateObj = new Date(time.getFullYear(), time.getMonth(), time.getDate())
  
  // 开始日期必须在该年份的任意日期（1月1日到12月31日之间）
  if (timeYear !== targetYear) {
    return true // 禁用其他年份的日期
  }
  
  // 如果已选择结束日期，开始日期不能晚于结束日期
  if (formDetail.expectedEndDate) {
    const endDateObj = new Date(formDetail.expectedEndDate)
    if (timeDateObj > endDateObj) {
      return true
    }
  }
  
  return false // 允许选择该年份的任意日期
}

/** 禁用轮作明细结束日期 */
const disabledRotationDetailEndDate = (time: Date) => {
  // 需要轮作计划信息、计划年份和轮作顺序
  if (!detailInfo.value || !detailInfo.value.planYear || !formDetail.rotationOrder) {
    return false
  }
  
  const planYear = Number(detailInfo.value.planYear)
  const rotationOrder = Number(formDetail.rotationOrder)
  
  if (!planYear || !rotationOrder || rotationOrder < 1) {
    return false
  }
  
  // 计算该轮作顺序对应的年份范围
  // 开始年份：计划年份 + (轮作顺序 - 1)
  // 结束年份：计划年份 + 轮作顺序（次年3月31日）
  const startYear = planYear + (rotationOrder - 1)
  const endYear = planYear + rotationOrder
  const timeYear = time.getFullYear()
  const timeMonth = time.getMonth() // 0-11
  const timeDate = time.getDate()
  const timeDateObj = new Date(time.getFullYear(), time.getMonth(), time.getDate())
  
  // 结束日期必须在开始年份到结束年份的3月31日之间
  if (timeYear < startYear || timeYear > endYear) {
    return true
  }
  
  // 如果是开始年份，不能早于1月1日
  if (timeYear === startYear) {
    // 允许从1月1日开始
    return false
  }
  
  // 如果是结束年份，只能选择到3月31日
  if (timeYear === endYear) {
    if (timeMonth > 2) { // 3月之后
      return true
    }
    if (timeMonth === 2 && timeDate > 31) { // 3月31日之后
      return true
    }
    return false
  }
  
  // 如果已选择开始日期，结束日期不能早于开始日期
  if (formDetail.expectedStartDate) {
    const startDateObj = new Date(formDetail.expectedStartDate)
    if (timeDateObj < startDateObj) {
      return true
    }
  }
  
  return false
}

/** 年度计划日期范围变化处理 */
const handleAnnualPlanDateRangeChange = (value: [string, string] | null) => {
  if (!value || !Array.isArray(value) || value.length !== 2 || form.planType !== 'annual') {
    form.startDate = undefined
    form.endDate = undefined
    return
  }
  
  const startDate = value[0]
  const endDate = value[1]
  
  // 验证开始日期必须是计划年份的1月1日
  if (form.planYear) {
    const expectedStartDate = `${form.planYear}-01-01`
    if (startDate !== expectedStartDate) {
      ElMessage.warning('年度计划的开始日期必须为计划年份的1月1日')
      form.dateRange = [expectedStartDate, endDate] as [string, string]
      form.startDate = expectedStartDate
      form.endDate = endDate
      return
    }
  }
  
  // 验证结束日期是否在允许范围内
  if (form.planYear && endDate) {
    const endDateObj = new Date(endDate)
    const planYear = Number(form.planYear)
    const minEndDate = new Date(planYear, 0, 1) // 1月1日
    const maxEndDate = new Date(planYear + 1, 2, 31) // 次年3月31日
    
    // 结束日期必须在计划年份或次年内，且不能早于开始日期
    if (endDateObj.getFullYear() < planYear || endDateObj.getFullYear() > planYear + 1) {
      ElMessage.warning(`结束日期必须在${form.planYear}年或${Number(form.planYear) + 1}年内`)
      form.dateRange = [startDate, '' as any]
      form.startDate = startDate
      form.endDate = undefined
      return
    }
    
    // 结束日期不能早于开始日期
    if (endDateObj < new Date(startDate)) {
      ElMessage.warning('结束日期不能早于开始日期')
      form.dateRange = [startDate, '' as any]
      form.startDate = startDate
      form.endDate = undefined
      return
    }
    
    // 如果结束日期在计划年份内，必须在1月1日之后
    if (endDateObj.getFullYear() === planYear && endDateObj < minEndDate) {
      ElMessage.warning(`结束日期不能早于${form.planYear}年1月1日`)
      form.dateRange = [startDate, '' as any]
      form.startDate = startDate
      form.endDate = undefined
      return
    }
    
    // 如果结束日期在次年内，必须在3月31日之前
    if (endDateObj.getFullYear() === planYear + 1) {
      if (endDateObj > maxEndDate) {
        ElMessage.warning(`结束日期不能晚于${Number(form.planYear) + 1}年3月31日`)
        form.dateRange = [startDate, '' as any]
        form.startDate = startDate
        form.endDate = undefined
        return
      }
    }
    
    // 验证结束日期是否在允许范围内
    if (endDateObj < minEndDate || endDateObj > maxEndDate) {
      ElMessage.warning(`结束日期只能选择${form.planYear}年1月1日至${Number(form.planYear) + 1}年3月31日`)
      form.dateRange = [startDate, '' as any]
      form.startDate = startDate
      form.endDate = undefined
      return
    }
  }
  
  // 转换为开始和结束日期
  form.startDate = startDate
  form.endDate = endDate
}

/** 轮作周期变化处理 */
const handleRotationCycleChange = (value: number | undefined) => {
  if (!value || form.planType !== 'rotation') return
  
  // 验证轮作周期范围
  if (value < 1) {
    ElMessage.warning('轮作周期必须大于等于1年')
    form.rotationCycle = 1
    return
  }
  if (value > 6) {
    ElMessage.warning('轮作周期不能超过6年')
    form.rotationCycle = 6
    return
  }
  
  // 如果已有计划年份，自动计算并设置日期范围
  if (form.planYear) {
    updateRotationPlanDateRange()
  }
}

/** 所属温室变化处理 */
const handlePastureIdChange = (value: string | number | undefined | null) => {
  // 当温室变化时，重新验证总面积是否超过新温室的面积
  if (form.totalArea && value) {
    const pastureArea = getPastureArea(value)
    if (pastureArea > 0 && Number(form.totalArea) > pastureArea) {
      ElMessage.warning(`总面积不能超过温室面积（${pastureArea}亩），请重新输入`)
      // 触发验证
      planRef.value?.validateField('totalArea')
    }
  }
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加种植计划'
  // 默认不显示轮作周期字段
  form.planType = undefined
  // 新增时默认状态为未开始
  form.planStatus = '0'
}

// 详情相关
const detailOpen = ref(false)
const detailLoading = ref(false)
const detailInfo = ref<AgricultureRotationPlanResult>({} as AgricultureRotationPlanResult)
const detailRotationId = ref<string>('')
const detailListData = ref<AgricultureRotationDetailResult[]>([])
const detailTotal = ref(0)
const detailTitle = ref('计划详情')
const detailQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planId: '',
  seasonType: '',
  rotationOrder: '' // 轮作顺序筛选
})
const detailSearchFormRef = ref<FormInstance>()

// 轮作顺序选项（根据轮作周期生成）
const rotationOrderOptions = computed(() => {
  if (!detailInfo.value?.rotationCycle) {
    return []
  }
  const cycle = Number(detailInfo.value.rotationCycle)
  const options = []
  for (let i = 1; i <= cycle; i++) {
    options.push({
      label: `第${i}年`,
      value: String(i)
    })
  }
  return options
})

// 季节类型选项
const seasonTypeOptions = [
  { label: '春季', value: '1' },
  { label: '夏季', value: '2' },
  { label: '秋季', value: '3' },
  { label: '冬季', value: '4' }
]

// 季度计划相关（用于年度计划详情）
const seasonalPlanListData = ref<AgricultureRotationPlanResult[]>([])
const seasonalPlanTotal = ref(0)
const seasonalPlanLoading = ref(false)
const seasonalPlanQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planName: '',
  parentPlanId: ''
})
const seasonalPlanSearchFormRef = ref<FormInstance>()

// 季度计划列表列配置
const columnsSeasonalPlan = reactive([
  { name: '计划名称', show: true },
  { name: '计划年份', show: true },
  { name: '季节类型', show: true },
  { name: '所属温室', show: true },
  { name: '作物', show: true },
  { name: '总面积(亩)', show: true },
  { name: '种植密度(株/亩)', show: true },
  { name: '预期开始', show: true },
  { name: '预期结束', show: true },
  { name: '实际开始', show: true },
  { name: '实际结束', show: true },
  { name: '计划状态', show: true },
  { name: '关联批次', show: true }
])

const changeColumnSeasonalPlan = (list: any) => {
  columnsSeasonalPlan.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

/** 详情按钮操作 */
const handleDetail = async (row: AgricultureRotationPlanResult) => {
  detailOpen.value = true
  const planId = row.planId
  detailRotationId.value = String(planId)
  detailInfo.value = row
  
  // 根据计划类型设置标题
  if (row.planType === 'rotation') {
    detailTitle.value = '轮作计划明细'
    // 重置查询参数
    detailQueryParams.pageNum = 1
    detailQueryParams.pageSize = 10
    detailQueryParams.planId = String(planId)
    detailQueryParams.seasonType = ''
    detailQueryParams.rotationOrder = ''
    // 先清空数据，避免显示旧数据
    detailListData.value = []
    detailTotal.value = 0
    // 加载轮作明细
    await loadDetailList()
  } else if (row.planType === 'annual') {
    detailTitle.value = '年度计划详情'
    detailLoading.value = false
    // 加载季度计划列表
    seasonalPlanQueryParams.parentPlanId = String(planId)
    seasonalPlanQueryParams.pageNum = 1
    seasonalPlanQueryParams.pageSize = 10
    seasonalPlanQueryParams.planName = ''
    await loadSeasonalPlanList()
  } else if (row.planType === 'seasonal') {
    detailTitle.value = '季度计划详情'
    detailLoading.value = false
  } else {
    detailTitle.value = '计划详情'
    detailLoading.value = false
  }
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
      seasonType: detailQueryParams.seasonType
    }
    const res = await AgricultureRotationDetailService.listDetail(queryParams)
    if (res.code === 200) {
      const rows = res.rows || []
      // 按轮作顺序排序
      let filteredRows = rows.sort((a: any, b: any) => {
        const orderA = Number(a.rotationOrder) || 0
        const orderB = Number(b.rotationOrder) || 0
        return orderA - orderB
      })
      
      // 如果选择了轮作顺序筛选，进行前端过滤
      if (detailQueryParams.rotationOrder) {
        const selectedOrder = Number(detailQueryParams.rotationOrder)
        filteredRows = filteredRows.filter((row: any) => {
          return Number(row.rotationOrder) === selectedOrder
        })
      }
      
      detailListData.value = filteredRows
      detailTotal.value = filteredRows.length
      
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

// 监听季节类型和轮作顺序的变化，自动触发搜索
let isInitializing = false
watch(
  () => [detailQueryParams.seasonType, detailQueryParams.rotationOrder],
  (newVal, oldVal) => {
    // 只有在对话框打开且不是初始化时才触发搜索
    if (detailOpen.value && !isInitializing && oldVal !== undefined) {
      searchDetailInDialog()
    }
  }
)

/** 详情对话框中的重置 */
const resetDetailSearchInDialog = () => {
  if (detailSearchFormRef.value) {
    detailSearchFormRef.value.resetFields()
  }
  detailQueryParams.seasonType = ''
  detailQueryParams.rotationOrder = ''
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

/** 加载季度计划列表（用于年度计划详情对话框） */
const loadSeasonalPlanList = async () => {
  if (!seasonalPlanQueryParams.parentPlanId) {
    seasonalPlanListData.value = []
    seasonalPlanTotal.value = 0
    return
  }
  seasonalPlanLoading.value = true
  try {
    const queryParams = {
      pageNum: seasonalPlanQueryParams.pageNum,
      pageSize: seasonalPlanQueryParams.pageSize,
      planType: 'seasonal',
      parentPlanId: seasonalPlanQueryParams.parentPlanId,
      planName: seasonalPlanQueryParams.planName
    }
    const res = await AgricultureRotationPlanService.listPlan(queryParams)
    if (res.code === 200) {
      const rows = res.rows || []
      // 确保只显示与当前年度计划关联的季度计划（前端再次过滤，确保准确性）
      const parentPlanIdStr = String(seasonalPlanQueryParams.parentPlanId)
      const filteredRows = rows.filter((plan: AgricultureRotationPlanResult) => {
        // 必须是季度计划
        if (plan.planType !== 'seasonal') {
          return false
        }
        // parentPlanId 必须匹配
        const planParentId = plan.parentPlanId
        if (!planParentId) {
          return false
        }
        return String(planParentId) === parentPlanIdStr || Number(planParentId) === Number(parentPlanIdStr)
      })
      seasonalPlanListData.value = filteredRows
      seasonalPlanTotal.value = filteredRows.length
      // 加载关联批次
      await loadBatchNamesForSeasonalPlans()
    } else {
      seasonalPlanListData.value = []
      seasonalPlanTotal.value = 0
      ElMessage.error(res.msg || '获取季度计划列表失败')
    }
  } catch (error) {
    console.error('获取季度计划列表异常:', error)
    seasonalPlanListData.value = []
    seasonalPlanTotal.value = 0
    ElMessage.error('获取季度计划列表失败')
  } finally {
    seasonalPlanLoading.value = false
  }
}

/** 季度计划对话框中的搜索 */
const searchSeasonalPlanInDialog = () => {
  seasonalPlanQueryParams.pageNum = 1
  loadSeasonalPlanList()
}

/** 季度计划对话框中的重置 */
const resetSeasonalPlanSearchInDialog = () => {
  if (seasonalPlanSearchFormRef.value) {
    seasonalPlanSearchFormRef.value.resetFields()
  }
  seasonalPlanQueryParams.planName = ''
  searchSeasonalPlanInDialog()
}

/** 季度计划对话框中的分页大小改变 */
const handleSeasonalPlanSizeChange = (size: number) => {
  seasonalPlanQueryParams.pageSize = size
  loadSeasonalPlanList()
}

/** 季度计划对话框中的当前页改变 */
const handleSeasonalPlanCurrentChange = (page: number) => {
  seasonalPlanQueryParams.pageNum = page
  loadSeasonalPlanList()
}

/** 详情对话框中新增季度计划 */
const handleAddSeasonalPlanInDialog = () => {
  reset()
  open.value = true
  title.value = '添加季度计划'
  form.planType = 'seasonal'
  form.parentPlanId = Number(detailInfo.value.planId)
  form.planYear = String(detailInfo.value.planYear || '')
  form.pastureId = detailInfo.value.pastureId
  // 新增时默认状态为未开始
  form.planStatus = '0'
  // 从父年度计划读取总面积
  if (detailInfo.value && detailInfo.value.totalArea) {
    parentAnnualPlanTotalArea.value = Number(detailInfo.value.totalArea)
    form.totalArea = Number(detailInfo.value.totalArea)
  } else {
    parentAnnualPlanTotalArea.value = null
  }
  // 从父年度计划获取日期范围
  if (detailInfo.value && detailInfo.value.startDate && detailInfo.value.endDate) {
    parentAnnualPlanDateRange.value = [detailInfo.value.startDate, detailInfo.value.endDate]
  } else {
    parentAnnualPlanDateRange.value = null
  }
}

/** 详情对话框中修改季度计划 */
const handleUpdateSeasonalPlanInDialog = async (row: AgricultureRotationPlanResult) => {
  reset()
  open.value = true
  // 标题显示为"修改 + 计划名称"
  title.value = '修改' + (row.planName || '季度计划')
  const planId = row.planId
  const res = await AgricultureRotationPlanService.getPlan(planId)
  if (res.code === 200) {
    const data = res.data
    
    // 处理日期和年份字段的格式
    const formatDate = (dateValue: any): string | undefined => {
      if (!dateValue) return undefined
      const dateStr = String(dateValue)
      // 如果是日期时间格式，只取日期部分
      if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0]
      }
      // 如果已经是日期格式，直接返回
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr
      }
      // 如果是时间戳，转换为日期格式
      if (dateStr.match(/^\d+$/)) {
        const date = new Date(Number(dateStr))
        return date.toISOString().split('T')[0]
      }
      return dateStr
    }
    
    const formData = {
      ...data,
      // 确保 planYear 是字符串格式（YYYY）
      planYear: data.planYear ? String(data.planYear).substring(0, 4) : undefined,
      // 确保 startDate 和 endDate 是字符串格式（YYYY-MM-DD）
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate)
    }
    
    Object.assign(form, formData)
    // 设置计划类型为季度计划，且不可修改
    form.planType = 'seasonal'
    // 计划年份从父年度计划获取，且不可修改
    if (detailInfo.value && detailInfo.value.planYear) {
      form.planYear = String(detailInfo.value.planYear)
    }
    // 所属温室继承自父年度计划，且不可修改
    if (detailInfo.value && detailInfo.value.pastureId) {
      form.pastureId = detailInfo.value.pastureId
    }
    // 总面积从父年度计划读取
    if (detailInfo.value && detailInfo.value.totalArea) {
      parentAnnualPlanTotalArea.value = Number(detailInfo.value.totalArea)
      // 如果季度计划没有总面积，则使用父年度计划的总面积
      if (!form.totalArea) {
        form.totalArea = Number(detailInfo.value.totalArea)
      }
    } else {
      parentAnnualPlanTotalArea.value = null
    }
    // 从父年度计划获取日期范围
    if (detailInfo.value && detailInfo.value.startDate && detailInfo.value.endDate) {
      parentAnnualPlanDateRange.value = [detailInfo.value.startDate, detailInfo.value.endDate]
    } else {
      parentAnnualPlanDateRange.value = null
    }
  }
}

/** 详情对话框中删除季度计划 */
const handleDeleteSeasonalPlanInDialog = async (row: AgricultureRotationPlanResult) => {
  await ElMessageBox.confirm('是否确认删除季度计划编号为"' + row.planId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const planId = row.planId
      const parentPlanId = row.parentPlanId || detailInfo.value?.planId
      const res = await AgricultureRotationPlanService.deletePlan(planId)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        await loadSeasonalPlanList()
        // 删除季度计划后，刷新年度计划信息（后端应该已经自动更新了状态）
        if (detailInfo.value && detailInfo.value.planId) {
          const annualPlanRes = await AgricultureRotationPlanService.getPlan(detailInfo.value.planId)
          if (annualPlanRes.code === 200) {
            detailInfo.value = annualPlanRes.data
          }
        }
      }
    })
    .catch(() => {})
}

/** 为轮作明细加载批次名称 */
const loadBatchNamesForDetails = async () => {
  if (!detailListData.value || detailListData.value.length === 0) return
  
  try {
    // 查询所有批次（因为批次数据中planId可能为null，需要通过其他字段匹配）
    const batchRes = await AgricultureCropBatchService.listBatch({
      pageNum: 1,
      pageSize: 1000
    })
    
    if (batchRes.code === 200 && batchRes.rows) {
      // 为每个明细匹配批次名称（支持多个批次）
      detailListData.value.forEach((detail: any) => {
        const seasonMap: { [key: string]: string } = {
          '1': 'spring',
          '2': 'summer',
          '3': 'autumn',
          '4': 'winter'
        }
        const seasonType = seasonMap[String(detail.seasonType)] || detail.seasonType
        
        // 查找所有匹配的批次
        const matchedBatches = batchRes.rows.filter((batch: any) => {
          // 匹配季节类型
          const batchSeasonType = String(batch.seasonType)
          const matchesSeason = batchSeasonType === seasonType ||
                               batchSeasonType === String(detail.seasonType) ||
                               (seasonMap[batchSeasonType] && seasonMap[batchSeasonType] === seasonType)
          
          if (!matchesSeason) return false
          
          // 匹配轮作计划
          // 方式1: 通过planId匹配（如果planId不为null）
          if (batch.planId && String(batch.planId) === String(detailRotationId.value)) {
            return true
          }
          
          // 方式2: planId为null时，通过planYear和pastureId匹配
          if (!batch.planId && detailInfo.value.planYear && detailInfo.value.pastureId) {
            return String(batch.planYear) === String(detailInfo.value.planYear) &&
                   batch.pastureId == detailInfo.value.pastureId
          }
          
          return false
        })
        
        // 收集所有匹配批次的名称
        if (matchedBatches && matchedBatches.length > 0) {
          detail.batchNames = matchedBatches.map((batch: any) => batch.batchName).filter((name: string) => name)
        } else {
          detail.batchNames = []
        }
      })
    }
  } catch (error) {
    console.error('加载批次名称失败:', error)
  }
}

/** 为季度计划加载批次名称 */
const loadBatchNamesForSeasonalPlans = async () => {
  if (!seasonalPlanListData.value || seasonalPlanListData.value.length === 0) return
  
  try {
    const batchRes = await AgricultureCropBatchService.listBatch({
      pageNum: 1,
      pageSize: 1000
    })
    
    if (batchRes.code === 200 && batchRes.rows) {
      seasonalPlanListData.value.forEach((plan: any) => {
        // 查找与季度计划关联的批次
        const matchedBatches = batchRes.rows.filter((batch: any) => {
          // 通过planId匹配
          if (batch.planId && String(batch.planId) === String(plan.planId)) {
            return true
          }
          // 通过季节类型、年份、温室匹配
          if (plan.seasonType && plan.planYear && plan.pastureId) {
            const seasonMap: { [key: string]: string } = {
              '1': 'spring',
              '2': 'summer',
              '3': 'autumn',
              '4': 'winter'
            }
            const planSeasonType = seasonMap[String(plan.seasonType)] || String(plan.seasonType)
            const batchSeasonType = String(batch.seasonType)
            const matchesSeason = batchSeasonType === planSeasonType ||
                                 batchSeasonType === String(plan.seasonType) ||
                                 (seasonMap[batchSeasonType] && seasonMap[batchSeasonType] === planSeasonType)
            
            if (matchesSeason && 
                String(batch.planYear) === String(plan.planYear) &&
                batch.pastureId == plan.pastureId) {
              return true
            }
          }
          return false
        })
        
        if (matchedBatches && matchedBatches.length > 0) {
          plan.batchNames = matchedBatches.map((batch: any) => batch.batchName).filter((name: string) => name)
        } else {
          plan.batchNames = []
        }
      })
    }
  } catch (error) {
    console.error('加载季度计划批次名称失败:', error)
  }
}

/** 检查年度计划是否有季度计划 */
const checkSeasonalPlans = async (annualPlanId: number | string | null | undefined) => {
  if (!annualPlanId || form.planType !== 'annual') {
    hasSeasonalPlans.value = false
    return
  }
  try {
    const res = await AgricultureRotationPlanService.listPlan({
      pageNum: 1,
      pageSize: 1,
      planType: 'seasonal',
      parentPlanId: String(annualPlanId)
    })
    hasSeasonalPlans.value = res.code === 200 && res.total > 0
  } catch (error) {
    console.error('检查季度计划失败:', error)
    hasSeasonalPlans.value = false
  }
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureRotationPlanResult) => {
  reset()
  open.value = true
  const planId = row.planId
  const res = await AgricultureRotationPlanService.getPlan(planId)
  if (res.code === 200) {
    const data = res.data
    
    // 处理日期和年份字段的格式
    const formatDate = (dateValue: any): string | undefined => {
      if (!dateValue) return undefined
      const dateStr = String(dateValue)
      // 如果是日期时间格式，只取日期部分
      if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0]
      }
      // 如果已经是日期格式，直接返回
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr
      }
      // 如果是时间戳，转换为日期格式
      if (dateStr.match(/^\d+$/)) {
        const date = new Date(Number(dateStr))
        return date.toISOString().split('T')[0]
      }
      return dateStr
    }
    
    const formData = {
      ...data,
      // 确保 planYear 是字符串格式（YYYY）
      planYear: data.planYear ? String(data.planYear).substring(0, 4) : undefined,
      // 确保 startDate 和 endDate 是字符串格式（YYYY-MM-DD）
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate)
    }
    
    Object.assign(form, formData)
    
    // 如果是年度计划，设置日期范围
    if (data.planType === 'annual' && form.startDate && form.endDate) {
      form.dateRange = [form.startDate, form.endDate]
    } else if (data.planType === 'annual' && form.planYear) {
      // 如果没有日期，自动设置开始日期为计划年份的1月1日
      const startDate = `${form.planYear}-01-01`
      form.dateRange = [startDate, '' as any]
      form.startDate = startDate
    }
    
    // 如果是轮作计划，根据计划年份和轮作周期自动计算日期范围
    if (data.planType === 'rotation' && form.planYear && form.rotationCycle) {
      updateRotationPlanDateRange()
    } else if (data.planType === 'rotation' && form.startDate && form.endDate) {
      // 如果没有轮作周期，从开始和结束日期反推年份范围（用于回显）
      const startYear = new Date(form.startDate).getFullYear()
      const endYear = new Date(form.endDate).getFullYear()
      form.dateYearRange = [String(startYear), String(endYear)]
    }
    
    // 如果是年度计划，检查是否有季度计划
    if (data.planType === 'annual') {
      await checkSeasonalPlans(data.planId)
    } else {
      hasSeasonalPlans.value = false
    }
    
    // 根据计划类型设置标题
    if (data.planType === 'rotation') {
      title.value = '修改轮作计划'
    } else if (data.planType === 'annual') {
      title.value = '修改年度计划'
    } else if (data.planType === 'seasonal') {
      title.value = '修改季度计划'
    } else {
      title.value = '修改种植计划'
    }
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!planRef.value) return
  await planRef.value.validate(async (valid) => {
    if (valid) {
      const planId = form.planId
      const isSeasonalPlan = form.planType === 'seasonal'
      const parentPlanId = form.parentPlanId
      
      // 排除实际日期字段和日期范围字段（由后端自动计算）
      const { actualStartDate, actualEndDate, dateYearRange, dateRange, ...formData } = form
      
      // 如果是年度计划，确保 startDate 和 endDate 已从 dateRange 转换
      if (form.planType === 'annual' && form.dateRange && Array.isArray(form.dateRange) && form.dateRange.length === 2) {
        formData.startDate = form.dateRange[0]
        formData.endDate = form.dateRange[1]
      }
      
      // 如果是轮作计划，确保 startDate 和 endDate 已从 dateYearRange 转换
      if (form.planType === 'rotation' && form.dateYearRange && Array.isArray(form.dateYearRange) && form.dateYearRange.length === 2) {
        const startYear = Number(form.dateYearRange[0])
        const endYear = Number(form.dateYearRange[1])
        formData.startDate = `${startYear}-01-01`
        formData.endDate = `${endYear}-12-31`
      }
      
      // 如果是季度计划，验证日期是否在父年度计划的日期范围内
      if (form.planType === 'seasonal' && parentAnnualPlanDateRange.value) {
        const [minDate, maxDate] = parentAnnualPlanDateRange.value
        const minDateObj = new Date(minDate)
        const maxDateObj = new Date(maxDate)
        
        if (formData.startDate) {
          const startDateObj = new Date(formData.startDate)
          if (startDateObj < minDateObj || startDateObj > maxDateObj) {
            ElMessage.warning(`开始日期必须在所属年度计划的日期范围内（${minDate} 至 ${maxDate}）`)
            return
          }
        }
        
        if (formData.endDate) {
          const endDateObj = new Date(formData.endDate)
          if (endDateObj < minDateObj || endDateObj > maxDateObj) {
            ElMessage.warning(`结束日期必须在所属年度计划的日期范围内（${minDate} 至 ${maxDate}）`)
            return
          }
        }
        
        // 验证开始日期不能晚于结束日期
        if (formData.startDate && formData.endDate) {
          const startDateObj = new Date(formData.startDate)
          const endDateObj = new Date(formData.endDate)
          if (startDateObj > endDateObj) {
            ElMessage.warning('开始日期不能晚于结束日期')
            return
          }
        }
      }
      
      if (planId) {
        const updateData = {
          ...formData,
          planId: planId
        }
        const res = await AgricultureRotationPlanService.updatePlan(updateData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
          
          // 如果是季度计划且详情对话框打开，刷新年度计划信息和季度计划列表
          // 注意：年度计划状态的自动更新应该在后端实现
          if (isSeasonalPlan && detailOpen.value && detailInfo.value.planType === 'annual') {
            // 重新加载年度计划信息（后端应该已经自动更新了状态）
            if (parentPlanId) {
              const annualPlanRes = await AgricultureRotationPlanService.getPlan(parentPlanId)
              if (annualPlanRes.code === 200) {
                detailInfo.value = annualPlanRes.data
              }
            }
            await loadSeasonalPlanList()
          } else if (detailOpen.value && detailInfo.value.planType === 'annual') {
            // 如果详情对话框打开且是年度计划，刷新季度计划列表
            await loadSeasonalPlanList()
          }
        }
      } else {
        // 新增时设置 delFlag = 0
        // 排除实际日期字段和日期范围字段（由后端自动计算）
        const { actualStartDate, actualEndDate, dateYearRange, dateRange, ...formDataForAdd } = form
        
        // 如果是年度计划，确保 startDate 和 endDate 已从 dateRange 转换
        if (form.planType === 'annual' && form.dateRange && Array.isArray(form.dateRange) && form.dateRange.length === 2) {
          formDataForAdd.startDate = form.dateRange[0]
          formDataForAdd.endDate = form.dateRange[1]
        }
        
        // 如果是轮作计划，确保 startDate 和 endDate 已从 dateYearRange 转换
        if (form.planType === 'rotation' && form.dateYearRange && Array.isArray(form.dateYearRange) && form.dateYearRange.length === 2) {
          const startYear = new Date(form.dateYearRange[0]).getFullYear()
          const endYear = new Date(form.dateYearRange[1]).getFullYear()
          formDataForAdd.startDate = `${startYear}-01-01`
          formDataForAdd.endDate = `${endYear}-12-31`
        }
        
        const addData = {
          ...formDataForAdd,
          delFlag: '0'
        }
        const res = await AgricultureRotationPlanService.addPlan(addData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
          
          // 如果是季度计划且详情对话框打开，刷新年度计划信息和季度计划列表
          // 注意：年度计划状态的自动更新应该在后端实现
          if (isSeasonalPlan && detailOpen.value && detailInfo.value.planType === 'annual') {
            // 重新加载年度计划信息（后端应该已经自动更新了状态）
            if (parentPlanId) {
              const annualPlanRes = await AgricultureRotationPlanService.getPlan(parentPlanId)
              if (annualPlanRes.code === 200) {
                detailInfo.value = annualPlanRes.data
              }
            }
            await loadSeasonalPlanList()
          } else if (detailOpen.value && detailInfo.value.planType === 'annual') {
            // 如果详情对话框打开且是年度计划，刷新季度计划列表
            await loadSeasonalPlanList()
          }
        }
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: AgricultureRotationPlanResult) => {
  const planId = row.planId
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
  planRef.value?.resetFields()
  hasSeasonalPlans.value = false
  form.dateYearRange = undefined
  form.dateRange = undefined
  parentAnnualPlanDateRange.value = null
  parentAnnualPlanTotalArea.value = null
}

/** 提交明细按钮 */
const submitFormDetail = async () => {
  if (!detailRef.value) return
  await detailRef.value.validate(async (valid) => {
    if (valid) {
      // 验证种植面积是否超过轮作计划的总面积
      if (formDetail.plantingArea && detailInfo.value && detailInfo.value.totalArea) {
        const plantingArea = Number(formDetail.plantingArea)
        const rotationPlanTotalArea = Number(detailInfo.value.totalArea)
        if (!isNaN(plantingArea) && !isNaN(rotationPlanTotalArea) && rotationPlanTotalArea > 0) {
          if (plantingArea > rotationPlanTotalArea) {
            ElMessage.warning(`种植面积不能超过轮作计划的总面积（${rotationPlanTotalArea}亩）`)
            return
          }
        }
      }
      
      // 排除实际日期字段，这些字段由后端自动更新
      const { actualStartDate, actualEndDate, ...formData } = formDetail
      
      if (formDetail.detailId) {
        const res = await AgricultureRotationDetailService.updateDetail(formData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          openDetail.value = false
          // 如果详情对话框打开，刷新详情对话框中的列表
          if (detailOpen.value) {
            loadDetailList()
          }
        }
      } else {
        const res = await AgricultureRotationDetailService.addDetail(formData)
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

/** 获取季节类型标签类型（用于不同季节显示不同颜色） */
const getSeasonTypeTagType = (seasonType: string | undefined | null): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  if (!seasonType) return 'info'
  
  const seasonTypeStr = String(seasonType).toLowerCase()
  
  // 春季：绿色（success）
  if (seasonTypeStr === '1' || seasonTypeStr === 'spring' || seasonTypeStr === '春季') {
    return 'success'
  }
  // 夏季：橙色（warning）
  if (seasonTypeStr === '2' || seasonTypeStr === 'summer' || seasonTypeStr === '夏季') {
    return 'warning'
  }
  // 秋季：橙红色（danger）
  if (seasonTypeStr === '3' || seasonTypeStr === 'autumn' || seasonTypeStr === 'fall' || seasonTypeStr === '秋季') {
    return 'danger'
  }
  // 冬季：深蓝色（primary）
  if (seasonTypeStr === '4' || seasonTypeStr === 'winter' || seasonTypeStr === '冬季') {
    return 'primary'
  }
  
  return 'info'
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

/** 获取作物名称 */
const getClassName = (classId: string | number | undefined | null): string => {
  if (!classId) return '--'
  return classMap.value.get(classId) || String(classId)
}

/** 获取温室名称 */
const getPastureName = (pastureId: string | number | undefined | null): string => {
  if (!pastureId) return '--'
  const pasture = pastureOptions.value.find(item => item.id === pastureId)
  return pasture?.name || '--'
}

/** 获取温室面积 */
const getPastureArea = (pastureId: string | number | undefined | null): number => {
  if (!pastureId) return 0
  const pasture = pastureOptions.value.find(item => item.id === pastureId)
  if (pasture && pasture.area) {
    const area = Number(pasture.area)
    return isNaN(area) ? 0 : area
  }
  return 0
}

/** 加载种植计划映射 */
const loadRotationPlanMap = async () => {
  try {
    const res = await AgricultureRotationPlanService.listPlan({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200 && res.rows) {
      rotationPlanMap.value.clear()
      res.rows.forEach((plan: AgricultureRotationPlanResult) => {
        const planId = plan.planId
        const planName = plan.planName
        if (planId) {
          rotationPlanMap.value.set(String(planId), String(planName || ''))
        }
      })
    }
  } catch (error) {
    console.error('加载种植计划映射失败:', error)
  }
}

/** 加载作物映射 */
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
    console.error('加载作物映射失败:', error)
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
