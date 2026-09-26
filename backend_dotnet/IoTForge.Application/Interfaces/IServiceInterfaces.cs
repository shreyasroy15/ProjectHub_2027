using IoTForge.Application.DTOs;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;

namespace IoTForge.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
}

public interface IProjectService
{
    Task<List<ProjectSummaryDto>> GetUserProjectsAsync(Guid userId);
    Task<ProjectDetailDto?> GetProjectByIdAsync(Guid projectId, Guid userId);
    Task<ProjectDetailDto> CreateProjectAsync(Guid userId, CreateProjectRequest request);
    Task<ProjectDetailDto> GenerateAndSaveProjectAsync(Guid userId, ProjectGenerationRequest request);
    Task<ProjectDetailDto> UpdateProjectAsync(Guid projectId, Guid userId, UpdateProjectRequest request);
    Task<bool> DeleteProjectAsync(Guid projectId, Guid userId);
    Task<BomSummaryDto> GetProjectBomAsync(Guid projectId, Guid userId);
    Task<List<ConnectionDto>> GetProjectConnectionsAsync(Guid projectId, Guid userId);
    Task<List<ConnectionDto>> UpdateProjectConnectionsAsync(Guid projectId, Guid userId, List<ConnectionSpecDto> connections);
    Task<List<CodeArtifactDto>> GetProjectCodeAsync(Guid projectId, Guid userId);
    Task<CodeArtifactDto> RegenerateProjectCodeAsync(Guid projectId, Guid userId, string targetStack, string subCategory);
    Task<List<BuildStepDto>> GetBuildGuideAsync(Guid projectId, Guid userId);
    Task<BuildStepDto> ToggleStepCompletionAsync(Guid projectId, Guid stepId, Guid userId, bool isCompleted);
    Task<List<TestCaseDto>> GetTestCasesAsync(Guid projectId, Guid userId);
    Task<TestCaseDto> UpdateTestCaseStatusAsync(Guid projectId, Guid testId, Guid userId, UpdateTestStatusRequest request);
    Task<ProjectChatResponse> ChatWithProjectAsync(Guid projectId, Guid userId, string message);
    Task<ProjectVersionDto> SaveVersionAsync(Guid projectId, Guid userId, string notes);
    Task<List<ProjectVersionDto>> GetVersionsAsync(Guid projectId, Guid userId);
    Task<ProjectDetailDto> RestoreVersionAsync(Guid projectId, Guid versionId, Guid userId);
    Task<List<TemplateDto>> GetTemplatesAsync();
}

public interface IComponentService
{
    Task<List<ComponentDto>> GetAllComponentsAsync(string? category = null, string? search = null);
    Task<ComponentDto?> GetComponentByIdAsync(Guid id);
    Task<ComponentDto> CreateComponentAsync(CreateComponentRequest request);
    Task<ComponentDto?> UpdateComponentAsync(Guid id, UpdateComponentRequest request);
    Task<bool> DeleteComponentAsync(Guid id);
    Task<List<VendorDto>> GetVendorsAsync();
}

public interface IExportService
{
    byte[] ExportBomCsv(Project project);
    string ExportDocumentationMarkdown(Project project);
}

public interface IAdminService
{
    Task<AdminStatsDto> GetAdminStatsAsync();
    Task<AiUsageStatsDto> GetAiUsageStatsAsync();
    Task<List<AdminUserDto>> GetUsersAsync();
    Task<bool> ToggleUserStatusAsync(Guid userId);
}
