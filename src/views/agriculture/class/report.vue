<template>
  <div class="report-content">
    <template v-if="report">
      <el-row :gutter="20">
        <!-- 左侧内容 -->
        <el-col :span="6">
          <!-- 基本信息 -->
          <div class="info-card card">
            <div class="image-wrapper">
              <img :src="classImage" :alt="className" />
            </div>
            <div class="info-content">
              <h2>{{ className }}</h2>
              <div class="type-tag">{{ getCategoryName(classTypeName) }}</div>
              <div class="meta-info">
                <div>{{ reportData.reportId }}</div>
                <div>
                  <el-icon><Clock /></el-icon>
                  {{ reportData.createTime }}
                </div>
              </div>
              <el-button 
                size="default" 
                type="primary" 
                :loading="isLoading"
                :disabled="isLoading"
                @click="handleAiAdd"
              >
                重新智能分析
              </el-button>
            </div>
          </div>

          <!-- 核心指标 -->
          <div class="metrics-card card">
            <div class="section-title">
              <el-icon><TrendCharts /></el-icon>
              <span>核心指标</span>
            </div>
            <div class="metrics-list list">
              <div v-for="(item, index) in coreIndicators" :key="index" class="metric-item item">
                <div class="metric-header header">
                  <el-icon><component :is="item.icon" /></el-icon>
                  <span>{{ item.name }}</span>
                  <span class="value">{{ item.value || 0 }}%</span>
                </div>
                <el-progress
                  :percentage="Number(item.value || 0)"
                  :show-text="false"
                  :stroke-width="4"
                  :color="item.color"
                />
              </div>
            </div>
          </div>
        </el-col>

        <!-- 中间内容 -->
        <el-col :span="12">
          <!-- 环境参数 -->
          <div class="params-card card">
            <div class="section-title">
              <el-icon><Setting /></el-icon>
              <span>环境参数</span>
            </div>
            <el-table
              :data="environmentParams"
              style="width: 100%"
              :stripe="true"
              size="small"
              border
            >
              <el-table-column prop="name" label="参数名称" width="120" />
              <el-table-column prop="value" label="标准范围" width="120" />
              <el-table-column prop="description" label="说明" />
            </el-table>
          </div>

          <!-- 建议部分 -->
          <div class="suggestions-card card">
            <div class="section-title">
              <el-icon><Opportunity /></el-icon>
              <span>种植建议</span>
            </div>
            <div class="suggestions-grid grid">
              <div class="suggestion-item item">
                <div class="suggestion-icon">
                  <el-icon><InfoFilled /></el-icon>
                </div>
                <div class="suggestion-content">
                  <h4>水分管理</h4>
                  <p>{{ reportData.waterManagement }}</p>
                </div>
              </div>
              <div class="suggestion-item item">
                <div class="suggestion-icon">
                  <el-icon><Food /></el-icon>
                </div>
                <div class="suggestion-content">
                  <h4>肥料管理</h4>
                  <p>{{ reportData.feedingManagement }}</p>
                </div>
              </div>
              <div class="suggestion-item item">
                <div class="suggestion-icon">
                  <el-icon><FirstAidKit /></el-icon>
                </div>
                <div class="suggestion-content">
                  <h4>病害预防</h4>
                  <p>{{ reportData.diseasePrevention }}</p>
                </div>
              </div>
              <div class="suggestion-item item">
                <div class="suggestion-icon">
                  <el-icon><Monitor /></el-icon>
                </div>
                <div class="suggestion-content">
                  <h4>环境监测</h4>
                  <p>{{ reportData.environmentMonitoring }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧内容 -->
        <el-col :span="6">
          <!-- 综合评估 -->
          <div class="analysis-card card">
            <div class="section-title">
              <el-icon><DataAnalysis /></el-icon>
              <span>综合评估</span>
            </div>
            <div class="analysis-list list">
              <div class="analysis-item item">
                <h4>生长评估</h4>
                <p>{{ reportData.growthAssessment }}</p>
              </div>
              <div class="analysis-item item">
                <h4>种植难度</h4>
                <p>{{ reportData.cultivationDifficulty }}</p>
              </div>
              <div class="analysis-item item">
                <h4>综合建议</h4>
                <p>{{ reportData.generalRecommendations }}</p>
              </div>
              <div class="analysis-item item">
                <h4>市场分析</h4>
                <p>{{ reportData.marketAnalysis }}</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </template>
    <div v-else class="analyze-button-container">
      <el-empty description="暂无数据"></el-empty>
      <el-button 
        type="primary" 
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleAiAdd"
      >
        开始智能分析
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { AgricultureClassAiReportService } from '@/api/agriculture/classReportApi'
  import { AgricultureClassService } from '@/api/agriculture/classApi'
  import { AgricultureClassAiReportResult } from '@/types/agriculture/classReport'

  const report = ref<AgricultureClassAiReportResult>()
  const isLoading = ref(false)
  const prop = defineProps({
    classId: {
      type: [String, Number],
      required: true
    },
    classTypeName: {
      type: String
    },
    className: {
      type: String
    },
    classImage: {
      type: String
    },
    classType: {
      type: String
    }
  })

  const reportData = computed(() => report.value || ({} as AgricultureClassAiReportResult))

  const environmentParams = computed(() => {
    if (!reportData.value) return []

    // 统一显示实际检测的环境参数
    return [
      { name: '环境温度', ...parseParamValue(reportData.value.optimalTemperature) },
      { name: '环境湿度', ...parseParamValue(reportData.value.optimalHumidity) },
      { name: '环境光照', ...parseParamValue(reportData.value.optimalLight) },
      { name: '土壤温度', ...parseParamValue(reportData.value.optimalSoilTemperature) },
      { name: '土壤湿度', ...parseParamValue(reportData.value.optimalSoilHumidity) },
      { name: '土壤电导率', ...parseParamValue(reportData.value.optimalSoilConductivity) },
      { name: '土壤pH值', ...parseParamValue(reportData.value.optimalSoilPh) },
      { name: '土壤盐分', ...parseParamValue(reportData.value.optimalSoilSalinity) },
      { name: '土壤氮含量', ...parseParamValue(reportData.value.optimalSoilNitrogen) },
      { name: '土壤磷含量', ...parseParamValue(reportData.value.optimalSoilPhosphorus) },
      { name: '土壤钾含量', ...parseParamValue(reportData.value.optimalSoilPotassium) }
    ]
  })

  const coreIndicators = computed(() => {
    if (!reportData.value) return []

    const indicators = [
      {
        icon: 'Timer',
        name: '生长速度',
        value: reportData.value.growthRate,
        color: '#409EFF'
      },
      {
        icon: 'FirstAidKit',
        name: '抗病能力',
        value: reportData.value.diseaseResistance,
        color: '#67C23A'
      },
      {
        icon: 'Goods',
        name: '肥料转化率',
        value: reportData.value.feedConversion,
        color: '#E6A23C'
      },
      {
        icon: 'Goods',
        name: '市场接受度',
        value: reportData.value.marketAcceptance,
        color: '#F56C6C'
      }
    ]
    return indicators
  })

  const parseParamValue = (value: string) => {
    try {
      const parsed = JSON.parse(value || '[]')
      return {
        value: parsed[0] || '',
        description: parsed[1] || ''
      }
    } catch (e) {
      return {
        value: '',
        description: ''
      }
    }
  }

  const getInfo = async () => {
    const res = await AgricultureClassAiReportService.getReport({ classId: prop.classId })
    if (res.code === 200) {
      report.value = res.data
      // 如果获取到数据，说明报告已生成，重置loading状态
      if (res.data) {
        isLoading.value = false
      }
    }
  }

  // 将类别英文值转换为中文显示
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'fruit': '瓜果',
      'vegetable': '蔬菜',
      'other': '其他'
    }
    return categoryMap[category] || category
  }

  // 智能分析按钮
  const handleAiAdd = async () => {
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      const res = await AgricultureClassService.aiAddClassReport({
        classId: prop.classId,
        className: prop.className,
        classTypeName: prop.classTypeName,
        classType: prop.classType
      })
      if (res.code === 200) {
        ElMessage.success('操作成功 请耐心等待报告生成 预估时间30s')
      }
    } catch (error) {
      console.error('智能分析失败:', error)
      isLoading.value = false
    }
    // 注意：loading状态会在WebSocket收到消息后通过getInfo()刷新数据时重置
  }

  import { WebSocketType, WebSocketContant, WebSocketKey } from '@/enums/agricultureEnum'
  import { useWebSocketStore } from '@/store/modules/websocket'
  import { playAudio } from '@/utils/utils'
  const wsStore = useWebSocketStore()
  const getWebSocket = () => {
    // 注册AI智能报告消息处理器
    wsStore.registerMessageHandler(WebSocketKey.MQ, WebSocketType.AI_REPORT_KEY, (data) => {
      // 处理AI智能报告消息
      ElNotification({
        title: WebSocketContant.AI_TITLE,
        type: 'success',
        showClose: false,
        duration: 5000,
        zIndex: 10000,
        message: `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #409EFF;">${data.id}</div>
            <div style="color: #606266; line-height: 1.5;">${data.content}</div>
          </div>
        `,
        dangerouslyUseHTMLString: true
      })
      playAudio()
      // 刷新信息，并在获取到数据后重置loading状态
      getInfo()
    })
  }

  onMounted(() => {
    getInfo()
    getWebSocket()
  })
</script>
<style lang="scss" scoped>
  .report-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .analyze-button-container {
      text-align: center;
      padding: 20px 0;
      margin-top: auto;
    }

    .el-row {
      height: 100%;
      margin: 0 -10px;

      .el-col {
        height: 100%;
        padding: 0 10px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
    }

    .card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
    }

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      i {
        font-size: 16px;
        margin-right: 8px;
        color: #409eff;
      }

      span {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    // 左侧样式
    .info-card {
      padding: 12px;
      text-align: center;

      .image-wrapper {
        width: 140px;
        height: 90px;
        margin: 0 auto 12px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }
      }

      .info-content {
        h2 {
          margin: 0 0 6px;
          font-size: 16px;
          color: #303133;
        }

        .type-tag {
          display: inline-block;
          padding: 2px 8px;
          background: #f0f9eb;
          color: #67c23a;
          border-radius: 4px;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .meta-info {
          color: #909399;
          font-size: 13px;

          div {
            margin-bottom: 4px;

            i {
              margin-right: 4px;
            }
          }
        }
      }
    }

    .metrics-card {
      flex: 1;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item {
      background: #f8f9fb;
      border-radius: 6px;
      padding: 10px;
    }

    .metrics-list .item {
      padding: 12px;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      i {
        font-size: 16px;
        margin-right: 8px;
        color: #409eff;
      }

      span {
        color: #606266;
        font-size: 13px;
      }

      .value {
        margin-left: auto;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    // 中间内容样式
    .params-card {
      height: 45%;
      margin-bottom: 15px;
    }

    .suggestions-card {
      height: calc(55% - 15px);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 10px;
      margin-top: 15px;
      height: calc(100% - 56px);
    }

    .suggestions-grid .item {
      display: flex;
      gap: 12px;

      .suggestion-icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: rgba(64, 158, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        i {
          font-size: 16px;
          color: #409eff;
        }
      }

      .suggestion-content {
        flex: 1;

        h4 {
          margin: 0 0 6px;
          font-size: 14px;
          color: #303133;
        }

        p {
          margin: 0;
          font-size: 12px;
          color: #606266;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    // 右侧内容样式
    .analysis-card {
      height: 100%;
    }

    .analysis-list .item {
      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        color: #303133;
        display: flex;
        align-items: center;

        &::before {
          content: '';
          width: 4px;
          height: 14px;
          background: #409eff;
          margin-right: 8px;
          border-radius: 2px;
        }
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #606266;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
</style>
