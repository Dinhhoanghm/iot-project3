# IoT Sensor Monitoring System

---

**Thưa thầy, để chạy được chương trình này thì đầu tiên là về WiFi.**
Board ESP8266 chỉ kết nối được WiFi **2.4GHz**, nên WiFi 5GHz sẽ không chạy được. Vì vậy mình cần sử dụng WiFi 2.4GHz. Trong code thì em sẽ thay **tên WiFi và mật khẩu WiFi của thầy** vào phần cấu hình WiFi.

**Tiếp theo là phần MQTT.**
Trong chương trình có sử dụng MQTT để gửi dữ liệu cảm biến, nên em cần thay địa chỉ **IP của máy đang chạy MQTT Broker** vào biến `mqtt_server`. Máy chạy MQTT và ESP8266 phải nằm trong cùng mạng nội bộ thì mới kết nối được.

**Để chạy chương trình thì em sử dụng Arduino IDE.**
Đầu tiên là cài Arduino IDE trên máy tính. Sau đó em phải cài thêm board ESP8266 bằng cách vào phần Preferences và thêm link của ESP8266, rồi cài trong Board Manager. Sau khi cài xong thì em chọn đúng loại board là NodeMCU ESP8266 và chọn đúng cổng COM của thiết bị.

**Sau đó là cài thư viện.**
Trong Arduino IDE, em cài hai thư viện là `ESP8266WiFi` để kết nối WiFi và `PubSubClient` để làm việc với MQTT. Hai thư viện này là bắt buộc để chương trình chạy được.

**Về phần nạp code vào thiết bị.**
Sau khi cấu hình xong WiFi, MQTT, board và thư viện, em kết nối ESP8266 với máy tính bằng cáp USB, mở file code và nhấn Upload để nạp chương trình vào thiết bị.

**Khi chương trình chạy.**
ESP8266 sẽ tự động kết nối WiFi, sau đó kết nối tới MQTT Broker. Thiết bị sẽ gửi dữ liệu cảm biến lên MQTT theo từng topic riêng. Khi có bất kỳ cảm biến nào phát hiện bất thường thì buzzer sẽ kêu để cảnh báo.

---


### Architecture

```
┌─────────────────┐      MQTT       ┌─────────────────┐      HTTP/WS      ┌─────────────────┐
│    ESP8266      │ ──────────────> │  Mosquitto      │ <──────────────── │  Java Consumer  │
│  (C++ Device)   │   Port 1883     │  MQTT Broker    │                   │  (Spring Boot)  │
└─────────────────┘                 └─────────────────┘                   └────────┬────────┘
                                                                                   │
                                                                                   │ REST API
                                                                                   │ WebSocket
                                                                                   ▼
                                    ┌─────────────────┐                   ┌─────────────────┐
                                    │   PostgreSQL    │ <──────────────── │ React Dashboard │
                                    │    Database     │                   │   (Frontend)    │
                                    └─────────────────┘                   └─────────────────┘
```
### Để chạy toàn bộ project thì thầy chỉ cần chạy lệnh này
```bash
docker-compose up -d --build
````

### Sau đó mở Dashboard thầy sẽ thấy các dữ liệu được đổ về

http://localhost:3000

