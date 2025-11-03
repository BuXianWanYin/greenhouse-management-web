import mqtt, { MqttClient } from 'mqtt';
import config from '@/config';

//单例mqtt客户端
let mqttClient: MqttClient | null = null;

export function getMqttClient(): MqttClient {
  if (!mqttClient) {
    const mqttConfig = config.mqtt;
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
      console.log('MQTT连接成功');
    });
    
    // 监听连接错误事件
    mqttClient.on('error', (error) => {
      console.error('MQTT连接错误:', error);
    });
    
    // 监听连接断开事件
    mqttClient.on('offline', () => {
      console.warn('MQTT连接已断开');
    });
    
    // 监听连接关闭事件
    mqttClient.on('close', () => {
      console.warn('MQTT连接已关闭');
    });
    
    // 监听正在重连事件
    mqttClient.on('reconnect', () => {
      console.log('MQTT正在尝试重连...');
    });
  }
  return mqttClient;
}
