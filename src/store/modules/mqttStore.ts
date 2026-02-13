import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMqttClient } from '@/api/mqtt/mqttClient'
import { AgricultureDeviceMqttConfigService } from '@/api/device/deviceConfigApi'
import { ElNotification } from 'element-plus'
import { createNotificationMessage } from '@/components/AlertNotification/message.vue'
import { router } from '@/router'

/**
 * MQTT 状态管理 Store
 * 用于管理 MQTT 客户端连接、设备数据订阅和预警数据
 */
export const useMqttStore = defineStore('mqtt', () => {
  // 设备数据Map
  const deviceDataMap = ref<{ [deviceId: string]: any }>({})
  // 预警数据
  const alertData = ref<any>(null)
  
  // MQTT客户端和订阅主题集合
  let mqttClient: any = null
  const subscribedTopics = new Set<string>()
  let messageHandler: any = null

  /**
   * 预警主题配置
   */
  const ALERT_TOPIC = 'greenhouse/alerts' // 预警主题（与后端配置保持一致）

  // 初始化MQTT客户端和消息处理器
  function initMqttClient() {
    if (!mqttClient) mqttClient = getMqttClient()
    if (!messageHandler) {  
      messageHandler = (topic: string, message: Buffer) => {
        try {
          const data = JSON.parse(message.toString())
          
          // 处理预警数据
          if (topic === ALERT_TOPIC) {
            alertData.value = data
            console.log("收到预警信息：", data)
            // 显示预警通知
            showAlertNotification(data)
            return
          }
          
          // 处理设备数据
          if (data.deviceId) {
            deviceDataMap.value[String(data.deviceId)] = data
            console.log('全局收到MQTT消息:', { topic, data })
          }
        } catch (e) {
          console.error('解析MQTT消息失败', e)
        }
      }
      mqttClient.on('message', messageHandler)
      
      // 自动订阅预警主题
      subscribeAlertTopics()
    }
  }

  // 初始化并订阅所有设备的topic
  async function subscribeAllDeviceTopics(deviceList: any[]) {
    initMqttClient()
    
    // 订阅设备主题
    for (const device of deviceList) {
      const res: any = await AgricultureDeviceMqttConfigService.getConfigByDeviceId(device.id)
      if (res && res.code === 200 && res.data && res.data.mqttTopic) {
        const topic = res.data.mqttTopic
        if (!subscribedTopics.has(topic)) {
          mqttClient.subscribe([topic])
          subscribedTopics.add(topic)
        }
      }
    }
  }

  // 订阅预警主题
  function subscribeAlertTopics() {
    initMqttClient()
    
    if (!subscribedTopics.has(ALERT_TOPIC)) {
      mqttClient.subscribe(ALERT_TOPIC, { qos: 1 }, (error: any) => {
        if (error) {
          console.error('订阅预警主题失败:', error)
        } else {
          subscribedTopics.add(ALERT_TOPIC)
          console.log('已订阅预警主题:', ALERT_TOPIC)
        }
      })
    }
  }

  // 取消订阅预警主题
  function unsubscribeAlertTopics() {
    if (mqttClient) {
      mqttClient.unsubscribe(ALERT_TOPIC, (error: any) => {
        if (error) {
          console.error('取消订阅预警主题失败:', error)
        } else {
          subscribedTopics.delete(ALERT_TOPIC)
          // 清空预警数据
          alertData.value = null
          console.log('已取消订阅预警主题:', ALERT_TOPIC)
        }
      })
    }
  }
  
  /**
   * 显示预警通知
   */
  function showAlertNotification(alert: any) {
    const levelMap: Record<number, { type: 'success' | 'warning' | 'info' | 'error', title: string }> = {
      0: { type: 'warning', title: '⚡ 警告' },
      1: { type: 'error', title: '⚠️ 严重报警' },
      2: { type: 'error', title: '🚨 紧急报警' },
    }
    
    const level = levelMap[alert.alertLevel] || levelMap[0]
    const pastureName = alert.pastureName || '未知温室'
    
    const notification = ElNotification({
      type: level.type,
      title: `${level.title} · ${pastureName}`,
      dangerouslyUseHTMLString: true,
      message: createNotificationMessage(alert),
      duration: 0,
      position: 'top-right',
      onClick: () => {
        notification.close()
      }
    })

    // 监听“查看设备数据”链接点击
    setTimeout(() => {
      document.querySelectorAll('.alert-goto-link').forEach(el => {
        if (!el.getAttribute('data-bindedclick')) {
          el.setAttribute('data-bindedclick', 'true')
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            const target = e.currentTarget as HTMLElement
            const pastureId = target.getAttribute('data-pasture-id')
            // 尝试跳转到传感器数据页，带上温室ID参数
            try {
              router.push({ path: '/agriculture/device/sensondata', query: pastureId ? { pastureId } : {} })
            } catch {
              // 如果路由不存在，尝试其他路径
              console.warn('跳转设备数据页失败')
            }
            notification.close()
          })
        }
      })
    }, 100)
  }

  return {
    deviceDataMap, // 设备数据映射表
    alertData, // 预警数据
    initMqttClient, // 初始化 MQTT 客户端
    subscribeAllDeviceTopics, // 订阅所有设备主题
    subscribeAlertTopics, // 订阅预警主题
    unsubscribeAlertTopics // 取消订阅预警主题
  }
})