using IoTForge.Domain.Enums;

namespace IoTForge.Application.DTOs;

public record ComponentDto(
    Guid Id,
    string Name,
    ComponentCategory Category,
    string Description,
    string ImageUrl,
    decimal EstimatedPrice,
    string SpecificationsJson,
    string PinoutJson,
    string? DatasheetUrl,
    string? CompatibilityNotes,
    int DefaultQuantity,
    bool IsActive,
    List<VendorPurchaseLinkDto> PurchaseLinks
);

public record VendorPurchaseLinkDto(
    Guid Id,
    string VendorName,
    string VendorWebsite,
    string Url,
    decimal? CurrentPrice,
    bool InStock,
    DateTime? LastCheckedAt
);

public record CreateComponentRequest(
    string Name,
    ComponentCategory Category,
    string Description,
    string ImageUrl,
    decimal EstimatedPrice,
    string SpecificationsJson,
    string PinoutJson,
    string? DatasheetUrl,
    string? CompatibilityNotes,
    int DefaultQuantity
);

public record UpdateComponentRequest(
    string? Name,
    ComponentCategory? Category,
    string? Description,
    string? ImageUrl,
    decimal? EstimatedPrice,
    string? SpecificationsJson,
    string? PinoutJson,
    string? DatasheetUrl,
    string? CompatibilityNotes,
    bool? IsActive
);

public record VendorDto(
    Guid Id,
    string Name,
    string Website,
    string? ApiUrl,
    string? LogoUrl,
    bool IsActive,
    int ActiveLinksCount
);

public record CreateVendorRequest(
    string Name,
    string Website,
    string? ApiUrl,
    string? LogoUrl
);

public record AdminStatsDto(
    int TotalUsers,
    int TotalProjects,
    int TotalComponents,
    int TotalGenerations,
    decimal TotalEstimatedHardwareValue,
    int ActiveProjectsToday
);

public record AiUsageStatsDto(
    int TotalRequests,
    int SuccessfulGenerations,
    int ClarificationsTriggered,
    double AverageGenerationTimeSeconds,
    string ActiveProvider,
    string ActiveModel
);

public record AdminUserDto(
    Guid Id,
    string Name,
    string Email,
    UserRole Role,
    ExperienceLevel ExperienceLevel,
    int ProjectCount,
    bool IsActive,
    DateTime CreatedAt
);

public record TemplateDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    DifficultyLevel Difficulty,
    decimal EstimatedCost,
    string Controller,
    string Connectivity,
    string PromptText,
    string IconName,
    bool IsFeatured
);
