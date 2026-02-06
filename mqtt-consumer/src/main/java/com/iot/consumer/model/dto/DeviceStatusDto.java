package com.iot.consumer.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DeviceStatusDto {
    private String deviceId;
    private String status;
    private String ip;
    private Integer rssi;
}
