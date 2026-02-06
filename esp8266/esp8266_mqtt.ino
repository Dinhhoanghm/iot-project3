#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// ========= WIFI =========
const char* ssid = "11111";
const char* password = "04062004";

// ========= MQTT =========
const char* mqtt_server = "10.59.111.133";
const int mqtt_port = 1883;

// ========= PIN CONFIG =========
#define OBSTACLE_PIN   14   // D5
#define TILT_PIN       12   // D6
#define VIBRATION_PIN  13   // D7
#define BUZZER_PIN      5   // D1

// ========= MQTT CLIENT =========
WiFiClient espClient;
PubSubClient mqttClient(espClient);
String deviceId;
String sensorTopic;
String statusTopic;

// ========= TIMING =========
unsigned long lastUpdate = 0;
const unsigned long interval = 100;

unsigned long lastMqttPublish = 0;
const unsigned long mqttInterval = 1000;

// ========= SENSOR STATES =========
int obstacleState = 1;
int tiltState = 1;
int vibrationState = 1;
int buzzerState = 0;

// ========= DEVICE ID =========
String getDeviceId() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char macStr[13];
  sprintf(macStr, "%02X%02X%02X%02X%02X%02X",
          mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return "ESP_" + String(macStr);
}

// ========= WIFI =========
void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

// ========= MQTT =========
void reconnectMqtt() {
  while (!mqttClient.connected()) {
    if (mqttClient.connect(deviceId.c_str())) {

      String statusJson = "{";
      statusJson += "\"deviceId\":\"" + deviceId + "\",";
      statusJson += "\"status\":\"online\",";
      statusJson += "\"ip\":\"" + WiFi.localIP().toString() + "\"";
      statusJson += "}";

      mqttClient.publish(statusTopic.c_str(), statusJson.c_str(), true);
    } else {
      delay(5000);
    }
  }
}

// ========= PUBLISH SENSOR =========
void publishSensorData() {
  String json = "{";
  json += "\"deviceId\":\"" + deviceId + "\",";
  json += "\"timestamp\":" + String(millis()) + ",";
  json += "\"sensors\":{";
  json += "\"obstacle\":" + String(obstacleState) + ",";
  json += "\"vibration\":" + String(vibrationState) + ",";
  json += "\"light\":0" +  String(vibrationState) + ",";
  json += "},";
  json += "\"outputs\":{";
  json += "\"buzzer\":" + String(buzzerState) + ",";
  json += "\"led\":0";
  json += "}";
  json += "}";

  mqttClient.publish(sensorTopic.c_str(), json.c_str());
}

// ========= SETUP =========
void setup() {
  pinMode(OBSTACLE_PIN, INPUT);
  pinMode(TILT_PIN, INPUT);
  pinMode(VIBRATION_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);

  deviceId = getDeviceId();
  sensorTopic = "iot/devices/" + deviceId + "/sensors";
  statusTopic = "iot/devices/" + deviceId + "/status";

  setupWiFi();
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setBufferSize(512);
}

// ========= LOOP =========
void loop() {
  if (!mqttClient.connected()) {
    reconnectMqtt();
  }
  mqttClient.loop();

  if (millis() - lastUpdate >= interval) {
    lastUpdate = millis();

    obstacleState  = digitalRead(OBSTACLE_PIN);
    tiltState      = digitalRead(TILT_PIN);
    vibrationState = digitalRead(VIBRATION_PIN);

    if (obstacleState == LOW ||
        tiltState == LOW ||
        vibrationState == LOW) {
      buzzerState = HIGH;
    } else {
      buzzerState = LOW;
    }

    digitalWrite(BUZZER_PIN, buzzerState);
  }

  if (millis() - lastMqttPublish >= mqttInterval) {
    lastMqttPublish = millis();
    publishSensorData();
  }
}
