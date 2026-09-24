using IoTForge.Domain.Enums;

namespace IoTForge.Domain.Entities;

public class ProjectComponent : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public Guid? ComponentId { get; set; }
    public Component? Component { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal? VerifiedPrice { get; set; }
    public string? VendorName { get; set; }
    public string? PurchaseUrl { get; set; }
    public string? SpecificationsJson { get; set; }
    public string? PinoutJson { get; set; }
    public string? DatasheetUrl { get; set; }
    public string? CompatibilityNotes { get; set; }
}

public class Connection : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string FromComponent { get; set; } = string.Empty;
    public string FromPin { get; set; } = string.Empty;
    public string ToComponent { get; set; } = string.Empty;
    public string ToPin { get; set; } = string.Empty;
    public string Signal { get; set; } = string.Empty; // e.g. I2C SDA, SPI MOSI, ADC, GPIO, VCC, GND
    public string WireColor { get; set; } = "#3B82F6"; // Hex color
    public string Voltage { get; set; } = "3.3V";
    public string Description { get; set; } = string.Empty;
}

public class ArchitectureNode : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string NodeId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "Device"; // Device, Sensor, Actuator, Gateway, API, Backend, Database, Cloud, Frontend
    public string Layer { get; set; } = "Edge"; // Edge, Gateway, Cloud, Client
    public string Description { get; set; } = string.Empty;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
}

public class ArchitectureConnection : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string SourceNodeId { get; set; } = string.Empty;
    public string TargetNodeId { get; set; } = string.Empty;
    public string Protocol { get; set; } = "WiFi/MQTT"; // I2C, SPI, MQTT, HTTP, WebSockets, etc.
    public string Description { get; set; } = string.Empty;
}

public class CodeArtifact : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string TargetStack { get; set; } = "Firmware"; // Firmware, Backend, Frontend, Database
    public string SubCategory { get; set; } = "Arduino"; // Arduino, ESP-IDF, PlatformIO, ASPNET, NodeJS, Python, React, SQL
    public string FileName { get; set; } = string.Empty;
    public string Language { get; set; } = "cpp"; // cpp, csharp, typescript, python, sql
    public string CodeContent { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class BuildStep : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public int StepNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequiredComponentsJson { get; set; } = "[]";
    public string? DiagramHint { get; set; }
    public string? Warnings { get; set; }
    public string ExpectedResult { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
}

public class TestCase : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Category { get; set; } = "Hardware"; // Hardware, Sensor, Connectivity, Firmware, Backend, Security
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TestStatus Status { get; set; } = TestStatus.Pending;
    public string? Notes { get; set; }
}

public class ProjectMessage : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Role { get; set; } = "user"; // user, assistant, system
    public string Content { get; set; } = string.Empty;
}

public class ProjectVersion : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public int VersionNumber { get; set; }
    public string SnapshotJson { get; set; } = string.Empty;
    public string ChangeNotes { get; set; } = string.Empty;
}

public class ProjectTemplate : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Intermediate;
    public decimal EstimatedCost { get; set; }
    public string Controller { get; set; } = "ESP32";
    public string Connectivity { get; set; } = "Wi-Fi";
    public string PromptText { get; set; } = string.Empty;
    public string FullProjectJson { get; set; } = "{}";
    public string IconName { get; set; } = "Cpu";
    public bool IsFeatured { get; set; } = true;
}
