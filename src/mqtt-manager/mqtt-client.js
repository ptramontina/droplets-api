const mqtt = require('mqtt')
const mqttClient = mqtt.connect(process.env.MOSQUITTO_URL)

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker')
})

mqttClient.on('message', (topic, message) => {
  console.log('message is ' + message)
  console.log('topic is ' + topic)

  try {
      const deviceId = parseTopic(topic)
      const data = parseMessage(message)

      Device.handleMessage(deviceId, data)
      
    } catch (e) {
      console.log('Error with MQTT message: ' + e)
    }
})

function parseTopic (topic) {
    topicParts = topic.split('/')

    if (topicParts.length !== 2) {
      throw new Error ('Invalid topic.')
    }

    return topicParts[0]    
}

function parseMessage (message) {
    try {
      return JSON.parse(message+'')
    } catch (e) {
      throw new Error('Invalid JSON message.' + message)
    }    
}

module.exports = mqttClient

const Device = require('../models/device')
