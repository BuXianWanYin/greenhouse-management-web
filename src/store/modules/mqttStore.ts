import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMqttClient } from '@/api/mqtt/mqttClient'
import { AgricultureDeviceMqttConfigService } from '@/api/device/deviceConfigApi'

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
  const ALERT_TOPICS = {
    ALERTS: 'dishfish-/alerts' // 预警主题
  }

  // 初始化MQTT客户端和消息处理器
  function initMqttClient() {
    if (!mqttClient) mqttClient = getMqttClient()
    if (!messageHandler) {  
      messageHandler = (topic: string, message: any) => {
        try {
          const data = JSON.parse(message.toString())
          
          // 处理预警数据
          if(topic === ALERT_TOPICS.ALERTS){
            alertData.value = data
            console.log("收到预警信息：",data)
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
    
    Object.values(ALERT_TOPICS).forEach(topic => {
      if (!subscribedTopics.has(topic)) {
        mqttClient.subscribe([topic])
        subscribedTopics.add(topic)
        console.log('已订阅预警主题:', topic)
      }
    })
  }

  // 取消订阅预警主题
  function unsubscribeAlertTopics() {
    if (mqttClient) {
      Object.values(ALERT_TOPICS).forEach(topic => {
        mqttClient.unsubscribe([topic])
        subscribedTopics.delete(topic)
      })
      
      // 清空预警数据
      alertData.value = null
      console.log('已取消订阅预警主题')
    }
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