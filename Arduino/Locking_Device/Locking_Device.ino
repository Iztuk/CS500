#include <WiFiS3.h>
#include <SPI.h>
#include <PubSubClient.h>
#include "WiFiCred.h"
#define RELAY 3

bool isOn = false;

char ssid[] = Wifi_SSID; // WiFi network name.
char pass[] = Wifi_Password; // WiFi network password.

int status = WL_IDLE_STATUS; // Initializes the WiFi status to idle.

byte mac[6]; // Stores the MAC address of the Arduino.

char broker[] = "10.42.0.1"; // MQTT broker address.
char clientId[] = "LockingDevice"; // Unique client ID.
char topic[] = "isOn"; // MQTT topic.


WiFiClient wifiClient;
PubSubClient client(wifiClient);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  while (!Serial) {
    ; // Waits for the serial monitor to open.
  }

  // Attempt to connect to WiFi.
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WiFi...");
    status = WiFi.begin(ssid, pass);
    delay(5000); // Try to connect every 5 seconds
  }

  // If WiFi connection is successful.
  if (status == WL_CONNECTED) {
    Serial.print("Connected to WiFi.");
    WiFi.macAddress(mac);
    Serial.print("MAC: ");
    for (int i = 0; i < 6; ++i) {
      Serial.print(mac[i], HEX);
      if (i < 5) Serial.print(':');
    }

  }

  Serial.print("Connecting to MQTT broker at: ");
  Serial.println(broker);

  // Connects to MQTT broker.
  client.setServer(broker, 1883); // Sets the MQTT broker address and the port.
  client.setCallback(callback);

  if (client.connect(clientId)) {
    Serial.println("Connected to MQTT broker");
    client.subscribe(topic); // Subscribes to the MQTT topic.
    Serial.println("Subscribed to MQTT topic");
  } else {
    Serial.print("MQTT client failed to connect, state: ");
    Serial.println(client.state());
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Sets the pin number for the relay.
  pinMode(RELAY, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  client.loop(); // Allows the MQTT client to process incoming messages.

  // Code to lock and unlock solenoid lock.
  if (isOn) {
    digitalWrite(RELAY, HIGH);
  } else {
    digitalWrite(RELAY, LOW);
  }
}

void callback(char* receivedTopic, byte* payload, unsigned int length) {
  if (strcmp(receivedTopic, topic) == 0) {
    char message[length + 1];
    memcpy(message, payload, length);
    message[length] = '\0'; // Null-terminates the message

    Serial.println(message);

    if (strcmp(message, "true") == 0) {
      isOn = true;
    } else if (strcmp(message, "false") == 0) {
      isOn = false;
    }
  }
}
