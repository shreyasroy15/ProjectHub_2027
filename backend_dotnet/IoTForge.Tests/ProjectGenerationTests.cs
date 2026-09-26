using FluentAssertions;
using IoTForge.Application.DTOs;
using IoTForge.Application.Services;
using IoTForge.Infrastructure.Ai;
using Xunit;

namespace IoTForge.Tests;

public class ProjectGenerationTests
{
    private readonly RuleBasedEngineeringEngine _engine = new();

    [Fact]
    public async Task GenerateProjectAsync_SmartIrrigation_ShouldOutputFullStructuredEngineeringSchema()
    {
        // Arrange
        var request = new ProjectGenerationRequest(
            Prompt: "Build a smart irrigation system using ESP32, soil moisture sensor, temperature/humidity sensor, relay and water pump."
        );

        // Act
        var output = await _engine.GenerateProjectAsync(request);

        // Assert
        output.Should().NotBeNull();
        output.Project.Name.Should().Contain("Irrigation");
        output.Project.Controller.Should().Contain("ESP32");
        output.Project.EstimatedCost.Should().BeGreaterThan(0);

        // Components check
        output.Components.Should().HaveCountGreaterThanOrEqualTo(5);
        output.Components.Should().Contain(c => c.Name.Contains("Soil"));
        output.Components.Should().Contain(c => c.Name.Contains("DHT22"));
        output.Components.Should().Contain(c => c.Name.Contains("Relay"));
        output.Components.Should().Contain(c => c.Name.Contains("Pump"));

        // Wiring connections check
        output.Connections.Should().NotBeEmpty();
        output.Connections.Should().Contain(c => c.Signal == "ADC" || c.FromPin == "GPIO34" || c.ToPin == "GPIO34");
        output.Connections.Should().Contain(c => c.ToComponent.Contains("Relay") || c.FromComponent.Contains("Relay"));

        // Architecture check
        output.Architecture.Nodes.Should().NotBeEmpty();
        output.Architecture.Connections.Should().NotBeEmpty();

        // Firmware and Backend code check
        output.Firmware.Should().NotBeEmpty();
        output.Firmware[0].CodeContent.Should().Contain("#include <WiFi.h>");
        output.Backend.Should().NotBeEmpty();
        output.Backend[0].CodeContent.Should().Contain("TelemetryController");

        // Build Steps and Testing Checklist check
        output.BuildSteps.Should().HaveCountGreaterThanOrEqualTo(4);
        output.TestingChecklist.Should().HaveCountGreaterThanOrEqualTo(4);
    }
}

public class CompatibilityValidationTests
{
    private readonly CompatibilityValidator _validator = new();

    [Fact]
    public void Validate_DirectMotorConnection_ShouldFlagCriticalSafetyWarning()
    {
        // Arrange
        var project = new StructuredProjectOutput
        {
            Project = new ProjectMetaDto { Controller = "ESP32 DevKit V1" },
            Components = new List<ComponentSpecDto>
            {
                new() { Name = "ESP32", Category = "Microcontrollers" },
                new() { Name = "12V Submersible DC Water Pump", Category = "Motors" }
                // Notice: No Relay or MOSFET driver present!
            },
            Connections = new List<ConnectionSpecDto>
            {
                new() { FromComponent = "ESP32", FromPin = "GPIO26", ToComponent = "Water Pump", ToPin = "V+", Signal = "GPIO", Voltage = "3.3V" }
            }
        };

        // Act
        var result = _validator.Validate(project);

        // Assert
        result.SafetyReviewRequired.Should().BeTrue();
        result.Issues.Should().Contain(i => i.Severity == "Critical" && i.Title.Contains("Motor"));
    }

    [Fact]
    public void Validate_SharedI2CBus_ShouldNotBeFlaggedAsPinConflict()
    {
        // Arrange: Two sensors sharing I2C SDA and SCL
        var project = new StructuredProjectOutput
        {
            Project = new ProjectMetaDto { Controller = "ESP32 DevKit V1" },
            Components = new List<ComponentSpecDto>
            {
                new() { Name = "ESP32", Category = "Microcontrollers" },
                new() { Name = "BME280 Sensor", Category = "Sensors" },
                new() { Name = "OLED Display", Category = "Displays" }
            },
            Connections = new List<ConnectionSpecDto>
            {
                new() { FromComponent = "ESP32", FromPin = "GPIO21", ToComponent = "BME280", ToPin = "SDA", Signal = "I2C SDA", Voltage = "3.3V" },
                new() { FromComponent = "ESP32", FromPin = "GPIO21", ToComponent = "OLED Display", ToPin = "SDA", Signal = "I2C SDA", Voltage = "3.3V" },
                new() { FromComponent = "ESP32", FromPin = "GPIO22", ToComponent = "BME280", ToPin = "SCL", Signal = "I2C SCL", Voltage = "3.3V" },
                new() { FromComponent = "ESP32", FromPin = "GPIO22", ToComponent = "OLED Display", ToPin = "SCL", Signal = "I2C SCL", Voltage = "3.3V" }
            }
        };

        // Act
        var result = _validator.Validate(project);

        // Assert: I2C bus sharing is standard and valid
        result.IsValid.Should().BeTrue();
        result.Issues.Should().NotContain(i => i.Severity == "Error" && i.Title.Contains("Conflict"));
    }

    [Fact]
    public void Validate_ExclusivePinConflict_ShouldTriggerError()
    {
        // Arrange: Two devices trying to use dedicated GPIO 4
        var project = new StructuredProjectOutput
        {
            Project = new ProjectMetaDto { Controller = "ESP32 DevKit V1" },
            Components = new List<ComponentSpecDto>
            {
                new() { Name = "ESP32", Category = "Microcontrollers" },
                new() { Name = "Sensor A", Category = "Sensors" },
                new() { Name = "Sensor B", Category = "Sensors" }
            },
            Connections = new List<ConnectionSpecDto>
            {
                new() { FromComponent = "ESP32", FromPin = "GPIO4", ToComponent = "Sensor A", ToPin = "DATA", Signal = "Digital", Voltage = "3.3V" },
                new() { FromComponent = "ESP32", FromPin = "GPIO4", ToComponent = "Sensor B", ToPin = "DATA", Signal = "Digital", Voltage = "3.3V" }
            }
        };

        // Act
        var result = _validator.Validate(project);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Issues.Should().Contain(i => i.Severity == "Error" && i.Title.Contains("Conflict on GPIO4"));
    }
}
