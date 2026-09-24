using IoTForge.Application.DTOs;
using IoTForge.Domain.Entities;

namespace IoTForge.Application.Interfaces;

public interface IAiProjectGenerator
{
    string ProviderName { get; }
    Task<StructuredProjectOutput> GenerateProjectAsync(ProjectGenerationRequest request, CancellationToken cancellationToken = default);
    Task<ProjectChatResponse> ChatWithProjectAsync(Project project, string userMessage, CancellationToken cancellationToken = default);
    Task<CodeSpecDto> RegenerateCodeAsync(Project project, string targetStack, string subCategory, CancellationToken cancellationToken = default);
}

public class CompatibilityIssue
{
    public string Severity { get; set; } = "Warning"; // Warning, Error, Critical
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
}

public class CompatibilityValidationResult
{
    public bool IsValid { get; set; } = true;
    public bool SafetyReviewRequired { get; set; } = false;
    public string? SafetyReviewReason { get; set; }
    public List<CompatibilityIssue> Issues { get; set; } = new();
}

public interface ICompatibilityValidator
{
    CompatibilityValidationResult Validate(StructuredProjectOutput project);
}
