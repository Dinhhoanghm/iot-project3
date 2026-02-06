package com.iot.consumer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings", indexes = {
    @Index(name = "idx_device_timestamp", columnList = "device_id, timestamp DESC")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", referencedColumnName = "id", nullable = false)
    private Device device;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "obstacle")
    private Integer obstacle;

    @Column(name = "vibration")
    private Integer vibration;

    @Column(name = "light")
    private Integer light;

    @Column(name = "buzzer")
    private Integer buzzer;

    @Column(name = "led")
    private Integer led;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
