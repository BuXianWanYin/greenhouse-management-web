import mqtt, { MqttClient } from 'mqtt';
import config from '@/config';

//单例mqtt客户端
let mqttClient: MqttClient | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

export function getMqttClient(): MqttClient {
  if (!mqttClient) {
    const mqttConfig = config.mqtt;
    
    // 验证MQTT配置
    if (!mqttConfig.brokerUrl) {
      console.error('❌ MQTT配置错误: brokerUrl未配置');
      console.warn('💡 提示: 请在.env文件中配置 VITE_MQTT_BROKER_URL');
      throw new Error('MQTT brokerUrl未配置');
    }
    
    console.log('🔌 MQTT连接配置:', {
      brokerUrl: mqttConfig.brokerUrl,
      username: mqttConfig.username || '未配置',
      clientIdPrefix: mqttConfig.clientIdPrefix,
      connectTimeout: mqttConfig.connectTimeout,
      reconnectPeriod: mqttConfig.reconnectPeriod
    });
    
    const options = {
      username: mqttConfig.username,
      password: mqttConfig.password,
      clientId: mqttConfig.clientIdPrefix + Math.random().toString(16).slice(2, 10),
      clean: mqttConfig.clean,
      reconnectPeriod: mqttConfig.reconnectPeriod,
      connectTimeout: mqttConfig.connectTimeout,
    };
    mqttClient = mqtt.connect(mqttConfig.brokerUrl, options);
    
    // 监听连接成功事件
    mqttClient.on('connect', () => {
      console.log('✅ MQTT连接成功');
      reconnectAttempts = 0; // 重置重连计数
    });
    
    // 监听连接错误事件
    mqttClient.on('error', (error) => {
      console.error('❌ MQTT连接错误:', error);
      console.error('错误详情:', {
        message: error.message,
        code: (error as any).code,
        brokerUrl: mqttConfig.brokerUrl
      });
      
      // 提供诊断建议
      if (mqttConfig.brokerUrl.includes('localhost') || mqttConfig.brokerUrl.includes('127.0.0.1')) {
        console.warn('💡 诊断建议:');
        console.warn('   1. 确认RabbitMQ服务是否正在运行');
        console.warn('   2. 确认RabbitMQ MQTT WebSocket插件是否已启用:');
        console.warn('      rabbitmq-plugins enable rabbitmq_mqtt');
        console.warn('      rabbitmq-plugins enable rabbitmq_web_mqtt');
        console.warn('   3. 检查端口15675是否被占用或防火墙是否阻止');
        console.warn('   4. 检查RabbitMQ配置文件中的WebSocket端口配置');
      }
    });
    
    // 监听连接断开事件
    mqttClient.on('offline', () => {
      console.warn('⚠️ MQTT连接已断开');
    });
    
    // 监听连接关闭事件
    mqttClient.on('close', () => {
      console.warn('⚠️ MQTT连接已关闭');
    });
    
    // 监听正在重连事件
    mqttClient.on('reconnect', () => {
      reconnectAttempts++;
      console.log(`🔄 MQTT正在尝试重连... (第${reconnectAttempts}次)`);
      
      // 如果重连次数过多，提示用户检查配置
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.warn(`⚠️ MQTT已重连${reconnectAttempts}次，仍未成功连接`);
        console.warn('💡 请检查:');
        console.warn('   1. RabbitMQ服务状态');
        console.warn('   2. MQTT WebSocket插件是否已启用');
        console.warn('   3. 网络连接是否正常');
        console.warn('   4. 防火墙设置');
      }
    });
    
    // 监听end事件（连接完全结束时）
    mqttClient.on('end', () => {
      console.log('🔚 MQTT连接已结束');
    });
  }
  return mqttClient;
}
