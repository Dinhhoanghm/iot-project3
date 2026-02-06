package com.iot.consumer.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SensorDataDto {
    private String deviceId;
    private Long timestamp;
    private Sensors sensors;
    private Outputs outputs;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Sensors {
        private Integer obstacle;
        private Integer vibration;
        private Integer light;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Outputs {
        private Integer buzzer;
        private Integer led;
    }
}
