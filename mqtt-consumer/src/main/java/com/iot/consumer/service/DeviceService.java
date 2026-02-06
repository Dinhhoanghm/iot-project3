package com.iot.consumer.service;

import com.iot.consumer.model.Device;
import com.iot.consumer.model.SensorReading;
import com.iot.consumer.model.dto.DeviceStatusDto;
import com.iot.consumer.model.dto.SensorDataDto;
import com.iot.consumer.repository.DeviceRepository;
import com.iot.consumer.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void processSensorData(SensorDataDto sensorData) {
        Device device = getOrCreateDevice(sensorData.getDeviceId());
        device.setLastSeen(LocalDateTime.now());
        device.setStatus(Device.DeviceStatus.ONLINE);
        deviceRepository.save(device);

        SensorReading reading = SensorReading.builder()
                .device(device)
                .timestamp(LocalDateTime.now())
                .obstacle(sensorData.getSensors().getObstacle())
                .vibration(sensorData.getSensors().getVibration())
                .light(sensorData.getSensors().getLight())
                .buzzer(sensorData.getOutputs().getBuzzer())
                .led(sensorData.getOutputs().getLed())
                .build();

        sensorReadingRepository.save(reading);

        // Broadcast to WebSocket clients
        messagingTemplate.convertAndSend("/topic/sensors/" + device.getDeviceId(), sensorData);
        messagingTemplate.convertAndSend("/topic/sensors", sensorData);

        log.debug("Saved sensor reading for device: {}", device.getDeviceId());
    }

    @Transactional
    public void processDeviceStatus(DeviceStatusDto statusData) {
        Device device = getOrCreateDevice(statusData.getDeviceId());
        device.setIpAddress(statusData.getIp());
        device.setRssi(statusData.getRssi());
        device.setLastSeen(LocalDateTime.now());

        if ("online".equalsIgnoreCase(statusData.getStatus())) {
            device.setStatus(Device.DeviceStatus.ONLINE);
        } else if ("offline".equalsIgnoreCase(statusData.getStatus())) {
            device.setStatus(Device.DeviceStatus.OFFLINE);
        }

        deviceRepository.save(device);

        // Broadcast status update
        messagingTemplate.convertAndSend("/topic/devices/status", device);

        log.info("Updated device status: {} -> {}", device.getDeviceId(), device.getStatus());
    }

    private Device getOrCreateDevice(String deviceId) {
        return deviceRepository.findByDeviceId(deviceId)
                .orElseGet(() -> {
                    Device newDevice = Device.builder()
                            .deviceId(deviceId)
                            .name(deviceId)
                            .status(Device.DeviceStatus.ONLINE)
                            .lastSeen(LocalDateTime.now())
                            .build();
                    log.info("Created new device: {}", deviceId);
                    return deviceRepository.save(newDevice);
                });
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAllOrderByLastSeenDesc();
    }

    public Optional<Device> getDeviceById(Long id) {
        return deviceRepository.findById(id);
    }

    public Optional<Device> getDeviceByDeviceId(String deviceId) {
        return deviceRepository.findByDeviceId(deviceId);
    }

    public Page<SensorReading> getDeviceReadings(String deviceId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return sensorReadingRepository.findByDeviceIdOrderByTimestampDesc(deviceId, pageable);
    }

    public Optional<SensorReading> getLatestReading(String deviceId) {
        return sensorReadingRepository.findLatestByDeviceId(deviceId);
    }

    public List<SensorReading> getReadingsInRange(String deviceId, LocalDateTime start, LocalDateTime end) {
        return deviceRepository.findByDeviceId(deviceId)
                .map(device -> sensorReadingRepository.findByDeviceAndTimestampBetweenOrderByTimestampAsc(device, start, end))
                .orElse(List.of());
    }

    @Transactional
    public Device updateDevice(String deviceId, String name) {
        Device device = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found: " + deviceId));
        device.setName(name);
        return deviceRepository.save(device);
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void checkOfflineDevices() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(1);
        int updated = deviceRepository.updateOfflineDevices(
                Device.DeviceStatus.OFFLINE,
                threshold,
                Device.DeviceStatus.ONLINE
        );
        if (updated > 0) {
            log.info("Marked {} devices as offline", updated);
            messagingTemplate.convertAndSend("/topic/devices/status", "refresh");
        }
    }
}
