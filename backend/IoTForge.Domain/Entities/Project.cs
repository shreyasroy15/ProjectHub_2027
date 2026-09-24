using IoTForge.Domain.Enums;

namespace IoTForge.Domain.Entities;

public class Project : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Intermediate;
    public decimal EstimatedCost { get; set; }
    public string EstimatedBuildTime { get; set; } = "2-4 hours";
    public string Controller { get; set; } = "ESP32";
    public string Connectivity { get; set; } = "Wi-Fi + BLE";
    public string PowerSource { get; set; } = "5V USB / 3.3V Regulator";
    public ProjectStatus Status { get; set; } = ProjectStatus.InProgress;

    public bool SafetyReviewRequired { get; set; } = false;
    public string? SafetyReviewReason { get; set; }

    public int Version { get; set; } = 1;

    // JSON Blobs for structured requirements, system architecture and infrastructure specs
    public string RequirementsJson { get; set; } = "[]";
    public string ArchitectureJson { get; set; } = "{}";
    public string InfrastructureJson { get; set; } = "{}";
    public string SafetyWarningsJson { get; set; } = "[]";

    // Navigations
    public ICollection<ProjectComponent> Components { get; set; } = new List<ProjectComponent>();
    public ICollection<Connection> Connections { get; set; } = new List<Connection>();
    public ICollection<CodeArtifact> CodeArtifacts { get; set; } = new List<CodeArtifact>();
    public ICollection<BuildStep> BuildSteps { get; set; } = new List<BuildStep>();
    public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
    public ICollection<ProjectMessage> Messages { get; set; } = new List<ProjectMessage>();
    public ICollection<ProjectVersion> Versions { get; set; } = new List<ProjectVersion>();
    public ICollection<ArchitectureNode> ArchitectureNodes { get; set; } = new List<ArchitectureNode>();
    public ICollection<ArchitectureConnection> ArchitectureConnections { get; set; } = new List<ArchitectureConnection>();
}
