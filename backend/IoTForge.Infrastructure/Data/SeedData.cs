using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;
using IoTForge.Infrastructure.Auth;

namespace IoTForge.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IoTForgeDbContext db)
    {
        // 1. Seed Users if not present
        if (!db.Users.Any())
        {
            var admin = new User
            {
                Name = "System Administrator",
                Email = "admin@iotforge.io",
                PasswordHash = PasswordHasher.HashPassword("AdminPassword123!"),
                Role = UserRole.Admin,
                ExperienceLevel = ExperienceLevel.Advanced,
                IsActive = true
            };

            var user = new User
            {
                Name = "Senior IoT Engineer",
                Email = "engineer@iotforge.io",
                PasswordHash = PasswordHasher.HashPassword("Password123!"),
                Role = UserRole.User,
                ExperienceLevel = ExperienceLevel.Intermediate,
                IsActive = true
            };

            db.Users.AddRange(admin, user);
            await db.SaveChangesAsync();
        }

        // 2. Seed Vendors
        if (!db.Vendors.Any())
        {
            var vendors = new List<Vendor>
            {
                new() { Name = "Adafruit", Website = "https://www.adafruit.com", LogoUrl = "https://cdn-shop.adafruit.com/static/adafruit_logo.png" },
                new() { Name = "SparkFun Electronics", Website = "https://www.sparkfun.com", LogoUrl = "https://cdn.sparkfun.com/assets/sparkfun-logo.png" },
                new() { Name = "Mouser Electronics", Website = "https://www.mouser.com", LogoUrl = "https://www.mouser.com/images/mouser_logo.png" },
                new() { Name = "DigiKey", Website = "https://www.digikey.com", LogoUrl = "https://www.digikey.com/resources/images/digikey-logo.png" },
                new() { Name = "Amazon Electronics", Website = "https://www.amazon.com", LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
                new() { Name = "DFRobot", Website = "https://www.dfrobot.com", LogoUrl = "https://www.dfrobot.com/image/data/logo.png" },
                new() { Name = "Seeed Studio", Website = "https://www.seeedstudio.com", LogoUrl = "https://www.seeedstudio.com/static/img/logo.png" }
            };
            db.Vendors.AddRange(vendors);
            await db.SaveChangesAsync();
        }

        // 3. Seed Master Components & Verified Purchase Links
        if (!db.Components.Any())
        {
            var adafruit = db.Vendors.FirstOrDefault(v => v.Name == "Adafruit");
            var sparkfun = db.Vendors.FirstOrDefault(v => v.Name.Contains("SparkFun"));
            var digikey = db.Vendors.FirstOrDefault(v => v.Name == "DigiKey");

            var esp32 = new Component
            {
                Name = "ESP32 DevKit V1",
                Category = ComponentCategory.Microcontrollers,
                Description = "32-bit Dual Core 240MHz MCU with 2.4GHz Wi-Fi, BLE 4.2, 520KB SRAM, 4MB Flash.",
                ImageUrl = "https://m.media-amazon.com/images/I/61gXQ7x1yKL._SL1200_.jpg",
                EstimatedPrice = 6.50m,
                SpecificationsJson = "{\"Clock\":\"240MHz\",\"Cores\":2,\"Flash\":\"4MB\",\"SRAM\":\"520KB\",\"OperatingVoltage\":\"3.3V\",\"InputVoltage\":\"5V USB/VIN\"}",
                PinoutJson = "[{\"pin\":\"GPIO21\",\"function\":\"SDA\",\"voltage\":\"3.3V\"},{\"pin\":\"GPIO22\",\"function\":\"SCL\",\"voltage\":\"3.3V\"},{\"pin\":\"GPIO34\",\"function\":\"ADC1\",\"voltage\":\"3.3V\"},{\"pin\":\"GPIO26\",\"function\":\"DAC/GPIO\",\"voltage\":\"3.3V\"}]",
                DatasheetUrl = "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf",
                CompatibilityNotes = "3.3V logic level. ADC2 cannot be used when Wi-Fi is transmitting."
            };

            var soilSensor = new Component
            {
                Name = "Capacitive Soil Moisture Sensor v1.2",
                Category = ComponentCategory.Sensors,
                Description = "Corrosion-resistant capacitive moisture probe with analog voltage output (0.5V to 3.0V).",
                ImageUrl = "https://m.media-amazon.com/images/I/61bC3t-v5CL._SL1500_.jpg",
                EstimatedPrice = 3.20m,
                SpecificationsJson = "{\"OperatingVoltage\":\"3.3V - 5.5V\",\"Output\":\"Analog (0.5V-3.0V)\",\"OperatingCurrent\":\"5mA\"}",
                PinoutJson = "[{\"pin\":\"VCC\",\"function\":\"Power (3.3V-5V)\",\"voltage\":\"3.3V\"},{\"pin\":\"GND\",\"function\":\"Ground\",\"voltage\":\"0V\"},{\"pin\":\"AOUT\",\"function\":\"Analog Output\",\"voltage\":\"3.3V\"}]",
                DatasheetUrl = "https://wiki.dfrobot.com/Capacitive_Soil_Moisture_Sensor_SKU_SEN0193",
                CompatibilityNotes = "Requires analog ADC input. Do not submerge circuitry past the white line."
            };

            var dht22 = new Component
            {
                Name = "DHT22 (AM2302) Temp & Humidity Sensor",
                Category = ComponentCategory.Sensors,
                Description = "High precision capacitive relative humidity and temperature sensor with single-bus digital output.",
                ImageUrl = "https://m.media-amazon.com/images/I/61oP1G-1z2L._SL1000_.jpg",
                EstimatedPrice = 4.80m,
                SpecificationsJson = "{\"TempRange\":\"-40 to 80C (+-0.5C)\",\"HumidityRange\":\"0-100% RH (+-2%)\",\"SamplingRate\":\"0.5Hz\"}",
                PinoutJson = "[{\"pin\":\"VCC\",\"function\":\"Power 3.3V-5V\",\"voltage\":\"3.3V\"},{\"pin\":\"DATA\",\"function\":\"Serial 1-Wire Data\",\"voltage\":\"3.3V\"},{\"pin\":\"GND\",\"function\":\"Ground\",\"voltage\":\"0V\"}]",
                DatasheetUrl = "https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf",
                CompatibilityNotes = "Requires 4.7k-10k pull-up resistor between VCC and DATA."
            };

            var relay = new Component
            {
                Name = "5V 1-Channel Optocoupler Relay Module",
                Category = ComponentCategory.Actuators,
                Description = "Opto-isolated relay rated for 10A 250VAC or 10A 30VDC with onboard status LED and flyback diode.",
                ImageUrl = "https://m.media-amazon.com/images/I/51wUv7Vb-zL._SL1000_.jpg",
                EstimatedPrice = 2.50m,
                SpecificationsJson = "{\"CoilVoltage\":\"5V DC\",\"TriggerCurrent\":\"5mA\",\"MaxSwitchingVoltage\":\"250V AC / 30V DC\",\"MaxCurrent\":\"10A\"}",
                PinoutJson = "[{\"pin\":\"VCC\",\"function\":\"Coil 5V\",\"voltage\":\"5V\"},{\"pin\":\"GND\",\"function\":\"Ground\",\"voltage\":\"0V\"},{\"pin\":\"IN\",\"function\":\"Trigger (Active LOW)\",\"voltage\":\"3.3V\"},{\"pin\":\"COM\",\"function\":\"Common Terminal\",\"voltage\":\"Variable\"},{\"pin\":\"NO\",\"function\":\"Normally Open Terminal\",\"voltage\":\"Variable\"}]",
                DatasheetUrl = "https://components101.com/switches/5v-relay-module-pinout-datasheet",
                CompatibilityNotes = "Active LOW trigger. Connect coil VCC to 5V rail, not to 3.3V output."
            };

            var pump = new Component
            {
                Name = "12V Submersible DC Water Pump (5W)",
                Category = ComponentCategory.Motors,
                Description = "Brushless submersible water pump with 240 L/H flow rate and 3m lift height.",
                ImageUrl = "https://m.media-amazon.com/images/I/61b7U+Fz5yL._SL1000_.jpg",
                EstimatedPrice = 8.90m,
                SpecificationsJson = "{\"RatedVoltage\":\"12V DC\",\"RatedCurrent\":\"400mA\",\"FlowRate\":\"240 L/H\",\"Lift\":\"3m\"}",
                PinoutJson = "[{\"pin\":\"V+\",\"function\":\"+12V DC Positive\",\"voltage\":\"12V\"},{\"pin\":\"V-\",\"function\":\"Ground Negative\",\"voltage\":\"0V\"}]",
                DatasheetUrl = "https://datasheetspdf.com",
                CompatibilityNotes = "Requires dedicated 12V power switched via relay or MOSFET. Cannot be driven by MCU GPIO directly."
            };

            var bme280 = new Component
            {
                Name = "BME280 Atmospheric Pressure & Weather Sensor",
                Category = ComponentCategory.Sensors,
                Description = "Combined barometric pressure, temperature, and relative humidity sensor with I2C/SPI interface.",
                ImageUrl = "https://m.media-amazon.com/images/I/61y8x7d6aML._SL1000_.jpg",
                EstimatedPrice = 7.50m,
                SpecificationsJson = "{\"Pressure\":\"300 to 1100 hPa (+-1 hPa)\",\"Temp\":\"-40 to 85C\",\"OperatingVoltage\":\"1.8V - 3.6V\"}",
                PinoutJson = "[{\"pin\":\"VCC\",\"function\":\"3.3V Power\",\"voltage\":\"3.3V\"},{\"pin\":\"GND\",\"function\":\"Ground\",\"voltage\":\"0V\"},{\"pin\":\"SCL\",\"function\":\"I2C Clock\",\"voltage\":\"3.3V\"},{\"pin\":\"SDA\",\"function\":\"I2C Data\",\"voltage\":\"3.3V\"}]",
                DatasheetUrl = "https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf",
                CompatibilityNotes = "Default I2C address 0x76 or 0x77. Connect only to 3.3V."
            };

            var oled = new Component
            {
                Name = "0.96\" I2C OLED Display (128x64)",
                Category = ComponentCategory.Displays,
                Description = "Monochrome blue/white graphic display module with SSD1306 controller.",
                ImageUrl = "https://m.media-amazon.com/images/I/61W2W7d-J4L._SL1000_.jpg",
                EstimatedPrice = 5.20m,
                SpecificationsJson = "{\"Resolution\":\"128x64 pixels\",\"Driver\":\"SSD1306\",\"Interface\":\"I2C (0x3C)\",\"OperatingVoltage\":\"3.3V - 5V\"}",
                PinoutJson = "[{\"pin\":\"VCC\",\"function\":\"Power 3.3V\",\"voltage\":\"3.3V\"},{\"pin\":\"GND\",\"function\":\"Ground\",\"voltage\":\"0V\"},{\"pin\":\"SCL\",\"function\":\"I2C SCL\",\"voltage\":\"3.3V\"},{\"pin\":\"SDA\",\"function\":\"I2C SDA\",\"voltage\":\"3.3V\"}]",
                DatasheetUrl = "https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf",
                CompatibilityNotes = "Shares I2C bus on GPIO21 (SDA) and GPIO22 (SCL)."
            };

            db.Components.AddRange(esp32, soilSensor, dht22, relay, pump, bme280, oled);
            await db.SaveChangesAsync();

            // Add purchase links
            if (adafruit != null && sparkfun != null && digikey != null)
            {
                db.PurchaseLinks.AddRange(
                    new PurchaseLink { ComponentId = esp32.Id, VendorId = adafruit.Id, Url = "https://www.adafruit.com/product/3269", CurrentPrice = 6.20m, InStock = true, LastCheckedAt = DateTime.UtcNow },
                    new PurchaseLink { ComponentId = esp32.Id, VendorId = digikey.Id, Url = "https://www.digikey.com/product-detail/esp32", CurrentPrice = 6.80m, InStock = true, LastCheckedAt = DateTime.UtcNow },
                    new PurchaseLink { ComponentId = soilSensor.Id, VendorId = sparkfun.Id, Url = "https://www.sparkfun.com/products/17731", CurrentPrice = 2.95m, InStock = true, LastCheckedAt = DateTime.UtcNow },
                    new PurchaseLink { ComponentId = dht22.Id, VendorId = adafruit.Id, Url = "https://www.adafruit.com/product/385", CurrentPrice = 4.50m, InStock = true, LastCheckedAt = DateTime.UtcNow },
                    new PurchaseLink { ComponentId = relay.Id, VendorId = digikey.Id, Url = "https://www.digikey.com/product-detail/relay-5v", CurrentPrice = 2.10m, InStock = true, LastCheckedAt = DateTime.UtcNow },
                    new PurchaseLink { ComponentId = bme280.Id, VendorId = sparkfun.Id, Url = "https://www.sparkfun.com/products/13676", CurrentPrice = 7.20m, InStock = true, LastCheckedAt = DateTime.UtcNow },
                    new PurchaseLink { ComponentId = oled.Id, VendorId = adafruit.Id, Url = "https://www.adafruit.com/product/326", CurrentPrice = 4.95m, InStock = true, LastCheckedAt = DateTime.UtcNow }
                );
                await db.SaveChangesAsync();
            }
        }

        // 4. Seed Project Templates (14 Templates)
        if (!db.ProjectTemplates.Any())
        {
            var templates = new List<ProjectTemplate>
            {
                new()
                {
                    Title = "Smart Irrigation & Soil Moisture Control",
                    Category = "Agriculture & Plant Care",
                    Description = "Automated precision watering system with capacitive soil moisture sensing, environmental telemetry, and relay-driven water pump control.",
                    Difficulty = DifficultyLevel.Intermediate,
                    EstimatedCost = 42.50m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + MQTT",
                    PromptText = "Build a smart irrigation system using ESP32, soil moisture sensor, temperature/humidity sensor, relay and water pump.",
                    IconName = "Sprout",
                    IsFeatured = true
                },
                new()
                {
                    Title = "Solar IoT Microclimate Weather Station",
                    Category = "Environmental",
                    Description = "Autonomous meteorological station measuring barometric pressure, altitude, humidity, and temperature with local OLED display and cloud REST telemetry.",
                    Difficulty = DifficultyLevel.Beginner,
                    EstimatedCost = 34.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi (802.11 b/g/n)",
                    PromptText = "Create an ESP32 solar weather station monitoring barometric pressure, temperature, humidity with BME280 and OLED display.",
                    IconName = "CloudSun",
                    IsFeatured = true
                },
                new()
                {
                    Title = "Smart Home Security & Intrusion Sentinel",
                    Category = "Home Automation & Security",
                    Description = "Multi-zone perimeter alarm with passive infrared (PIR) motion detection, magnetic reed switches, 90dB piezo siren, and instant push notification webhooks.",
                    Difficulty = DifficultyLevel.Intermediate,
                    EstimatedCost = 38.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + Webhooks",
                    PromptText = "Build a smart home security system with PIR motion sensors, magnetic door contacts, buzzer alarm and push notifications.",
                    IconName = "ShieldAlert",
                    IsFeatured = true
                },
                new()
                {
                    Title = "Contactless RFID Attendance & Access Gate",
                    Category = "Commercial & Enterprise",
                    Description = "13.56 MHz NFC/RFID smart badge reader with dual-status RGB LEDs, audio confirmation, and real-time cloud employee check-in synchronization.",
                    Difficulty = DifficultyLevel.Intermediate,
                    EstimatedCost = 31.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + REST API",
                    PromptText = "Build an RFID attendance system using ESP32, RC522 card reader, RGB indicator and server-side employee verification.",
                    IconName = "IdCard",
                    IsFeatured = true
                },
                new()
                {
                    Title = "Air Quality & Hazardous Gas Monitor",
                    Category = "Health & Safety",
                    Description = "Indoor air quality station tracking CO2, NH3, smoke, and VOCs using MQ-135 and particulate matter sensors with alarm threshold triggers.",
                    Difficulty = DifficultyLevel.Intermediate,
                    EstimatedCost = 36.50m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + MQTT",
                    PromptText = "Build an indoor air quality monitor using ESP32, MQ-135 gas sensor, particulate sensor and OLED warning display.",
                    IconName = "Wind",
                    IsFeatured = true
                },
                new()
                {
                    Title = "Smart Energy & AC Current Monitor",
                    Category = "Energy & Power",
                    Description = "Non-invasive split-core current transformer (CT) telemetry node calculating true RMS power, kWh energy usage, and mains frequency.",
                    Difficulty = DifficultyLevel.Advanced,
                    EstimatedCost = 48.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + MQTT",
                    PromptText = "Build a non-invasive smart energy meter with SCT-013 current sensor, voltage zero-cross detection, and real-time wattage tracking.",
                    IconName = "Zap",
                    IsFeatured = false
                },
                new()
                {
                    Title = "Biometric & Keypad IoT Smart Door Lock",
                    Category = "Security",
                    Description = "Keyless access system combining optical fingerprint scanner, capacitive 4x4 keypad, and 12V solenoid electronic strike latch.",
                    Difficulty = DifficultyLevel.Advanced,
                    EstimatedCost = 54.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + BLE",
                    PromptText = "Build an IoT smart door lock with optical fingerprint sensor, 12V solenoid latch, relay driver and mobile unlock.",
                    IconName = "Lock",
                    IsFeatured = false
                },
                new()
                {
                    Title = "Industrial Thermocouple Temperature Logger",
                    Category = "Industrial IoT",
                    Description = "Extreme-temperature monitoring probe (-200C to +1024C) with K-type thermocouple and MAX6675 SPI amplifier for kilns and machinery.",
                    Difficulty = DifficultyLevel.Intermediate,
                    EstimatedCost = 39.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + Modbus/TCP",
                    PromptText = "Build an industrial temperature monitor with K-type thermocouple, MAX6675 SPI digitizer and over-temperature safety shutdown.",
                    IconName = "ThermometerSnowflake",
                    IsFeatured = false
                },
                new()
                {
                    Title = "Smart Ultrasonic Parking Space Sensor",
                    Category = "Smart City",
                    Description = "Overhead vehicle presence detection node with dual ultrasonic transducers and bright green/red bay occupancy status lighting.",
                    Difficulty = DifficultyLevel.Beginner,
                    EstimatedCost = 22.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + MQTT",
                    PromptText = "Build a smart parking occupancy sensor with HC-SR04 ultrasonic sensor and high-brightness LED bay indicator.",
                    IconName = "Car",
                    IsFeatured = false
                },
                new()
                {
                    Title = "Water Quality, pH & Turbidity Station",
                    Category = "Environmental",
                    Description = "Aquatic sensor array measuring analog pH probe, optical turbidity, and waterproof DS18B20 water temperature in aquaponics or reservoirs.",
                    Difficulty = DifficultyLevel.Advanced,
                    EstimatedCost = 62.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + REST",
                    PromptText = "Build a water quality monitor with analog pH probe, optical turbidity sensor and waterproof DS18B20 temperature probe.",
                    IconName = "Droplet",
                    IsFeatured = false
                },
                new()
                {
                    Title = "Asset GPS & Cellular Fleet Tracker",
                    Category = "Logistics & Tracking",
                    Description = "Geo-fencing GPS beacon utilizing NEO-6M satellite receiver, SIM800L GPRS cellular modem, and accelerometer vibration wake.",
                    Difficulty = DifficultyLevel.Advanced,
                    EstimatedCost = 45.00m,
                    Controller = "ESP32",
                    Connectivity = "Cellular LTE / 2G + GPS",
                    PromptText = "Build a GPS asset tracker with NEO-6M GPS receiver, SIM800L GSM modem and lithium battery power management.",
                    IconName = "Navigation",
                    IsFeatured = false
                },
                new()
                {
                    Title = "Infrared Optical Flame & Fire Detection",
                    Category = "Health & Safety",
                    Description = "Rapid flame sensor detecting 760nm - 1100nm infrared spectrum wavelengths with thermal threshold comparator and buzzer alert.",
                    Difficulty = DifficultyLevel.Beginner,
                    EstimatedCost = 24.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + Webhook",
                    PromptText = "Build an optical flame detection unit with IR flame sensor, gas detector and emergency evacuation siren.",
                    IconName = "Flame",
                    IsFeatured = false
                },
                new()
                {
                    Title = "Hydroponic Plant Canopy Monitoring Node",
                    Category = "Agriculture",
                    Description = "Vertical farm micro-station monitoring PAR light spectrum (BH1750), ambient vapor pressure deficit, and automated misting valves.",
                    Difficulty = DifficultyLevel.Intermediate,
                    EstimatedCost = 37.00m,
                    Controller = "ESP32",
                    Connectivity = "Wi-Fi + MQTT",
                    PromptText = "Build a plant canopy monitoring node with I2C lux sensor, humidity sensor and 12V solenoid misting valve.",
                    IconName = "Leaf",
                    IsFeatured = false
                }
            };

            db.ProjectTemplates.AddRange(templates);
            await db.SaveChangesAsync();
        }
    }
}
