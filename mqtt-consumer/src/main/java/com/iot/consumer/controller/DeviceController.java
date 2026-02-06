package com.iot.consumer.controller;

import com.iot.consumer.model.Device;
import com.iot.consumer.model.SensorReading;
import com.iot.consumer.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public ResponseEntity<List<Device>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @GetMapping("/{deviceId}")
    public ResponseEntity<Device> getDevice(@PathVariable String deviceId) {
        return deviceService.getDeviceByDeviceId(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{deviceId}")
    public ResponseEntity<Device> updateDevice(
            @PathVariable String deviceId,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Device updated = deviceService.updateDevice(deviceId, name.trim());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{deviceId}/readings")
    public ResponseEntity<Page<SensorReading>> getDeviceReadings(
            @PathVariable String deviceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ResponseEntity.ok(deviceService.getDeviceReadings(deviceId, page, size));
    }

    @GetMapping("/{deviceId}/readings/latest")
    public ResponseEntity<SensorReading> getLatestReading(@PathVariable String deviceId) {
        return deviceService.getLatestReading(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{deviceId}/readings/range")
    public ResponseEntity<List<SensorReading>> getReadingsInRange(
            @PathVariable String deviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(deviceService.getReadingsInRange(deviceId, start, end));
    }
}
