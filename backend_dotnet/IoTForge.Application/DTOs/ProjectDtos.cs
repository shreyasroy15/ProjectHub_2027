using IoTForge.Domain.Enums;

namespace IoTForge.Application.DTOs;

public record CreateProjectRequest(
    string Title,
    string Description,
    DifficultyLevel Difficulty = DifficultyLevel.Intermediate,
    string Controller = "ESP32",
    string Connectivity = "Wi-Fi"
);

public record UpdateProjectRequest(
    string? Title,
    string? Description,
    DifficultyLevel? Difficulty,
    ProjectStatus? Status
);

public record ProjectSummaryDto(
    Guid Id,
    string Title,
    string Description,
    DifficultyLevel Difficulty,
    decimal EstimatedCost,
    string EstimatedBuildTime,
    string Controller,
    string Connectivity,
    ProjectStatus Status,
    bool SafetyReviewRequired,
    int Version,
    int ComponentCount,
    int StepCount,
    int PassedCount,
    int TotalTestCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ProjectDetailDto(
    Guid Id,
    Guid UserId,
    string Title,
    string Description,
    DifficultyLevel Difficulty,
    decimal EstimatedCost,
    string EstimatedBuildTime,
    string Controller,
    string Connectivity,
    string PowerSource,
    ProjectStatus Status,
    bool SafetyReviewRequired,
    string? SafetyReviewReason,
    int Version,
    List<string> Requirements,
    List<ProjectComponentDto> Components,
    List<ConnectionDto> Connections,
    ArchitectureSpecDto Architecture,
    InfrastructureSpecDto Infrastructure,
    List<CodeArtifactDto> CodeArtifacts,
    List<BuildStepDto> BuildSteps,
    List<TestCaseDto> TestCases,
    List<SafetyWarningDto> SafetyWarnings,
    List<ProjectMessageDto> Messages,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ProjectComponentDto(
    Guid Id,
    Guid? ComponentId,
    string Name,
    string Category,
    string Description,
    int Quantity,
    decimal UnitPrice,
    decimal? VerifiedPrice,
    string? VendorName,
    string? PurchaseUrl,
    string? SpecificationsJson,
    string? PinoutJson,
    string? DatasheetUrl,
    string? CompatibilityNotes
);

public record ConnectionDto(
    Guid Id,
    string FromComponent,
    string FromPin,
    string ToComponent,
    string ToPin,
    string Signal,
    string WireColor,
    string Voltage,
    string Description
);

public record CodeArtifactDto(
    Guid Id,
    string TargetStack,
    string SubCategory,
    string FileName,
    string Language,
    string CodeContent,
    string Description
);

public record BuildStepDto(
    Guid Id,
    int StepNumber,
    string Title,
    string Description,
    List<string> RequiredComponents,
    string? DiagramHint,
    string? Warnings,
    string ExpectedResult,
    bool IsCompleted
);

public record TestCaseDto(
    Guid Id,
    string Category,
    string Title,
    string Description,
    TestStatus Status,
    string? Notes
);

public record UpdateTestStatusRequest(
    TestStatus Status,
    string? Notes
);

public record ProjectMessageDto(
    Guid Id,
    string Role,
    string Content,
    DateTime CreatedAt
);

public record ProjectVersionDto(
    Guid Id,
    int VersionNumber,
    string ChangeNotes,
    DateTime CreatedAt
);

public record BomItemDto(
    Guid Id,
    string ComponentName,
    string Category,
    int Quantity,
    decimal EstimatedUnitPrice,
    decimal? VerifiedUnitPrice,
    decimal TotalEstimated,
    string? VendorName,
    string? PurchaseUrl,
    bool IsVerifiedPrice,
    bool InStock
);

public record BomSummaryDto(
    List<BomItemDto> Items,
    decimal Subtotal,
    decimal EstimatedShipping,
    decimal EstimatedTotal,
    int TotalItems
);

public record UpdateStepStatusRequest(
    bool IsCompleted
);
