package com.iot.consumer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iot.consumer.model.dto.DeviceStatusDto;
import com.iot.consumer.model.dto.SensorDataDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class MqttMessageHandler implements MessageHandler {

    private final DeviceService deviceService;
    private final ObjectMapper objectMapper;

    @Override
    public void handleMessage(Message<?> message) throws MessagingException {
        String topic = (String) message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
        String payload = message.getPayload().toString();

        log.debug("Received MQTT message on topic: {}, payload: {}", topic, payload);

        try {
            if (topic != null && topic.contains("/sensors")) {
                handleSensorData(payload);
            } else if (topic != null && topic.contains("/status")) {
                handleStatusData(payload);
            } else {
                log.warn("Unknown topic: {}", topic);
            }
        } catch (Exception e) {
            log.error("Error processing MQTT message: {}", e.getMessage(), e);
        }
    }

    private void handleSensorData(String payload) throws Exception {
        SensorDataDto sensorData = objectMapper.readValue(payload, SensorDataDto.class);
        log.info("Processing sensor data from device: {}", sensorData.getDeviceId());
        deviceService.processSensorData(sensorData);
    }

    private void handleStatusData(String payload) throws Exception {
        DeviceStatusDto statusData = objectMapper.readValue(payload, DeviceStatusDto.class);
        log.info("Processing status from device: {}", statusData.getDeviceId());
        deviceService.processDeviceStatus(statusData);
    }
}
