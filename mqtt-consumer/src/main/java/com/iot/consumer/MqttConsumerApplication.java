package com.iot.consumer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MqttConsumerApplication {
    public static void main(String[] args) {
        SpringApplication.run(MqttConsumerApplication.class, args);
    }
}
