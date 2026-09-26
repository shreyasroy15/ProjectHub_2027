using IoTForge.Domain.Enums;

namespace IoTForge.Application.DTOs;

public record ProjectGenerationRequest(
    string Prompt,
    ExperienceLevel? ExperienceLevel = ExperienceLevel.Intermediate,
    string? PreferredController = null,
    string? ConnectivityPreference = null,
    decimal? BudgetConstraint = null
);

public class ProjectMetaDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "Intermediate";
    public decimal EstimatedCost { get; set; }
    public string EstimatedBuildTime { get; set; } = "3-5 hours";
    public string Controller { get; set; } = "ESP32";
    public string Connectivity { get; set; } = "Wi-Fi + MQTT";
    public string PowerSource { get; set; } = "5V USB / 3.3V LDO";
    public bool SafetyReviewRequired { get; set; } = false;
    public string? SafetyReviewReason { get; set; }
}

public class ComponentSpecDto
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "Sensors";
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal EstimatedPrice { get; set; }
    public decimal? VerifiedPrice { get; set; }
    public string? VendorName { get; set; }
    public string? PurchaseUrl { get; set; }
    public string? DatasheetUrl { get; set; }
    public string? CompatibilityNotes { get; set; }
    public Dictionary<string, string> Specifications { get; set; } = new();
    public List<PinDefinitionDto> Pinout { get; set; } = new();
}

public class PinDefinitionDto
{
    public string Pin { get; set; } = string.Empty;
    public string Function { get; set; } = string.Empty;
    public string Voltage { get; set; } = "3.3V";
    public string Type { get; set; } = "Digital"; // Digital, Analog, Power, Ground, I2C, SPI, UART
}

public class ConnectionSpecDto
{
    public string FromComponent { get; set; } = string.Empty;
    public string FromPin { get; set; } = string.Empty;
    public string ToComponent { get; set; } = string.Empty;
    public string ToPin { get; set; } = string.Empty;
    public string Signal { get; set; } = string.Empty;
    public string WireColor { get; set; } = "#3B82F6";
    public string Voltage { get; set; } = "3.3V";
    public string Description { get; set; } = string.Empty;
}

public class ArchitectureSpecDto
{
    public List<ArchNodeDto> Nodes { get; set; } = new();
    public List<ArchEdgeDto> Connections { get; set; } = new();
}

public class ArchNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "Device"; // Device, Sensor, Actuator, Gateway, API, Backend, Database, Cloud, Frontend
    public string Layer { get; set; } = "Edge";
    public string Description { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
}

public class ArchEdgeDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string Protocol { get; set; } = "WiFi/MQTT";
    public string Description { get; set; } = string.Empty;
}

public class InfrastructureSpecDto
{
    public string Hardware { get; set; } = string.Empty;
    public string Network { get; set; } = string.Empty;
    public string Cloud { get; set; } = string.Empty;
    public string Backend { get; set; } = string.Empty;
    public string Database { get; set; } = string.Empty;
    public string Security { get; set; } = string.Empty;
    public string Monitoring { get; set; } = string.Empty;
    public string Backups { get; set; } = string.Empty;
}

public class CodeSpecDto
{
    public string TargetStack { get; set; } = "Firmware"; // Firmware, Backend, Frontend, Database
    public string SubCategory { get; set; } = "Arduino"; // Arduino, ESP-IDF, PlatformIO, ASPNET, NodeJS, Python, React, SQL
    public string FileName { get; set; } = "main.cpp";
    public string Language { get; set; } = "cpp";
    public string CodeContent { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class BuildStepSpecDto
{
    public int StepNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> RequiredComponents { get; set; } = new();
    public string? DiagramHint { get; set; }
    public string? Warnings { get; set; }
    public string ExpectedResult { get; set; } = string.Empty;
}

public class TestChecklistSpecDto
{
    public string Category { get; set; } = "Hardware"; // Hardware, Sensor, Connectivity, Firmware, Backend, Security
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
}

public class SafetyWarningDto
{
    public string Severity { get; set; } = "High"; // Low, Medium, High, Critical
    public string Title { get; set; } = string.Empty;
    public string Warning { get; set; } = string.Empty;
    public string Remedy { get; set; } = string.Empty;
}

public class StructuredProjectOutput
{
    public ProjectMetaDto Project { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
    public List<ComponentSpecDto> Components { get; set; } = new();
    public List<ConnectionSpecDto> Connections { get; set; } = new();
    public ArchitectureSpecDto Architecture { get; set; } = new();
    public InfrastructureSpecDto Infrastructure { get; set; } = new();
    public List<CodeSpecDto> Firmware { get; set; } = new();
    public List<CodeSpecDto> Backend { get; set; } = new();
    public CodeSpecDto Database { get; set; } = new();
    public List<BuildStepSpecDto> BuildSteps { get; set; } = new();
    public List<TestChecklistSpecDto> TestingChecklist { get; set; } = new();
    public List<SafetyWarningDto> SafetyWarnings { get; set; } = new();
    public List<string> ClarificationQuestions { get; set; } = new();
}

public record ProjectChatRequest(
    string Message
);

public record ProjectChatResponse(
    string Reply,
    bool SuggestedUpdate,
    StructuredProjectOutput? UpdatedProject = null
);
