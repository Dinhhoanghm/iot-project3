package com.iot.consumer.repository;

import com.iot.consumer.model.Device;
import com.iot.consumer.model.SensorReading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    Page<SensorReading> findByDeviceOrderByTimestampDesc(Device device, Pageable pageable);

    List<SensorReading> findByDeviceAndTimestampBetweenOrderByTimestampAsc(
            Device device, LocalDateTime start, LocalDateTime end);

    Optional<SensorReading> findFirstByDeviceOrderByTimestampDesc(Device device);

    @Query("SELECT sr FROM SensorReading sr WHERE sr.device.deviceId = :deviceId ORDER BY sr.timestamp DESC")
    Page<SensorReading> findByDeviceIdOrderByTimestampDesc(String deviceId, Pageable pageable);

    @Query("SELECT sr FROM SensorReading sr WHERE sr.device.deviceId = :deviceId ORDER BY sr.timestamp DESC LIMIT 1")
    Optional<SensorReading> findLatestByDeviceId(String deviceId);

    void deleteByTimestampBefore(LocalDateTime threshold);
}
