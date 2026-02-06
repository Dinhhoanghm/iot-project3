package com.iot.consumer.repository;

import com.iot.consumer.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    Optional<Device> findByDeviceId(String deviceId);

    List<Device> findByStatus(Device.DeviceStatus status);

    @Modifying
    @Query("UPDATE Device d SET d.status = :status WHERE d.lastSeen < :threshold AND d.status = :currentStatus")
    int updateOfflineDevices(Device.DeviceStatus status, LocalDateTime threshold, Device.DeviceStatus currentStatus);

    @Query("SELECT d FROM Device d ORDER BY d.lastSeen DESC")
    List<Device> findAllOrderByLastSeenDesc();
}
