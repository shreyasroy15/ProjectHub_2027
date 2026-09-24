using System.Text.Json;
using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;

namespace IoTForge.Infrastructure.Ai;

public class RuleBasedEngineeringEngine : IAiProjectGenerator
{
    public string ProviderName => "IoTForge Hardware Synthesis Engine (Deterministic)";

    public Task<StructuredProjectOutput> GenerateProjectAsync(ProjectGenerationRequest request, CancellationToken cancellationToken = default)
    {
        var prompt = request.Prompt.Trim();
        var lower = prompt.ToLowerInvariant();

        var output = new StructuredProjectOutput();

        // Check for ambiguous prompt
        if (prompt.Length < 10)
        {
            output.ClarificationQuestions.Add("What specific sensors would you like to interface with the microcontroller?");
            output.ClarificationQuestions.Add("Which communication protocol do you prefer (Wi-Fi/MQTT, BLE, LoRaWAN, or Cellular LTE)?");
            output.ClarificationQuestions.Add("Will the system be powered from a 5V USB adapter, rechargeable 18650 Li-ion battery, or external 12V DC power?");
        }

        // Determine Domain & Controller
        bool isIrrigation = lower.Contains("irrigat") || lower.Contains("soil") || lower.Contains("plant") || lower.Contains("water pump") || lower.Contains("garden");
        bool isWeather = lower.Contains("weather") || lower.Contains("climate") || lower.Contains("bme280") || lower.Contains("dht22") || lower.Contains("pressure");
        bool isSecurity = lower.Contains("secur") || lower.Contains("alarm") || lower.Contains("pir") || lower.Contains("motion") || lower.Contains("door") || lower.Contains("camera");
        bool isAttendance = lower.Contains("attend") || lower.Contains("rfid") || lower.Contains("rc522") || lower.Contains("badge") || lower.Contains("access control");
        bool isIndustrial = lower.Contains("industr") || lower.Contains("temperature monitor") || lower.Contains("thermocouple") || lower.Contains("max6675") || lower.Contains("modbus");

        string controller = request.PreferredController ?? "ESP32 DevKit V1";
        if (lower.Contains("stm32")) controller = "STM32F103C8T6 Blue Pill";
        else if (lower.Contains("arduino")) controller = "Arduino Uno R3";
        else if (lower.Contains("raspberry pi")) controller = "Raspberry Pi 4 Model B";

        if (isIrrigation)
        {
            BuildIrrigationProject(output, controller, request);
        }
        else if (isWeather)
        {
            BuildWeatherProject(output, controller, request);
        }
        else if (isSecurity)
        {
            BuildSecurityProject(output, controller, request);
        }
        else if (isAttendance)
        {
            BuildAttendanceProject(output, controller, request);
        }
        else
        {
            BuildGenericEngineeringProject(output, controller, prompt, request);
        }

        return Task.FromResult(output);
    }

    public Task<ProjectChatResponse> ChatWithProjectAsync(Project project, string userMessage, CancellationToken cancellationToken = default)
    {
        var lower = userMessage.ToLowerInvariant();
        string reply;

        if (lower.Contains("battery") || lower.Contains("power"))
        {
            reply = $"For the {project.Title}, we recommend a 3.7V 2500mAh 18650 Li-ion cell paired with a TP4056 charging module and a ME6211 low-dropout (LDO) 3.3V regulator to maintain steady power during Wi-Fi transmission bursts.";
        }
        else if (lower.Contains("pin") || lower.Contains("gpio"))
        {
            reply = $"The ESP32 pins are allocated to prevent strapping pin collisions. GPIO21 & GPIO22 are reserved for the hardware I2C bus (SDA/SCL), GPIO34 is used for ADC input (Input-only pin, ideal for analog sensors), and GPIO26 controls the relay module.";
        }
        else if (lower.Contains("mqtt") || lower.Contains("broker") || lower.Contains("cloud"))
        {
            reply = $"The telemetry pipeline uses standard MQTT topics: 'iotforge/{project.Id}/telemetry' for telemetry metrics and 'iotforge/{project.Id}/command' for remote actuator actuation.";
        }
        else
        {
            reply = $"IoTForge engineering assistant: I have reviewed your request regarding '{userMessage}'. The project '{project.Title}' currently specifies {project.Components.Count} hardware components with {project.Connections.Count} pin-to-pin connections. What specific aspect (pinout, code, BOM, or build step) would you like to refine?";
        }

        return Task.FromResult(new ProjectChatResponse(reply, false, null));
    }

    public Task<CodeSpecDto> RegenerateCodeAsync(Project project, string targetStack, string subCategory, CancellationToken cancellationToken = default)
    {
        var code = new CodeSpecDto
        {
            TargetStack = targetStack,
            SubCategory = subCategory,
            FileName = subCategory.ToLowerInvariant().Contains("csharp") || subCategory.ToLowerInvariant().Contains("aspnet") ? "TelemetryController.cs" : "firmware.ino",
            Language = subCategory.ToLowerInvariant().Contains("csharp") || subCategory.ToLowerInvariant().Contains("aspnet") ? "csharp" : "cpp",
            Description = $"Regenerated optimized {subCategory} implementation for {project.Title}."
        };

        if (code.Language == "csharp")
        {
            code.CodeContent = @"using Microsoft.AspNetCore.Mvc;

namespace IoTForge.Backend.Controllers;

[ApiController]
[Route(""api/telemetry"")]
public class TelemetryController : ControllerBase
{
    private readonly ILogger<TelemetryController> _logger;

    public TelemetryController(ILogger<TelemetryController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    public IActionResult RecordTelemetry([FromBody] TelemetryPayload payload)
    {
        _logger.LogInformation(""Received telemetry from Device {DeviceId}: {@Payload}"", payload.DeviceId, payload);
        // Process telemetry, trigger alarms, store in PostgreSQL
        return Ok(new { status = ""success"", timestamp = DateTime.UtcNow });
    }
}

public record TelemetryPayload(
    string DeviceId,
    double SoilMoisturePercent,
    double TemperatureCelsius,
    double HumidityPercent,
    bool PumpActive
);";
        }
        else
        {
            code.CodeContent = @"#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 34
#define RELAY_PIN 26

const char* ssid = ""YOUR_WIFI_SSID"";
const char* password = ""YOUR_WIFI_PASSWORD"";
const char* mqtt_server = ""broker.hivemq.com"";

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Active LOW relay off
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void setup_wifi() {
  delay(10);
  Serial.print(""Connecting to "");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(""."");
  }
  Serial.println(""\nWiFi connected!"");
}

void loop() {
  if (!client.connected()) {
    // Reconnect logic
  }
  client.loop();

  int rawSoil = analogRead(SOIL_PIN);
  float soilPercent = map(rawSoil, 4095, 1500, 0, 100);
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (soilPercent < 30.0) {
    digitalWrite(RELAY_PIN, LOW); // Turn ON pump
  } else if (soilPercent > 65.0) {
    digitalWrite(RELAY_PIN, HIGH); // Turn OFF pump
  }

  delay(5000);
}";
        }

        return Task.FromResult(code);
    }

    private void BuildIrrigationProject(StructuredProjectOutput output, string controller, ProjectGenerationRequest request)
    {
        output.Project = new ProjectMetaDto
        {
            Name = "Smart IoT Irrigation & Soil Monitoring System",
            Description = "An automated, cloud-connected precision irrigation system utilizing ESP32, capacitive soil moisture sensing, environmental telemetry (DHT22), and relay-driven water pump actuation with safety hysteresis.",
            Difficulty = "Intermediate",
            EstimatedCost = 42.50m,
            EstimatedBuildTime = "3-4 hours",
            Controller = controller,
            Connectivity = "Wi-Fi (2.4 GHz) + MQTT",
            PowerSource = "12V 2A DC Power Supply with LM2596 Step-Down Buck Converter (5V)",
            SafetyReviewRequired = false
        };

        output.Requirements = new List<string>
        {
            "Monitor volumetric soil moisture in real-time without probe corrosion using capacitive sensing.",
            "Measure ambient air temperature and relative humidity using DHT22.",
            "Drive a 12V DC submersible water pump via an optocoupler-isolated 5V relay module.",
            "Publish real-time telemetry to MQTT broker every 10 seconds.",
            "Implement hysteresis control algorithm to avoid rapid pump cycling.",
            "Provide manual override control via web application dashboard."
        };

        // Components
        output.Components = new List<ComponentSpecDto>
        {
            new()
            {
                Name = controller,
                Category = "Microcontrollers",
                Description = "32-bit dual-core Xtensa LX6 MCU with integrated Wi-Fi and Bluetooth LE.",
                Quantity = 1,
                EstimatedPrice = 6.50m,
                VerifiedPrice = 6.20m,
                VendorName = "Adafruit",
                PurchaseUrl = "https://www.adafruit.com/product/3269",
                DatasheetUrl = "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf",
                CompatibilityNotes = "Requires 3.3V logic level. Analog input restricted to ADC1 pins when Wi-Fi is active.",
                Specifications = new() { { "Clock", "240 MHz" }, { "Logic", "3.3V" }, { "Flash", "4MB" }, { "RAM", "520 KB" } },
                Pinout = new()
                {
                    new() { Pin = "GPIO34", Function = "ADC1_CH6 (Analog Input)", Voltage = "3.3V", Type = "Analog" },
                    new() { Pin = "GPIO4", Function = "Digital I/O (DHT22)", Voltage = "3.3V", Type = "Digital" },
                    new() { Pin = "GPIO26", Function = "Digital Output (Relay)", Voltage = "3.3V", Type = "Digital" },
                    new() { Pin = "VIN", Function = "Power In", Voltage = "5.0V", Type = "Power" },
                    new() { Pin = "GND", Function = "Ground", Voltage = "0V", Type = "Ground" },
                    new() { Pin = "3V3", Function = "Regulated 3.3V Out", Voltage = "3.3V", Type = "Power" }
                }
            },
            new()
            {
                Name = "Capacitive Soil Moisture Sensor v1.2",
                Category = "Sensors",
                Description = "Corrosion-resistant capacitive moisture sensor operating on frequency oscillation.",
                Quantity = 1,
                EstimatedPrice = 3.20m,
                VerifiedPrice = 2.95m,
                VendorName = "SparkFun",
                PurchaseUrl = "https://www.sparkfun.com/products/17731",
                DatasheetUrl = "https://wiki.dfrobot.com/Capacitive_Soil_Moisture_Sensor_SKU_SEN0193",
                CompatibilityNotes = "Compatible with 3.3V and 5V. Connect to ESP32 ADC1 channel to avoid Wi-Fi ADC2 conflict.",
                Specifications = new() { { "Operating Voltage", "3.3V - 5.5V" }, { "Output", "Analog (0.5V - 3.0V)" } },
                Pinout = new()
                {
                    new() { Pin = "VCC", Function = "Power", Voltage = "3.3V", Type = "Power" },
                    new() { Pin = "GND", Function = "Ground", Voltage = "0V", Type = "Ground" },
                    new() { Pin = "AOUT", Function = "Analog Voltage Out", Voltage = "3.3V", Type = "Analog" }
                }
            },
            new()
            {
                Name = "DHT22 (AM2302) Temperature & Humidity Sensor",
                Category = "Sensors",
                Description = "High-accuracy digital capacitive humidity and thermistor temperature sensor.",
                Quantity = 1,
                EstimatedPrice = 4.80m,
                VerifiedPrice = 4.50m,
                VendorName = "Adafruit",
                PurchaseUrl = "https://www.adafruit.com/product/385",
                DatasheetUrl = "https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf",
                CompatibilityNotes = "Requires a 4.7kΩ or 10kΩ pull-up resistor between VCC and Data pin.",
                Specifications = new() { { "Temp Range", "-40 to 80°C (+-0.5°C)" }, { "Humidity", "0-100% RH (+-2%)" } },
                Pinout = new()
                {
                    new() { Pin = "VCC", Function = "Power", Voltage = "3.3V - 5V", Type = "Power" },
                    new() { Pin = "DATA", Function = "Single-bus Serial Data", Voltage = "3.3V", Type = "Digital" },
                    new() { Pin = "GND", Function = "Ground", Voltage = "0V", Type = "Ground" }
                }
            },
            new()
            {
                Name = "5V 1-Channel Optocoupler Relay Module",
                Category = "Actuators",
                Description = "Isolated relay module rated for 10A 250VAC / 10A 30VDC with status LED and flyback diode.",
                Quantity = 1,
                EstimatedPrice = 2.50m,
                VerifiedPrice = 2.10m,
                VendorName = "DigiKey",
                PurchaseUrl = "https://www.digikey.com",
                DatasheetUrl = "https://components101.com/switches/5v-relay-module-pinout-datasheet",
                CompatibilityNotes = "Active LOW trigger. Optocoupler input draws ~5mA from ESP32 GPIO26.",
                Specifications = new() { { "Coil Voltage", "5V DC" }, { "Switching Capacity", "10A @ 30V DC / 250V AC" } },
                Pinout = new()
                {
                    new() { Pin = "VCC", Function = "Coil Power", Voltage = "5V", Type = "Power" },
                    new() { Pin = "GND", Function = "Ground", Voltage = "0V", Type = "Ground" },
                    new() { Pin = "IN", Function = "Control Signal", Voltage = "3.3V - 5V", Type = "Digital" },
                    new() { Pin = "COM", Function = "Common Terminal", Voltage = "12V", Type = "Power" },
                    new() { Pin = "NO", Function = "Normally Open Terminal", Voltage = "12V", Type = "Power" }
                }
            },
            new()
            {
                Name = "12V DC Submersible Water Pump (5W)",
                Category = "Motors",
                Description = "Low-noise brushless submersible pump with 240L/H flow rate.",
                Quantity = 1,
                EstimatedPrice = 8.90m,
                VerifiedPrice = 7.99m,
                VendorName = "Amazon",
                PurchaseUrl = "https://www.amazon.com",
                DatasheetUrl = "https://datasheetspdf.com",
                CompatibilityNotes = "Cannot be powered directly from microcontroller. Requires 12V external power switched via relay.",
                Specifications = new() { { "Rated Voltage", "12V DC" }, { "Rated Current", "400mA" }, { "Lift", "3 meters" } },
                Pinout = new()
                {
                    new() { Pin = "V+", Function = "Positive 12V", Voltage = "12V", Type = "Power" },
                    new() { Pin = "V-", Function = "Ground Return", Voltage = "0V", Type = "Ground" }
                }
            },
            new()
            {
                Name = "LM2596 DC-DC Step-Down Buck Converter",
                Category = "Power",
                Description = "High-efficiency step-down converter providing stable 5V output from 12V input.",
                Quantity = 1,
                EstimatedPrice = 3.50m,
                VerifiedPrice = 3.00m,
                VendorName = "SparkFun",
                PurchaseUrl = "https://www.sparkfun.com",
                DatasheetUrl = "https://www.ti.com/lit/ds/symlink/lm2596.pdf",
                CompatibilityNotes = "Step-down from 12V input to 5V output for ESP32 VIN and 5V Relay coil.",
                Specifications = new() { { "Input", "4V - 35V" }, { "Output", "1.25V - 30V (Adjusted to 5V)" }, { "Max Current", "3A" } },
                Pinout = new()
                {
                    new() { Pin = "IN+", Function = "12V DC Input", Voltage = "12V", Type = "Power" },
                    new() { Pin = "IN-", Function = "12V Ground Input", Voltage = "0V", Type = "Ground" },
                    new() { Pin = "OUT+", Function = "5V Regulated Output", Voltage = "5V", Type = "Power" },
                    new() { Pin = "OUT-", Function = "Common Ground Output", Voltage = "0V", Type = "Ground" }
                }
            },
            new()
            {
                Name = "12V 2A DC Wall Power Adapter",
                Category = "Power",
                Description = "Regulated 120-240V AC to 12V 2A DC power supply with 5.5x2.1mm DC barrel connector.",
                Quantity = 1,
                EstimatedPrice = 9.50m,
                VerifiedPrice = 8.50m,
                VendorName = "DigiKey",
                PurchaseUrl = "https://www.digikey.com",
                DatasheetUrl = "https://www.digikey.com",
                CompatibilityNotes = "Powers both 12V water pump and LM2596 buck converter.",
                Specifications = new() { { "Input", "100-240V AC" }, { "Output", "12V DC 2000mA" } },
                Pinout = new()
                {
                    new() { Pin = "DC+", Function = "+12V Out", Voltage = "12V", Type = "Power" },
                    new() { Pin = "DC-", Function = "GND Out", Voltage = "0V", Type = "Ground" }
                }
            },
            new()
            {
                Name = "Breadboard, Tubing & Silicone Jumper Wires",
                Category = "Accessories",
                Description = "Includes 400-point solderless breadboard, 1m food-grade silicone tubing, and 40pc jumper wires.",
                Quantity = 1,
                EstimatedPrice = 3.60m,
                VerifiedPrice = 3.20m,
                VendorName = "Adafruit",
                PurchaseUrl = "https://www.adafruit.com",
                DatasheetUrl = "https://www.adafruit.com",
                CompatibilityNotes = "Essential prototyping connections and plumbing.",
                Specifications = new() { { "Wire Gauge", "22 AWG" }, { "Tubing ID", "6mm" } },
                Pinout = new()
            }
        };

        // Connections
        output.Connections = new List<ConnectionSpecDto>
        {
            new() { FromComponent = "LM2596 Buck Converter", FromPin = "OUT+", ToComponent = controller, ToPin = "VIN", Signal = "5V", WireColor = "#EF4444", Voltage = "5V", Description = "5V Power feed to ESP32 onboard regulator" },
            new() { FromComponent = "LM2596 Buck Converter", FromPin = "OUT-", ToComponent = controller, ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Common reference ground connection" },
            new() { FromComponent = controller, FromPin = "3V3", ToComponent = "Capacitive Soil Sensor", ToPin = "VCC", Signal = "3V3", WireColor = "#EF4444", Voltage = "3.3V", Description = "3.3V Sensor clean power rail" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "Capacitive Soil Sensor", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Ground return" },
            new() { FromComponent = "Capacitive Soil Sensor", FromPin = "AOUT", ToComponent = controller, ToPin = "GPIO34", Signal = "ADC", WireColor = "#3B82F6", Voltage = "3.3V", Description = "Analog voltage measurement of moisture level" },
            new() { FromComponent = controller, FromPin = "3V3", ToComponent = "DHT22 Sensor", ToPin = "VCC", Signal = "3V3", WireColor = "#EF4444", Voltage = "3.3V", Description = "DHT22 power supply" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "DHT22 Sensor", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "DHT22 Ground return" },
            new() { FromComponent = "DHT22 Sensor", FromPin = "DATA", ToComponent = controller, ToPin = "GPIO4", Signal = "1-Wire", WireColor = "#10B981", Voltage = "3.3V", Description = "Digital temperature/humidity serial data" },
            new() { FromComponent = "LM2596 Buck Converter", FromPin = "OUT+", ToComponent = "5V Relay Module", ToPin = "VCC", Signal = "5V", WireColor = "#EF4444", Voltage = "5V", Description = "Relay coil 5V supply" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "5V Relay Module", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Relay ground reference" },
            new() { FromComponent = controller, FromPin = "GPIO26", ToComponent = "5V Relay Module", ToPin = "IN", Signal = "GPIO", WireColor = "#8B5CF6", Voltage = "3.3V", Description = "Logic control signal to switch relay" },
            new() { FromComponent = "12V Power Adapter", FromPin = "DC+", ToComponent = "5V Relay Module", ToPin = "COM", Signal = "12V", WireColor = "#F59E0B", Voltage = "12V", Description = "Switched 12V positive supply line" },
            new() { FromComponent = "5V Relay Module", FromPin = "NO", ToComponent = "12V Water Pump", ToPin = "V+", Signal = "12V", WireColor = "#F59E0B", Voltage = "12V", Description = "Relay switched 12V feed to water pump" },
            new() { FromComponent = "12V Power Adapter", FromPin = "DC-", ToComponent = "12V Water Pump", ToPin = "V-", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Pump ground return to 12V adapter" }
        };

        // Architecture
        output.Architecture = new ArchitectureSpecDto
        {
            Nodes = new()
            {
                new() { Id = "sensors", Label = "Capacitive Soil + DHT22", Type = "Sensor", Layer = "Edge", Description = "Moisture, Temp, Humidity sensing", X = 100, Y = 100 },
                new() { Id = "mcu", Label = "ESP32 Controller", Type = "Device", Layer = "Edge", Description = "Real-time edge polling & logic", X = 320, Y = 100 },
                new() { Id = "actuator", Label = "12V Pump via Relay", Type = "Actuator", Layer = "Edge", Description = "Automated irrigation execution", X = 320, Y = 280 },
                new() { Id = "gateway", Label = "Wi-Fi Router (2.4GHz)", Type = "Gateway", Layer = "Gateway", Description = "WPA2 Enterprise / Personal uplink", X = 540, Y = 100 },
                new() { Id = "mqtt", Label = "MQTT Broker (EMQX/Mosquitto)", Type = "Cloud", Layer = "Cloud", Description = "Low-latency telemetry streaming", X = 740, Y = 100 },
                new() { Id = "backend", Label = "ASP.NET Core Web API", Type = "Backend", Layer = "Cloud", Description = "Business logic, auth, telemetry storage", X = 740, Y = 260 },
                new() { Id = "database", Label = "PostgreSQL TimescaleDB", Type = "Database", Layer = "Cloud", Description = "Time-series telemetry archive", X = 960, Y = 260 },
                new() { Id = "frontend", Label = "React Engineering Dashboard", Type = "Frontend", Layer = "Client", Description = "Real-time live telemetry & controls", X = 540, Y = 260 }
            },
            Connections = new()
            {
                new() { From = "sensors", To = "mcu", Protocol = "ADC + 1-Wire", Description = "Analog voltage and digital pulse trains" },
                new() { From = "mcu", To = "actuator", Protocol = "GPIO Active LOW", Description = "Relay coil actuation" },
                new() { From = "mcu", To = "gateway", Protocol = "802.11 b/g/n", Description = "Wi-Fi local network connection" },
                new() { From = "gateway", To = "mqtt", Protocol = "MQTT over TLS (Port 8883)", Description = "Telemetry packet dispatch" },
                new() { From = "mqtt", To = "backend", Protocol = "MQTT Subscribe", Description = "Ingestion daemon consuming metrics" },
                new() { From = "backend", To = "database", Protocol = "TCP (Port 5432) EF Core", Description = "Persisting readings with timestamps" },
                new() { From = "frontend", To = "backend", Protocol = "HTTPS REST + WebSockets", Description = "User dashboard updates and commands" }
            }
        };

        // Infrastructure
        output.Infrastructure = new InfrastructureSpecDto
        {
            Hardware = "ESP32 DevKit V1 (Xtensa dual-core), 12V 2A external DC PSU, LM2596 buck regulator, Optocoupled 5V relay.",
            Network = "802.11 b/g/n 2.4 GHz Wi-Fi, DHCP IP assignment, MQTT QoS 1 telemetry publishing with keep-alive heartbeat.",
            Cloud = "Containerized Docker service deployed on Linux VPS / AWS ECS, NGINX reverse proxy with Let's Encrypt TLS.",
            Backend = "ASP.NET Core 10 Web API, BackgroundService for MQTT ingestion, Serilog structured logging, JWT Authentication.",
            Database = "PostgreSQL 15+ relational database with hypertable indexes on timestamp and device_id.",
            Security = "TLS 1.3 encrypted communications, non-root Docker execution, secret rotation via environment variables.",
            Monitoring = "Health check endpoints (/health), Prometheus metric exporter, Grafana telemetry dashboards.",
            Backups = "Daily automated pg_dump database snapshots stored in S3 compatible object storage with 30-day retention."
        };

        // Firmware Code
        output.Firmware = new List<CodeSpecDto>
        {
            new()
            {
                TargetStack = "Firmware",
                SubCategory = "Arduino",
                FileName = "smart_irrigation.ino",
                Language = "cpp",
                Description = "Complete ESP32 Arduino C++ firmware with WiFi, MQTT telemetry, sensor sampling, and relay hysteresis.",
                CodeContent = @"// IoTForge Automated Firmware Generation
// Project: Smart IoT Irrigation & Soil Monitoring System
// Microcontroller: ESP32 DevKit V1

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// Pin Definitions
#define SOIL_ADC_PIN 34
#define DHT_PIN 4
#define RELAY_PIN 26
#define STATUS_LED 2

#define DHTTYPE DHT22

// Network Configuration
const char* WIFI_SSID = ""YOUR_WIFI_SSID"";
const char* WIFI_PASS = ""YOUR_WIFI_PASSWORD"";
const char* MQTT_BROKER = ""broker.hivemq.com"";
const int MQTT_PORT = 1883;
const char* DEVICE_ID = ""ESP32_IRRIG_01"";

// Telemetry & Control Topics
const char* TOPIC_TELEMETRY = ""iotforge/irrigation/telemetry"";
const char* TOPIC_COMMAND   = ""iotforge/irrigation/command"";

// Soil Calibration Constants (Tune for your probe)
const int AIR_VALUE = 3200;   // In open dry air
const int WATER_VALUE = 1400; // Submerged in pure water

// Control Thresholds (Percentage)
const float MOISTURE_THRESHOLD_LOW = 30.0;  // Turn ON pump
const float MOISTURE_THRESHOLD_HIGH = 65.0; // Turn OFF pump

WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHT_PIN, DHTTYPE);

unsigned long lastSampleTime = 0;
const unsigned long sampleInterval = 10000; // 10 seconds
bool isPumpActive = false;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  
  // Active LOW relay - start in SAFE OFF condition
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(STATUS_LED, LOW);

  dht.begin();
  connectWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);

  Serial.println(F(""[IoTForge] Smart Irrigation System Initialized.""));
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  if (!mqttClient.connected()) {
    reconnectMqtt();
  }
  mqttClient.loop();

  unsigned long currentMillis = millis();
  if (currentMillis - lastSampleTime >= sampleInterval) {
    lastSampleTime = currentMillis;
    sampleAndControl();
  }
}

void sampleAndControl() {
  // Read Analog Soil Moisture with multi-sampling filter
  long sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogRead(SOIL_ADC_PIN);
    delay(5);
  }
  int rawSoil = sum / 16;
  
  // Calculate percentage: 0% (dry) to 100% (saturated)
  float soilPercent = constrain(map(rawSoil, AIR_VALUE, WATER_VALUE, 0, 100), 0, 100);

  // Read Environmental conditions
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println(F(""[Warning] Failed to read from DHT22 sensor!""));
    temperature = 25.0;
    humidity = 50.0;
  }

  // Automatic Hysteresis Actuator Logic
  if (soilPercent < MOISTURE_THRESHOLD_LOW && !isPumpActive) {
    Serial.println(F(""[Action] Soil moisture dry (<30%). Activating water pump.""));
    digitalWrite(RELAY_PIN, LOW); // Active LOW turns ON relay
    digitalWrite(STATUS_LED, HIGH);
    isPumpActive = true;
  } else if (soilPercent >= MOISTURE_THRESHOLD_HIGH && isPumpActive) {
    Serial.println(F(""[Action] Moisture replenished (>65%). Deactivating water pump.""));
    digitalWrite(RELAY_PIN, HIGH); // Active LOW turns OFF relay
    digitalWrite(STATUS_LED, LOW);
    isPumpActive = false;
  }

  // Publish JSON Telemetry Payload
  StaticJsonDocument<256> doc;
  doc[""device_id""] = DEVICE_ID;
  doc[""soil_moisture""] = soilPercent;
  doc[""temperature""] = temperature;
  doc[""humidity""] = humidity;
  doc[""pump_active""] = isPumpActive;
  doc[""raw_adc""] = rawSoil;

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  mqttClient.publish(TOPIC_TELEMETRY, jsonBuffer);
  Serial.printf(""[Telemetry] Soil: %.1f%% | Temp: %.1fC | Hum: %.1f%% | Pump: %s\n"",
                soilPercent, temperature, humidity, isPumpActive ? ""ON"" : ""OFF"");
}

void connectWiFi() {
  Serial.print(F(""Connecting to Wi-Fi""));
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(F("".""));
  }
  Serial.println(F(""\nWiFi Connected. IP: ""));
  Serial.println(WiFi.localIP());
}

void reconnectMqtt() {
  while (!mqttClient.connected()) {
    Serial.print(F(""Attempting MQTT connection...""));
    if (mqttClient.connect(DEVICE_ID)) {
      Serial.println(F(""connected!""));
      mqttClient.subscribe(TOPIC_COMMAND);
    } else {
      Serial.print(F(""failed, rc=""));
      Serial.print(mqttClient.state());
      Serial.println(F("" trying again in 5 seconds""));
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.printf(""Command received on topic [%s]: %s\n"", topic, message.c_str());

  if (message.equalsIgnoreCase(""PUMP_ON"")) {
    digitalWrite(RELAY_PIN, LOW);
    isPumpActive = true;
  } else if (message.equalsIgnoreCase(""PUMP_OFF"")) {
    digitalWrite(RELAY_PIN, HIGH);
    isPumpActive = false;
  }
}"
            },
            new()
            {
                TargetStack = "Firmware",
                SubCategory = "PlatformIO",
                FileName = "platformio.ini",
                Language = "ini",
                Description = "PlatformIO build environment file with dependency resolution.",
                CodeContent = @"[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
    knolleary/PubSubClient @ ^2.8
    adafruit/DHT sensor library @ ^1.4.6
    adafruit/Adafruit Unified Sensor @ ^1.1.14
    bblanchon/ArduinoJson @ ^6.21.3"
            }
        };

        // Backend Code
        output.Backend = new List<CodeSpecDto>
        {
            new()
            {
                TargetStack = "Backend",
                SubCategory = "ASPNET",
                FileName = "TelemetryController.cs",
                Language = "csharp",
                Description = "ASP.NET Core REST API controller for ingesting and querying irrigation telemetry.",
                CodeContent = @"using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IoTForge.Backend.Controllers;

[ApiController]
[Route(""api/telemetry"")]
public class TelemetryController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<TelemetryController> _logger;

    public TelemetryController(AppDbContext db, ILogger<TelemetryController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> IngestTelemetry([FromBody] TelemetryRecordDto dto)
    {
        var record = new TelemetryRecord
        {
            DeviceId = dto.DeviceId,
            SoilMoisture = dto.SoilMoisture,
            Temperature = dto.Temperature,
            Humidity = dto.Humidity,
            PumpActive = dto.PumpActive,
            Timestamp = DateTime.UtcNow
        };

        _db.TelemetryRecords.Add(record);
        await _db.SaveChangesAsync();

        _logger.LogInformation(""Persisted telemetry for device {Device}: Soil={Soil}%"", dto.DeviceId, dto.SoilMoisture);
        return Ok(new { status = ""recorded"", id = record.Id, timestamp = record.Timestamp });
    }

    [HttpGet(""{deviceId}/history"")]
    public async Task<IActionResult> GetDeviceHistory(string deviceId, [FromQuery] int hours = 24)
    {
        var cutoff = DateTime.UtcNow.AddHours(-hours);
        var data = await _db.TelemetryRecords
            .Where(r => r.DeviceId == deviceId && r.Timestamp >= cutoff)
            .OrderByDescending(r => r.Timestamp)
            .Take(500)
            .ToListAsync();

        return Ok(data);
    }
}

public record TelemetryRecordDto(
    string DeviceId,
    float SoilMoisture,
    float Temperature,
    float Humidity,
    bool PumpActive
);

public class TelemetryRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DeviceId { get; set; } = string.Empty;
    public float SoilMoisture { get; set; }
    public float Temperature { get; set; }
    public float Humidity { get; set; }
    public bool PumpActive { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}"
            }
        };

        // Database Code
        output.Database = new CodeSpecDto
        {
            TargetStack = "Database",
            SubCategory = "PostgreSQL",
            FileName = "schema.sql",
            Language = "sql",
            Description = "PostgreSQL relational schema and time-series telemetry table with compound index.",
            CodeContent = @"-- IoTForge Schema Migration
CREATE TABLE IF NOT EXISTS telemetry_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(64) NOT NULL,
    soil_moisture NUMERIC(5,2) NOT NULL,
    temperature NUMERIC(5,2) NOT NULL,
    humidity NUMERIC(5,2) NOT NULL,
    pump_active BOOLEAN NOT NULL DEFAULT FALSE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compound index for rapid device-specific time-range filtering
CREATE INDEX IF NOT EXISTS idx_telemetry_device_time 
ON telemetry_records (device_id, recorded_at DESC);"
        };

        // Build Steps
        output.BuildSteps = new List<BuildStepSpecDto>
        {
            new()
            {
                StepNumber = 1,
                Title = "Prepare Components & Breadboard Workspace",
                Description = "Unpack the ESP32 DevKit, capacitive moisture sensor, DHT22, 5V relay module, LM2596 buck converter, and 12V power supply. Seat the ESP32 across the center divider of the breadboard.",
                RequiredComponents = new() { controller, "Breadboard, Tubing & Silicone Jumper Wires" },
                Warnings = "Ensure no metal tools touch live pins. Disconnect all power supplies before breadboarding.",
                ExpectedResult = "ESP32 firmly mounted with accessible GPIO header pins on both sides of the gutter."
            },
            new()
            {
                StepNumber = 2,
                Title = "Calibrate & Wire LM2596 Buck Converter",
                Description = "Connect 12V DC power to LM2596 IN+ and IN-. Use a digital multimeter on OUT+ and OUT- and adjust the brass potentiometer screw until output reads precisely 5.05V DC. Then connect OUT+ to ESP32 VIN pin and OUT- to ESP32 GND.",
                RequiredComponents = new() { "LM2596 DC-DC Step-Down Buck Converter", "12V 2A DC Wall Power Adapter" },
                Warnings = "CRITICAL: Never connect unadjusted buck converter output to ESP32. Verify 5V output with multimeter first!",
                ExpectedResult = "ESP32 red power LED illuminates steady on regulated 5.0V."
            },
            new()
            {
                StepNumber = 3,
                Title = "Wire Capacitive Soil Moisture Sensor",
                Description = "Connect Sensor VCC to ESP32 3V3 rail, GND to ESP32 GND, and AOUT to ESP32 GPIO34 (ADC1_CH6).",
                RequiredComponents = new() { "Capacitive Soil Moisture Sensor v1.2" },
                Warnings = "Do not submerge electronics above the white indicator line. Use conformal coating or silicone over upper circuit board.",
                ExpectedResult = "Analog ADC readings decrease when probe touches water and increase in dry air."
            },
            new()
            {
                StepNumber = 4,
                Title = "Wire DHT22 Environmental Sensor",
                Description = "Connect DHT22 Pin 1 (VCC) to ESP32 3V3, Pin 4 (GND) to GND, and Pin 2 (DATA) to ESP32 GPIO4. Place a 10kΩ pull-up resistor between VCC and DATA.",
                RequiredComponents = new() { "DHT22 (AM2302) Temperature & Humidity Sensor" },
                Warnings = "Double check polarity; reverse VCC and GND will permanently burn the DHT22 thermistor.",
                ExpectedResult = "Serial monitor outputs ambient temperature (~22-26C) and humidity (~40-60%)."
            },
            new()
            {
                StepNumber = 5,
                Title = "Wire 5V Relay Module & 12V Water Pump",
                Description = "Connect Relay VCC to 5V rail (LM2596 OUT+), GND to Common GND, and IN to ESP32 GPIO26. Wire 12V PSU (+) to Relay COM. Wire Relay NO to 12V Pump (+). Wire 12V Pump (-) directly to 12V PSU (-).",
                RequiredComponents = new() { "5V 1-Channel Optocoupler Relay Module", "12V DC Submersible Water Pump (5W)" },
                Warnings = "Inductive load spike protection: ensure the relay module includes an onboard freewheeling flyback diode.",
                ExpectedResult = "Audible click when GPIO26 goes LOW, turning on the 12V water pump."
            },
            new()
            {
                StepNumber = 6,
                Title = "Flash Firmware & Connect Cloud Broker",
                Description = "Connect micro-USB cable, open Arduino IDE or VS Code PlatformIO, enter your local Wi-Fi credentials, and flash firmware to ESP32. Open 115200 baud Serial Monitor.",
                RequiredComponents = new() { controller },
                Warnings = "Hold 'BOOT' button during upload if the ESP32 fails to enter bootloader mode automatically.",
                ExpectedResult = "Serial monitor displays 'WiFi Connected' and begins streaming telemetry packets to MQTT broker."
            }
        };

        // Testing Checklist
        output.TestingChecklist = new List<TestChecklistSpecDto>
        {
            new() { Category = "Hardware", Title = "ESP32 Power Rail Verification", Description = "Measure 3.3V rail with multimeter to ensure voltage stays within 3.25V - 3.35V.", Status = "Passed" },
            new() { Category = "Sensor", Title = "Soil Sensor Dry vs Wet Delta", Description = "Confirm raw ADC value drops by at least 1000 units between dry air and moist soil.", Status = "Pending" },
            new() { Category = "Sensor", Title = "DHT22 Valid Checksum Response", Description = "Confirm temperature and humidity values update continuously without NaN errors.", Status = "Pending" },
            new() { Category = "Connectivity", Title = "Wi-Fi Association & DHCP Lease", Description = "Confirm ESP32 connects to 2.4 GHz SSID and receives an IP address in under 5 seconds.", Status = "Pending" },
            new() { Category = "Connectivity", Title = "MQTT Broker Telemetry Stream", Description = "Subscribe to 'iotforge/irrigation/telemetry' using MQTT Explorer and inspect incoming JSON.", Status = "Pending" },
            new() { Category = "Hardware", Title = "Relay Switching & Pump Cutoff", Description = "Verify pump activates below 30% moisture and cuts off cleanly above 65% moisture.", Status = "Pending" },
            new() { Category = "Security", Title = "Fail-Safe Default State on Boot", Description = "Verify pump remains de-energized during ESP32 power-on and reboot sequences.", Status = "Passed" }
        };

        // Safety Warnings
        output.SafetyWarnings = new List<SafetyWarningDto>
        {
            new()
            {
                Severity = "Medium",
                Title = "Liquid Immersion Safety & Conformal Coating",
                Warning = "Water contact with upper sensor circuitry or breadboard will cause short circuits and false readings.",
                Remedy = "Keep microcontroller and power modules in an IP65 rated waterproof enclosure. Only immerse lower probe prongs."
            },
            new()
            {
                Severity = "High",
                Title = "Inductive Kickback Protection",
                Warning = "Directly connecting the 12V pump to a GPIO pin will destroy the ESP32 microcontroller instantly due to high current and back-EMF voltage spikes.",
                Remedy = "Always route motor power through an opto-isolated relay or MOSFET driver with flyback diode protection as pre-configured in this blueprint."
            }
        };
    }

    private void BuildWeatherProject(StructuredProjectOutput output, string controller, ProjectGenerationRequest request)
    {
        output.Project = new ProjectMetaDto
        {
            Name = "Precision IoT Weather Station & Environmental Telemetry",
            Description = "Solar-compatible microclimate weather station monitoring barometric pressure, altitude, ambient temperature, relative humidity, and light intensity with OLED display.",
            Difficulty = "Beginner",
            EstimatedCost = 34.00m,
            EstimatedBuildTime = "2-3 hours",
            Controller = controller,
            Connectivity = "Wi-Fi (802.11 b/g/n) + HTTP REST",
            PowerSource = "3.7V LiPo Battery with TP4056 Solar Charger or 5V USB",
            SafetyReviewRequired = false
        };

        output.Requirements = new List<string>
        {
            "Acquire precise barometric pressure (hPa) and calculate altitude using Bosch BME280 sensor.",
            "Display live metrics locally on 0.96 inch I2C OLED display.",
            "Transmit environmental telemetry to REST API endpoint every 60 seconds.",
            "Implement deep sleep mode to conserve battery power in remote deployments."
        };

        output.Components = new List<ComponentSpecDto>
        {
            new()
            {
                Name = controller,
                Category = "Microcontrollers",
                Description = "Dual-core Wi-Fi/BLE microcontroller.",
                Quantity = 1,
                EstimatedPrice = 6.50m,
                VendorName = "Adafruit",
                PurchaseUrl = "https://www.adafruit.com",
                Pinout = new()
                {
                    new() { Pin = "GPIO21", Function = "I2C SDA (Data)", Voltage = "3.3V", Type = "I2C" },
                    new() { Pin = "GPIO22", Function = "I2C SCL (Clock)", Voltage = "3.3V", Type = "I2C" },
                    new() { Pin = "3V3", Function = "3.3V Out", Voltage = "3.3V", Type = "Power" },
                    new() { Pin = "GND", Function = "Ground", Voltage = "0V", Type = "Ground" }
                }
            },
            new()
            {
                Name = "BME280 Atmospheric Sensor (I2C)",
                Category = "Sensors",
                Description = "High precision pressure, humidity, and temperature sensor.",
                Quantity = 1,
                EstimatedPrice = 7.50m,
                VendorName = "SparkFun",
                PurchaseUrl = "https://www.sparkfun.com",
                Pinout = new()
                {
                    new() { Pin = "VCC", Function = "Power", Voltage = "3.3V", Type = "Power" },
                    new() { Pin = "GND", Function = "Ground", Voltage = "0V", Type = "Ground" },
                    new() { Pin = "SCL", Function = "Clock", Voltage = "3.3V", Type = "I2C" },
                    new() { Pin = "SDA", Function = "Data", Voltage = "3.3V", Type = "I2C" }
                }
            },
            new()
            {
                Name = "0.96\" I2C OLED Display (SSD1306)",
                Category = "Displays",
                Description = "128x64 monochrome graphical OLED display sharing the I2C bus.",
                Quantity = 1,
                EstimatedPrice = 5.20m,
                VendorName = "Adafruit",
                PurchaseUrl = "https://www.adafruit.com",
                Pinout = new()
                {
                    new() { Pin = "VCC", Function = "Power", Voltage = "3.3V", Type = "Power" },
                    new() { Pin = "GND", Function = "Ground", Voltage = "0V", Type = "Ground" },
                    new() { Pin = "SCL", Function = "Clock", Voltage = "3.3V", Type = "I2C" },
                    new() { Pin = "SDA", Function = "Data", Voltage = "3.3V", Type = "I2C" }
                }
            }
        };

        output.Connections = new List<ConnectionSpecDto>
        {
            new() { FromComponent = controller, FromPin = "3V3", ToComponent = "BME280 Atmospheric Sensor", ToPin = "VCC", Signal = "3V3", WireColor = "#EF4444", Voltage = "3.3V", Description = "3.3V power to sensor" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "BME280 Atmospheric Sensor", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Ground" },
            new() { FromComponent = controller, FromPin = "GPIO21", ToComponent = "BME280 Atmospheric Sensor", ToPin = "SDA", Signal = "I2C SDA", WireColor = "#10B981", Voltage = "3.3V", Description = "Shared I2C Data line" },
            new() { FromComponent = controller, FromPin = "GPIO22", ToComponent = "BME280 Atmospheric Sensor", ToPin = "SCL", Signal = "I2C SCL", WireColor = "#F59E0B", Voltage = "3.3V", Description = "Shared I2C Clock line" },
            new() { FromComponent = controller, FromPin = "3V3", ToComponent = "0.96\" I2C OLED Display", ToPin = "VCC", Signal = "3V3", WireColor = "#EF4444", Voltage = "3.3V", Description = "3.3V power to OLED" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "0.96\" I2C OLED Display", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Ground" },
            new() { FromComponent = controller, FromPin = "GPIO21", ToComponent = "0.96\" I2C OLED Display", ToPin = "SDA", Signal = "I2C SDA", WireColor = "#10B981", Voltage = "3.3V", Description = "Shared I2C Data line" },
            new() { FromComponent = controller, FromPin = "GPIO22", ToComponent = "0.96\" I2C OLED Display", ToPin = "SCL", Signal = "I2C SCL", WireColor = "#F59E0B", Voltage = "3.3V", Description = "Shared I2C Clock line" }
        };

        PopulateCommonArchitectureAndCode(output, "Weather Station");
    }

    private void BuildSecurityProject(StructuredProjectOutput output, string controller, ProjectGenerationRequest request)
    {
        output.Project = new ProjectMetaDto
        {
            Name = "Smart IoT Home Intrusion & Security Sentinel",
            Description = "Multi-sensor security monitor featuring PIR infrared motion detection, reed door switches, piezoceramic alarm siren, and instant push notification webhooks.",
            Difficulty = "Intermediate",
            EstimatedCost = 38.00m,
            EstimatedBuildTime = "3 hours",
            Controller = controller,
            Connectivity = "Wi-Fi + HTTPS Webhook",
            PowerSource = "5V 2A USB Wall Adapter",
            SafetyReviewRequired = false
        };

        output.Requirements = new List<string>
        {
            "Detect unauthorized human presence with HC-SR501 passive infrared motion sensor.",
            "Monitor perimeter door/window closure status using magnetic dry-contact reed switches.",
            "Sound high-decibel piezo alert when intrusion is detected in armed mode.",
            "Dispatch encrypted alert packet to cloud notification webhook."
        };

        output.Components = new List<ComponentSpecDto>
        {
            new() { Name = controller, Category = "Microcontrollers", Description = "ESP32 Controller", Quantity = 1, EstimatedPrice = 6.50m, VendorName = "Adafruit", PurchaseUrl = "https://www.adafruit.com" },
            new() { Name = "HC-SR501 PIR Motion Detector", Category = "Sensors", Description = "Pyroelectric infrared motion detector with adjustable sensitivity.", Quantity = 1, EstimatedPrice = 2.80m, VendorName = "SparkFun", PurchaseUrl = "https://www.sparkfun.com" },
            new() { Name = "Active Piezo Buzzer Module", Category = "Actuators", Description = "90dB 5V audible alarm.", Quantity = 1, EstimatedPrice = 1.90m, VendorName = "Adafruit", PurchaseUrl = "https://www.adafruit.com" },
            new() { Name = "Magnetic Reed Door Switch", Category = "Sensors", Description = "Normally closed magnetic contact sensor for door frames.", Quantity = 2, EstimatedPrice = 3.50m, VendorName = "DigiKey", PurchaseUrl = "https://www.digikey.com" }
        };

        output.Connections = new List<ConnectionSpecDto>
        {
            new() { FromComponent = controller, FromPin = "5V", ToComponent = "HC-SR501 PIR", ToPin = "VCC", Signal = "5V", WireColor = "#EF4444", Voltage = "5V", Description = "PIR 5V Supply" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "HC-SR501 PIR", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Ground" },
            new() { FromComponent = "HC-SR501 PIR", FromPin = "OUT", ToComponent = controller, ToPin = "GPIO13", Signal = "GPIO", WireColor = "#3B82F6", Voltage = "3.3V", Description = "Motion trigger interrupt" },
            new() { FromComponent = controller, FromPin = "GPIO14", ToComponent = "Active Piezo Buzzer", ToPin = "V+", Signal = "GPIO", WireColor = "#8B5CF6", Voltage = "3.3V", Description = "Audible alarm driver" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "Active Piezo Buzzer", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Ground" }
        };

        PopulateCommonArchitectureAndCode(output, "Security System");
    }

    private void BuildAttendanceProject(StructuredProjectOutput output, string controller, ProjectGenerationRequest request)
    {
        output.Project = new ProjectMetaDto
        {
            Name = "Contactless RFID Attendance & Access Gate",
            Description = "NFC/RFID 13.56 MHz contact-less reader with dual-status RGB LEDs, local buzzer feedback, and secure server badge verification.",
            Difficulty = "Intermediate",
            EstimatedCost = 31.00m,
            EstimatedBuildTime = "2-3 hours",
            Controller = controller,
            Connectivity = "Wi-Fi + REST API",
            PowerSource = "5V USB",
            SafetyReviewRequired = false
        };

        output.Requirements = new List<string>
        {
            "Scan 13.56MHz MIFARE RFID smart cards using SPI RC522 module.",
            "Verify badge UID against PostgreSQL backend employee database in under 200ms.",
            "Provide instant green/red LED and audio feedback upon scan.",
            "Log timestamped check-in events."
        };

        output.Components = new List<ComponentSpecDto>
        {
            new() { Name = controller, Category = "Microcontrollers", Description = "ESP32 Controller", Quantity = 1, EstimatedPrice = 6.50m, VendorName = "Adafruit", PurchaseUrl = "https://www.adafruit.com" },
            new() { Name = "RC522 13.56MHz RFID Module", Category = "Sensors", Description = "SPI high-frequency card reader with antenna.", Quantity = 1, EstimatedPrice = 4.20m, VendorName = "SparkFun", PurchaseUrl = "https://www.sparkfun.com" },
            new() { Name = "Bicolor Status LED (Red/Green)", Category = "Actuators", Description = "Visual pass/fail indicator.", Quantity = 1, EstimatedPrice = 0.80m, VendorName = "DigiKey", PurchaseUrl = "https://www.digikey.com" }
        };

        output.Connections = new List<ConnectionSpecDto>
        {
            new() { FromComponent = controller, FromPin = "3V3", ToComponent = "RC522 RFID", ToPin = "3.3V", Signal = "3V3", WireColor = "#EF4444", Voltage = "3.3V", Description = "3.3V clean power" },
            new() { FromComponent = controller, FromPin = "GND", ToComponent = "RC522 RFID", ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Ground" },
            new() { FromComponent = controller, FromPin = "GPIO18", ToComponent = "RC522 RFID", ToPin = "SCK", Signal = "SPI SCK", WireColor = "#F59E0B", Voltage = "3.3V", Description = "SPI Clock" },
            new() { FromComponent = controller, FromPin = "GPIO19", ToComponent = "RC522 RFID", ToPin = "MISO", Signal = "SPI MISO", WireColor = "#10B981", Voltage = "3.3V", Description = "SPI Master In Slave Out" },
            new() { FromComponent = controller, FromPin = "GPIO23", ToComponent = "RC522 RFID", ToPin = "MOSI", Signal = "SPI MOSI", WireColor = "#3B82F6", Voltage = "3.3V", Description = "SPI Master Out Slave In" },
            new() { FromComponent = controller, FromPin = "GPIO5", ToComponent = "RC522 RFID", ToPin = "SDA (SS)", Signal = "SPI CS", WireColor = "#8B5CF6", Voltage = "3.3V", Description = "SPI Slave Select" }
        };

        PopulateCommonArchitectureAndCode(output, "RFID Attendance");
    }

    private void BuildGenericEngineeringProject(StructuredProjectOutput output, string controller, string prompt, ProjectGenerationRequest request)
    {
        output.Project = new ProjectMetaDto
        {
            Name = char.ToUpper(prompt[0]) + prompt.Substring(1),
            Description = $"Custom engineered IoT project synthesized for: '{prompt}'. Designed with {controller}, industrial grade telemetry, edge validation, and secure cloud orchestration.",
            Difficulty = "Intermediate",
            EstimatedCost = 45.00m,
            EstimatedBuildTime = "3-4 hours",
            Controller = controller,
            Connectivity = "Wi-Fi (802.11 b/g/n) + MQTT/REST",
            PowerSource = "5V 2A Regulated Power Supply",
            SafetyReviewRequired = prompt.ToLowerInvariant().Contains("motor") || prompt.ToLowerInvariant().Contains("high voltage")
        };

        output.Requirements = new List<string>
        {
            $"Acquire real-time sensor metrics based on: {prompt}.",
            $"Process telemetry at the edge using {controller} microcontroller.",
            "Establish bi-directional communication with ASP.NET Core cloud backend.",
            "Provide safety-reviewed circuit wiring and bill of materials."
        };

        output.Components = new List<ComponentSpecDto>
        {
            new() { Name = controller, Category = "Microcontrollers", Description = "Main computing unit", Quantity = 1, EstimatedPrice = 7.00m, VendorName = "Adafruit", PurchaseUrl = "https://www.adafruit.com" },
            new() { Name = "Environmental Sensor Module", Category = "Sensors", Description = "Telemetry acquisition probe", Quantity = 1, EstimatedPrice = 5.50m, VendorName = "SparkFun", PurchaseUrl = "https://www.sparkfun.com" },
            new() { Name = "Power Conditioning Unit (5V/3.3V)", Category = "Power", Description = "Stable regulated power rails", Quantity = 1, EstimatedPrice = 4.00m, VendorName = "DigiKey", PurchaseUrl = "https://www.digikey.com" }
        };

        output.Connections = new List<ConnectionSpecDto>
        {
            new() { FromComponent = "Power Conditioning Unit", FromPin = "3V3", ToComponent = controller, ToPin = "3V3", Signal = "3.3V", WireColor = "#EF4444", Voltage = "3.3V", Description = "Regulated 3.3V VCC" },
            new() { FromComponent = "Power Conditioning Unit", FromPin = "GND", ToComponent = controller, ToPin = "GND", Signal = "GND", WireColor = "#111827", Voltage = "0V", Description = "Common ground" },
            new() { FromComponent = "Environmental Sensor Module", FromPin = "OUT", ToComponent = controller, ToPin = "GPIO4", Signal = "Data", WireColor = "#3B82F6", Voltage = "3.3V", Description = "Signal bus" }
        };

        PopulateCommonArchitectureAndCode(output, "Custom IoT System");
    }

    private void PopulateCommonArchitectureAndCode(StructuredProjectOutput output, string systemName)
    {
        output.Architecture = new ArchitectureSpecDto
        {
            Nodes = new()
            {
                new() { Id = "nodes-sensor", Label = "Sensor Cluster", Type = "Sensor", Layer = "Edge", Description = "Physical signal acquisition", X = 100, Y = 100 },
                new() { Id = "nodes-mcu", Label = output.Project.Controller, Type = "Device", Layer = "Edge", Description = "Edge processing and digitization", X = 320, Y = 100 },
                new() { Id = "nodes-net", Label = "Wi-Fi / Gateway", Type = "Gateway", Layer = "Gateway", Description = "Transport layer link", X = 540, Y = 100 },
                new() { Id = "nodes-api", Label = "ASP.NET Core Web API", Type = "Backend", Layer = "Cloud", Description = "Business logic, validation, authentication", X = 740, Y = 100 },
                new() { Id = "nodes-db", Label = "PostgreSQL Database", Type = "Database", Layer = "Cloud", Description = "Persistent storage", X = 960, Y = 100 },
                new() { Id = "nodes-ui", Label = "React Engineering Dashboard", Type = "Frontend", Layer = "Client", Description = "Operator UI and controls", X = 740, Y = 250 }
            },
            Connections = new()
            {
                new() { From = "nodes-sensor", To = "nodes-mcu", Protocol = "SPI / I2C / GPIO", Description = "Raw sensor signals" },
                new() { From = "nodes-mcu", To = "nodes-net", Protocol = "802.11 b/g/n", Description = "Local wireless packet transmission" },
                new() { From = "nodes-net", To = "nodes-api", Protocol = "HTTPS / MQTT TLS", Description = "Secure WAN packet delivery" },
                new() { From = "nodes-api", To = "nodes-db", Protocol = "Npgsql EF Core", Description = "Structured SQL telemetry storage" },
                new() { From = "nodes-ui", To = "nodes-api", Protocol = "REST + JSON", Description = "Dashboard query and command dispatch" }
            }
        };

        output.Infrastructure = new InfrastructureSpecDto
        {
            Hardware = $"{output.Project.Controller}, high-gain PCB antenna, filtered power supply.",
            Network = "2.4 GHz Wi-Fi, TLS 1.3 encrypted transport.",
            Cloud = "Docker containers on Linux host with automated restart policies.",
            Backend = "ASP.NET Core Web API with Serilog logging and JWT authentication.",
            Database = "PostgreSQL 15 with indexed foreign keys and timestamps.",
            Security = "Role-based authorization, rate limiting, and encrypted environment secrets.",
            Monitoring = "System health check endpoints and performance logging.",
            Backups = "Automated daily SQL dumps."
        };

        output.Firmware = new List<CodeSpecDto>
        {
            new()
            {
                TargetStack = "Firmware",
                SubCategory = "Arduino",
                FileName = "main.cpp",
                Language = "cpp",
                Description = $"Industrial-grade edge firmware for {systemName}.",
                CodeContent = @"#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = ""YOUR_SSID"";
const char* password = ""YOUR_PASS"";
const char* serverUrl = ""https://api.iotforge.io/api/telemetry"";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(""."");
  }
  Serial.println(""\nConnected to WiFi!"");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader(""Content-Type"", ""application/json"");
    String payload = ""{\""deviceId\"":\""DEV_01\"",\""status\"":\""OK\""}"";
    int httpResponseCode = http.POST(payload);
    Serial.printf(""HTTP Response: %d\n"", httpResponseCode);
    http.end();
  }
  delay(15000);
}"
            }
        };

        output.Backend = new List<CodeSpecDto>
        {
            new()
            {
                TargetStack = "Backend",
                SubCategory = "ASPNET",
                FileName = "TelemetryController.cs",
                Language = "csharp",
                Description = "ASP.NET Core controller.",
                CodeContent = @"using Microsoft.AspNetCore.Mvc;

namespace IoTForge.Backend.Controllers;

[ApiController]
[Route(""api/telemetry"")]
public class TelemetryController : ControllerBase
{
    [HttpPost]
    public IActionResult Ingest([FromBody] object data)
    {
        return Ok(new { status = ""received"", time = DateTime.UtcNow });
    }
}"
            }
        };

        output.Database = new CodeSpecDto
        {
            TargetStack = "Database",
            SubCategory = "PostgreSQL",
            FileName = "schema.sql",
            Language = "sql",
            Description = "Relational SQL table definition.",
            CodeContent = @"CREATE TABLE IF NOT EXISTS telemetry_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);"
        };

        output.BuildSteps = new List<BuildStepSpecDto>
        {
            new() { StepNumber = 1, Title = "Component Inspection", Description = "Verify component pinouts and ratings.", ExpectedResult = "All components verified undamaged." },
            new() { StepNumber = 2, Title = "Breadboard Assembly", Description = "Wire circuit on breadboard according to pinout chart.", ExpectedResult = "Circuit fully wired without loose pins." },
            new() { StepNumber = 3, Title = "Firmware Deployment", Description = "Compile and upload code using USB serial port.", ExpectedResult = "Microcontroller boots and serial output confirms operation." }
        };

        output.TestingChecklist = new List<TestChecklistSpecDto>
        {
            new() { Category = "Hardware", Title = "Power Rail Stability", Description = "Verify 3.3V output rail voltage.", Status = "Passed" },
            new() { Category = "Connectivity", Title = "Wi-Fi Association", Description = "Verify router handshake and DHCP lease.", Status = "Pending" },
            new() { Category = "Backend", Title = "API Ingestion Test", Description = "Verify HTTP 200 response on telemetry endpoint.", Status = "Pending" }
        };

        output.SafetyWarnings = new List<SafetyWarningDto>
        {
            new() { Severity = "Low", Title = "ESD Handling", Warning = "CMOS sensors are sensitive to static electricity.", Remedy = "Discharge static before handling bare boards." }
        };
    }
}
