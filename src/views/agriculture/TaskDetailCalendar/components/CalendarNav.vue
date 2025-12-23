<template>
    <div class="calendar-nav">
        <!-- 日历图例 -->
        <div class="calendar-legend">
            <span class="legend-item">
                <span class="legend-dot work-hours"></span>
                <span>工时</span>
            </span>
            <span class="legend-item">
                <span class="legend-dot material"></span>
                <span>农资</span>
            </span>
            <span class="legend-item">
                <span class="legend-dot attachment"></span>
                <span>附件</span>
            </span>
        </div>
        
        <!-- 单月日历 -->
        <div class="calendar-container" v-if="currentMonthData">
            <!-- 月份切换头部 -->
            <div class="month-nav">
                <el-button 
                    :icon="ArrowLeft" 
                    circle 
                    size="small"
                    @click="prevMonth"
                />
                <span class="month-title">{{ currentMonthData.year }}年{{ currentMonthData.month }}月</span>
                <el-button 
                    :icon="ArrowRight" 
                    circle 
                    size="small"
                    @click="nextMonth"
                />
            </div>
            
            <!-- 星期头 -->
            <div class="weekday-row">
                <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
            </div>
            
            <!-- 日期网格 -->
            <div class="days-grid">
                <div 
                    v-for="(day, idx) in currentMonthData.days" 
                    :key="idx"
                    class="day-cell"
                    :class="{
                        'other-month': day.isOtherMonth,
                        'in-range': day.inRange || day.selectable,
                        'out-range': day.date && !day.inRange && !day.selectable && !day.isOtherMonth,
                        'selected': day.date === props.selectedDate,
                        'today': day.isToday,
                        'selectable': day.selectable,
                        'not-selectable': day.date && (day.inRange || day.selectable) && !day.selectable
                    }"
                    @click="handleDayClick(day)"
                >
                    <span class="day-number">{{ day.day }}</span>
                    <div v-if="day.date && (day.inRange || day.selectable)" class="day-markers">
                        <span 
                            v-if="getDaySummary(day.date)?.hasWorkHours" 
                            class="marker work-hours"
                        ></span>
                        <span 
                            v-if="getDaySummary(day.date)?.hasMaterial" 
                            class="marker material"
                        ></span>
                        <span 
                            v-if="getDaySummary(day.date)?.hasAttachment" 
                            class="marker attachment"
                        ></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
    planStart: {
        type: String,
        default: ''
    },
    planFinish: {
        type: String,
        default: ''
    },
    actualStart: {
        type: String,
        default: ''
    },
    actualFinish: {
        type: String,
        default: ''
    },
    selectedDate: {
        type: String,
        default: ''
    },
    dailySummary: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['select-date'])

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前显示的月份索引
const currentMonthIndex = ref(0)

// 当前月份数据
const currentMonthData = computed(() => {
    if (monthList.value.length === 0) return null
    return monthList.value[currentMonthIndex.value] || monthList.value[0]
})

// 上个月
const prevMonth = () => {
    if (currentMonthIndex.value > 0) {
        currentMonthIndex.value--
    }
}

// 下个月
const nextMonth = () => {
    if (currentMonthIndex.value < monthList.value.length - 1) {
        currentMonthIndex.value++
    }
}

// 监听 actualStart 变化，自动跳转到实际开始时间所在月份
watch(() => props.actualStart, (newVal) => {
    if (newVal && monthList.value.length > 0) {
        const actualDate = new Date(newVal.split(' ')[0])
        const targetYear = actualDate.getFullYear()
        const targetMonth = actualDate.getMonth() + 1
        const idx = monthList.value.findIndex(m => m.year === targetYear && m.month === targetMonth)
        if (idx >= 0) {
            currentMonthIndex.value = idx
        }
    }
}, { immediate: true })

// 计算需要显示的月份列表
const monthList = computed(() => {
    if (!props.planStart || !props.planFinish) return []
    
    const planStartDate = new Date(props.planStart.split(' ')[0])
    const planEndDate = new Date(props.planFinish.split(' ')[0])
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 获取可选范围（依赖 actualStart 和 actualFinish）
    const range = selectableRange.value
    
    // 计算显示范围：需要同时覆盖计划时间和实际时间
    let displayStart = planStartDate
    let displayEnd = planEndDate
    
    // 如果有实际开始时间，扩展显示范围
    if (props.actualStart) {
        const actualStartDate = new Date(props.actualStart.split(' ')[0])
        if (actualStartDate < displayStart) {
            displayStart = actualStartDate
        }
        if (actualStartDate > displayEnd) {
            displayEnd = actualStartDate
        }
    }
    
    // 如果有实际结束时间，扩展显示范围
    if (props.actualFinish) {
        const actualEndDate = new Date(props.actualFinish.split(' ')[0])
        if (actualEndDate > displayEnd) {
            displayEnd = actualEndDate
        }
    }
    
    const months = []
    const current = new Date(displayStart.getFullYear(), displayStart.getMonth(), 1)
    const endMonth = new Date(displayEnd.getFullYear(), displayEnd.getMonth(), 1)
    
    while (current <= endMonth) {
        const year = current.getFullYear()
        const month = current.getMonth() + 1
        const days = generateMonthDays(year, month, planStartDate, planEndDate, today, range)
        
        months.push({
            key: `${year}-${month}`,
            year,
            month,
            days
        })
        
        current.setMonth(current.getMonth() + 1)
    }
    
    return months
})

// 计算可选日期范围
const selectableRange = computed(() => {
    // 如果没有实际开始时间，所有日期都不可选
    if (!props.actualStart) {
        return { start: null, end: null }
    }
    
    const actualStartDate = new Date(props.actualStart.split(' ')[0])
    actualStartDate.setHours(0, 0, 0, 0)
    
    // 如果有实际结束时间，范围闭环：actualStart 到 actualFinish
    if (props.actualFinish) {
        const actualEndDate = new Date(props.actualFinish.split(' ')[0])
        actualEndDate.setHours(0, 0, 0, 0)
        return { start: actualStartDate, end: actualEndDate }
    }
    
    // 如果只有实际开始时间，没有实际结束时间，从实际开始时间往后都可选（无限制）
    return { start: actualStartDate, end: null }
})

// 生成某个月的所有日期
const generateMonthDays = (year, month, startDate, endDate, today, range) => {
    const days = []
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const firstDayOfWeek = firstDay.getDay()
    
    // 填充月初空白（上个月的日期）
    if (firstDayOfWeek > 0) {
        const prevMonthLastDay = new Date(year, month - 1, 0) // 上个月最后一天
        const prevMonthDays = prevMonthLastDay.getDate()
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const d = prevMonthDays - i
            days.push({ 
                date: null, 
                day: d, 
                inRange: false, 
                selectable: false,
                isOtherMonth: true
            })
        }
    }
    
    // 填充当月日期
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month - 1, d)
        date.setHours(0, 0, 0, 0)
        const dateStr = formatDate(date)
        // inRange 用于显示计划范围内的日期
        const inRange = date >= startDate && date <= endDate
        const isToday = date.getTime() === today.getTime()
        // 计算可选状态
        let selectable = false
        if (range.start) {
            if (range.end) {
                selectable = date >= range.start && date <= range.end
            } else {
                selectable = date >= range.start
            }
        }
        
        days.push({
            date: dateStr,
            day: d,
            inRange,
            isToday,
            selectable,
            isOtherMonth: false
        })
    }
    
    // 填充月末空白（下个月的日期）
    const totalCells = days.length
    const remainingCells = (7 - (totalCells % 7)) % 7
    for (let i = 1; i <= remainingCells; i++) {
        days.push({ 
            date: null, 
            day: i, 
            inRange: false, 
            selectable: false,
            isOtherMonth: true
        })
    }
    
    return days
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 获取某日的汇总数据
const getDaySummary = (date) => {
    return props.dailySummary[date] || null
}

// 处理日期点击
const handleDayClick = (day) => {
    if (day.date && day.selectable) {
        emit('select-date', day.date)
    }
}
</script>

<style lang="scss" scoped>
.calendar-nav {
    .calendar-legend {
        display: flex;
        gap: 12px;
        padding: 8px 0;
        margin-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #606266;
            
            .legend-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                
                &.work-hours {
                    background-color: #67c23a;
                }
                
                &.material {
                    background-color: #e6a23c;
                }
                
                &.attachment {
                    background-color: #409eff;
                }
            }
        }
    }
    
    .calendar-container {
        .month-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            margin-bottom: 8px;
            background: #f5f7fa;
            border-radius: 4px;
            
            .month-title {
                font-weight: bold;
                font-size: 14px;
                color: #303133;
            }
        }
        
        .weekday-row {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-size: 12px;
            color: #909399;
            padding: 4px 0;
            
            .weekday {
                padding: 4px 0;
            }
        }
        
        .days-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            
            .day-cell {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                cursor: pointer;
                border-radius: 4px;
                position: relative;
                min-height: 42px;
                padding: 4px 0;
                
                &.other-month {
                    color: #c0c4cc;
                    cursor: default;
                }
                
                &.in-range {
                    background: #f5f7fa;
                }
                
                &.selectable {
                    background: #e8f4ff;
                    cursor: pointer;
                    
                    &:hover {
                        background: #d9ecff;
                    }
                }
                
                &.not-selectable {
                    color: #c0c4cc;
                    cursor: not-allowed;
                    background: #fafafa;
                }
                
                &.out-range {
                    color: #c0c4cc;
                    cursor: not-allowed;
                }
                
                &.selected {
                    background: #409eff !important;
                    color: #fff;
                    
                    .day-markers .marker {
                        border: 1px solid #fff;
                    }
                }
                
                &.today {
                    .day-number {
                        color: #f56c6c;
                        font-weight: bold;
                    }
                    
                    &.selected .day-number {
                        color: #fff;
                    }
                }
                
                .day-number {
                    line-height: 1;
                }
                
                .day-markers {
                    display: flex;
                    gap: 2px;
                    margin-top: 2px;
                    
                    .marker {
                        width: 5px;
                        height: 5px;
                        border-radius: 50%;
                        
                        &.work-hours {
                            background-color: #67c23a;
                        }
                        
                        &.material {
                            background-color: #e6a23c;
                        }
                        
                        &.attachment {
                            background-color: #409eff;
                        }
                    }
                }
            }
        }
    }
}
</style>
