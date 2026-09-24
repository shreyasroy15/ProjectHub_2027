using System.Text.Json;
using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;
using IoTForge.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IoTForge.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly IoTForgeDbContext _db;
    private readonly IAiProjectGenerator _aiGenerator;
    private readonly ICompatibilityValidator _validator;

    public ProjectService(IoTForgeDbContext db, IAiProjectGenerator aiGenerator, ICompatibilityValidator validator)
    {
        _db = db;
        _aiGenerator = aiGenerator;
        _validator = validator;
    }

    public async Task<List<ProjectSummaryDto>> GetUserProjectsAsync(Guid userId)
    {
        var projects = await _db.Projects
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => new ProjectSummaryDto(
                p.Id,
                p.Title,
                p.Description,
                p.Difficulty,
                p.EstimatedCost,
                p.EstimatedBuildTime,
                p.Controller,
                p.Connectivity,
                p.Status,
                p.SafetyReviewRequired,
                p.Version,
                p.Components.Count,
                p.BuildSteps.Count,
                p.TestCases.Count(t => t.Status == TestStatus.Passed),
                p.TestCases.Count,
                p.CreatedAt,
                p.UpdatedAt
            ))
            .ToListAsync();

        return projects;
    }

    public async Task<ProjectDetailDto?> GetProjectByIdAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.Components)
            .Include(p => p.Connections)
            .Include(p => p.ArchitectureNodes)
            .Include(p => p.ArchitectureConnections)
            .Include(p => p.CodeArtifacts)
            .Include(p => p.BuildSteps.OrderBy(s => s.StepNumber))
            .Include(p => p.TestCases)
            .Include(p => p.Messages.OrderBy(m => m.CreatedAt))
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) return null;

        return MapToDetailDto(project);
    }

    public async Task<ProjectDetailDto> CreateProjectAsync(Guid userId, CreateProjectRequest request)
    {
        var project = new Project
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            Difficulty = request.Difficulty,
            Controller = request.Controller,
            Connectivity = request.Connectivity,
            Status = ProjectStatus.InProgress,
            EstimatedCost = 25.00m
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        return MapToDetailDto(project);
    }

    public async Task<ProjectDetailDto> GenerateAndSaveProjectAsync(Guid userId, ProjectGenerationRequest request)
    {
        // 1. Run AI generation
        var structured = await _aiGenerator.GenerateProjectAsync(request);

        // 2. Run Compatibility & Safety Validation
        var validation = _validator.Validate(structured);
        if (validation.SafetyReviewRequired)
        {
            structured.Project.SafetyReviewRequired = true;
            structured.Project.SafetyReviewReason = validation.SafetyReviewReason;
        }

        // 3. Create Project Entity
        var project = new Project
        {
            UserId = userId,
            Title = structured.Project.Name,
            Description = structured.Project.Description,
            Difficulty = Enum.TryParse<DifficultyLevel>(structured.Project.Difficulty, true, out var d) ? d : DifficultyLevel.Intermediate,
            EstimatedCost = structured.Project.EstimatedCost,
            EstimatedBuildTime = structured.Project.EstimatedBuildTime,
            Controller = structured.Project.Controller,
            Connectivity = structured.Project.Connectivity,
            PowerSource = structured.Project.PowerSource,
            Status = ProjectStatus.InProgress,
            SafetyReviewRequired = structured.Project.SafetyReviewRequired,
            SafetyReviewReason = structured.Project.SafetyReviewReason,
            RequirementsJson = JsonSerializer.Serialize(structured.Requirements),
            InfrastructureJson = JsonSerializer.Serialize(structured.Infrastructure),
            SafetyWarningsJson = JsonSerializer.Serialize(structured.SafetyWarnings),
            Version = 1
        };

        // 4. Save Components
        foreach (var c in structured.Components)
        {
            // Check master catalog for component ID match
            var master = await _db.Components.FirstOrDefaultAsync(m => m.Name.ToLower() == c.Name.ToLower());

            project.Components.Add(new ProjectComponent
            {
                ComponentId = master?.Id,
                Name = c.Name,
                Category = c.Category,
                Description = c.Description,
                Quantity = c.Quantity,
                UnitPrice = c.EstimatedPrice,
                VerifiedPrice = c.VerifiedPrice,
                VendorName = c.VendorName,
                PurchaseUrl = c.PurchaseUrl,
                DatasheetUrl = c.DatasheetUrl,
                CompatibilityNotes = c.CompatibilityNotes,
                SpecificationsJson = JsonSerializer.Serialize(c.Specifications),
                PinoutJson = JsonSerializer.Serialize(c.Pinout)
            });
        }

        // 5. Save Connections
        foreach (var conn in structured.Connections)
        {
            project.Connections.Add(new Connection
            {
                FromComponent = conn.FromComponent,
                FromPin = conn.FromPin,
                ToComponent = conn.ToComponent,
                ToPin = conn.ToPin,
                Signal = conn.Signal,
                WireColor = conn.WireColor,
                Voltage = conn.Voltage,
                Description = conn.Description
            });
        }

        // 6. Save Architecture Nodes & Edges
        foreach (var node in structured.Architecture.Nodes)
        {
            project.ArchitectureNodes.Add(new ArchitectureNode
            {
                NodeId = node.Id,
                Label = node.Label,
                Type = node.Type,
                Layer = node.Layer,
                Description = node.Description,
                PositionX = node.X,
                PositionY = node.Y
            });
        }

        foreach (var edge in structured.Architecture.Connections)
        {
            project.ArchitectureConnections.Add(new ArchitectureConnection
            {
                SourceNodeId = edge.From,
                TargetNodeId = edge.To,
                Protocol = edge.Protocol,
                Description = edge.Description
            });
        }

        // 7. Save Code Artifacts
        foreach (var f in structured.Firmware)
        {
            project.CodeArtifacts.Add(new CodeArtifact
            {
                TargetStack = f.TargetStack,
                SubCategory = f.SubCategory,
                FileName = f.FileName,
                Language = f.Language,
                CodeContent = f.CodeContent,
                Description = f.Description
            });
        }

        foreach (var b in structured.Backend)
        {
            project.CodeArtifacts.Add(new CodeArtifact
            {
                TargetStack = b.TargetStack,
                SubCategory = b.SubCategory,
                FileName = b.FileName,
                Language = b.Language,
                CodeContent = b.CodeContent,
                Description = b.Description
            });
        }

        if (structured.Database != null && !string.IsNullOrEmpty(structured.Database.CodeContent))
        {
            project.CodeArtifacts.Add(new CodeArtifact
            {
                TargetStack = structured.Database.TargetStack,
                SubCategory = structured.Database.SubCategory,
                FileName = structured.Database.FileName,
                Language = structured.Database.Language,
                CodeContent = structured.Database.CodeContent,
                Description = structured.Database.Description
            });
        }

        // 8. Save Build Steps
        foreach (var step in structured.BuildSteps)
        {
            project.BuildSteps.Add(new BuildStep
            {
                StepNumber = step.StepNumber,
                Title = step.Title,
                Description = step.Description,
                RequiredComponentsJson = JsonSerializer.Serialize(step.RequiredComponents),
                DiagramHint = step.DiagramHint,
                Warnings = step.Warnings,
                ExpectedResult = step.ExpectedResult,
                IsCompleted = false
            });
        }

        // 9. Save Test Cases
        foreach (var test in structured.TestingChecklist)
        {
            project.TestCases.Add(new TestCase
            {
                Category = test.Category,
                Title = test.Title,
                Description = test.Description,
                Status = Enum.TryParse<TestStatus>(test.Status, true, out var ts) ? ts : TestStatus.Pending
            });
        }

        // 10. Record user prompt in message history
        project.Messages.Add(new ProjectMessage
        {
            Role = "user",
            Content = request.Prompt
        });

        project.Messages.Add(new ProjectMessage
        {
            Role = "assistant",
            Content = $"Successfully generated engineering blueprint for '{project.Title}' with {project.Components.Count} components, {project.Connections.Count} wire nets, and complete firmware/backend scaffolding."
        });

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        // 11. Create Initial Version Snapshot
        await SaveVersionAsync(project.Id, userId, "Initial AI Generation");

        return MapToDetailDto(project);
    }

    public async Task<ProjectDetailDto> UpdateProjectAsync(Guid projectId, Guid userId, UpdateProjectRequest request)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
        if (project == null) throw new KeyNotFoundException("Project not found.");

        if (!string.IsNullOrEmpty(request.Title)) project.Title = request.Title;
        if (!string.IsNullOrEmpty(request.Description)) project.Description = request.Description;
        if (request.Difficulty.HasValue) project.Difficulty = request.Difficulty.Value;
        if (request.Status.HasValue) project.Status = request.Status.Value;

        project.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return (await GetProjectByIdAsync(projectId, userId))!;
    }

    public async Task<bool> DeleteProjectAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
        if (project == null) return false;

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<BomSummaryDto> GetProjectBomAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.Components)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        var items = project.Components.Select(c =>
        {
            var unitPrice = c.VerifiedPrice ?? c.UnitPrice;
            var total = unitPrice * c.Quantity;
            return new BomItemDto(
                c.Id,
                c.Name,
                c.Category,
                c.Quantity,
                c.UnitPrice,
                c.VerifiedPrice,
                total,
                c.VendorName,
                c.PurchaseUrl,
                c.VerifiedPrice.HasValue,
                true
            );
        }).ToList();

        var subtotal = items.Sum(i => i.TotalEstimated);
        var shipping = subtotal > 0 ? 5.99m : 0m;
        var totalEstimated = subtotal + shipping;

        return new BomSummaryDto(items, subtotal, shipping, totalEstimated, items.Sum(i => i.Quantity));
    }

    public async Task<List<ConnectionDto>> GetProjectConnectionsAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.Connections)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        return project.Connections.Select(c => new ConnectionDto(
            c.Id, c.FromComponent, c.FromPin, c.ToComponent, c.ToPin, c.Signal, c.WireColor, c.Voltage, c.Description
        )).ToList();
    }

    public async Task<List<ConnectionDto>> UpdateProjectConnectionsAsync(Guid projectId, Guid userId, List<ConnectionSpecDto> connections)
    {
        var project = await _db.Projects
            .Include(p => p.Connections)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        _db.Connections.RemoveRange(project.Connections);

        foreach (var c in connections)
        {
            project.Connections.Add(new Connection
            {
                ProjectId = projectId,
                FromComponent = c.FromComponent,
                FromPin = c.FromPin,
                ToComponent = c.ToComponent,
                ToPin = c.ToPin,
                Signal = c.Signal,
                WireColor = c.WireColor,
                Voltage = c.Voltage,
                Description = c.Description
            });
        }

        project.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GetProjectConnectionsAsync(projectId, userId);
    }

    public async Task<List<CodeArtifactDto>> GetProjectCodeAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.CodeArtifacts)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        return project.CodeArtifacts.Select(c => new CodeArtifactDto(
            c.Id, c.TargetStack, c.SubCategory, c.FileName, c.Language, c.CodeContent, c.Description
        )).ToList();
    }

    public async Task<CodeArtifactDto> RegenerateProjectCodeAsync(Guid projectId, Guid userId, string targetStack, string subCategory)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
        if (project == null) throw new KeyNotFoundException("Project not found.");

        var generated = await _aiGenerator.RegenerateCodeAsync(project, targetStack, subCategory);

        var existing = await _db.CodeArtifacts
            .FirstOrDefaultAsync(c => c.ProjectId == projectId && c.TargetStack == targetStack && c.SubCategory == subCategory);

        if (existing != null)
        {
            existing.CodeContent = generated.CodeContent;
            existing.FileName = generated.FileName;
            existing.Language = generated.Language;
            existing.Description = generated.Description;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existing = new CodeArtifact
            {
                ProjectId = projectId,
                TargetStack = targetStack,
                SubCategory = subCategory,
                FileName = generated.FileName,
                Language = generated.Language,
                CodeContent = generated.CodeContent,
                Description = generated.Description
            };
            _db.CodeArtifacts.Add(existing);
        }

        await _db.SaveChangesAsync();

        return new CodeArtifactDto(existing.Id, existing.TargetStack, existing.SubCategory, existing.FileName, existing.Language, existing.CodeContent, existing.Description);
    }

    public async Task<List<BuildStepDto>> GetBuildGuideAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.BuildSteps.OrderBy(s => s.StepNumber))
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        return project.BuildSteps.Select(s => new BuildStepDto(
            s.Id,
            s.StepNumber,
            s.Title,
            s.Description,
            DeserializeStringList(s.RequiredComponentsJson),
            s.DiagramHint,
            s.Warnings,
            s.ExpectedResult,
            s.IsCompleted
        )).ToList();
    }

    public async Task<BuildStepDto> ToggleStepCompletionAsync(Guid projectId, Guid stepId, Guid userId, bool isCompleted)
    {
        var step = await _db.BuildSteps
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == stepId && s.ProjectId == projectId && s.Project!.UserId == userId);

        if (step == null) throw new KeyNotFoundException("Build step not found.");

        step.IsCompleted = isCompleted;
        step.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new BuildStepDto(
            step.Id,
            step.StepNumber,
            step.Title,
            step.Description,
            DeserializeStringList(step.RequiredComponentsJson),
            step.DiagramHint,
            step.Warnings,
            step.ExpectedResult,
            step.IsCompleted
        );
    }

    public async Task<List<TestCaseDto>> GetTestCasesAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.TestCases)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        return project.TestCases.Select(t => new TestCaseDto(
            t.Id, t.Category, t.Title, t.Description, t.Status, t.Notes
        )).ToList();
    }

    public async Task<TestCaseDto> UpdateTestCaseStatusAsync(Guid projectId, Guid testId, Guid userId, UpdateTestStatusRequest request)
    {
        var test = await _db.TestCases
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == testId && t.ProjectId == projectId && t.Project!.UserId == userId);

        if (test == null) throw new KeyNotFoundException("Test case not found.");

        test.Status = request.Status;
        if (request.Notes != null) test.Notes = request.Notes;
        test.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new TestCaseDto(test.Id, test.Category, test.Title, test.Description, test.Status, test.Notes);
    }

    public async Task<ProjectChatResponse> ChatWithProjectAsync(Guid projectId, Guid userId, string message)
    {
        var project = await _db.Projects
            .Include(p => p.Components)
            .Include(p => p.Connections)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        _db.ProjectMessages.Add(new ProjectMessage
        {
            ProjectId = projectId,
            Role = "user",
            Content = message
        });

        var response = await _aiGenerator.ChatWithProjectAsync(project, message);

        _db.ProjectMessages.Add(new ProjectMessage
        {
            ProjectId = projectId,
            Role = "assistant",
            Content = response.Reply
        });

        await _db.SaveChangesAsync();

        return response;
    }

    public async Task<ProjectVersionDto> SaveVersionAsync(Guid projectId, Guid userId, string notes)
    {
        var project = await _db.Projects
            .Include(p => p.Components)
            .Include(p => p.Connections)
            .Include(p => p.CodeArtifacts)
            .Include(p => p.BuildSteps)
            .Include(p => p.TestCases)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null) throw new KeyNotFoundException("Project not found.");

        project.Version += 1;
        var snapshot = JsonSerializer.Serialize(MapToDetailDto(project));

        var version = new ProjectVersion
        {
            ProjectId = projectId,
            VersionNumber = project.Version,
            SnapshotJson = snapshot,
            ChangeNotes = notes
        };

        _db.ProjectVersions.Add(version);
        await _db.SaveChangesAsync();

        return new ProjectVersionDto(version.Id, version.VersionNumber, version.ChangeNotes, version.CreatedAt);
    }

    public async Task<List<ProjectVersionDto>> GetVersionsAsync(Guid projectId, Guid userId)
    {
        var versions = await _db.ProjectVersions
            .Where(v => v.ProjectId == projectId && v.Project!.UserId == userId)
            .OrderByDescending(v => v.VersionNumber)
            .Select(v => new ProjectVersionDto(v.Id, v.VersionNumber, v.ChangeNotes, v.CreatedAt))
            .ToListAsync();

        return versions;
    }

    public async Task<ProjectDetailDto> RestoreVersionAsync(Guid projectId, Guid versionId, Guid userId)
    {
        var version = await _db.ProjectVersions
            .FirstOrDefaultAsync(v => v.Id == versionId && v.ProjectId == projectId && v.Project!.UserId == userId);

        if (version == null) throw new KeyNotFoundException("Version not found.");

        var restored = JsonSerializer.Deserialize<ProjectDetailDto>(version.SnapshotJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (restored == null) throw new InvalidOperationException("Failed to deserialize version snapshot.");

        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
        if (project != null)
        {
            project.Title = restored.Title;
            project.Description = restored.Description;
            project.Difficulty = restored.Difficulty;
            project.EstimatedCost = restored.EstimatedCost;
            project.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return (await GetProjectByIdAsync(projectId, userId))!;
    }

    public async Task<List<TemplateDto>> GetTemplatesAsync()
    {
        return await _db.ProjectTemplates
            .Select(t => new TemplateDto(
                t.Id, t.Title, t.Description, t.Category, t.Difficulty, t.EstimatedCost, t.Controller, t.Connectivity, t.PromptText, t.IconName, t.IsFeatured
            ))
            .ToListAsync();
    }

    private static ProjectDetailDto MapToDetailDto(Project p)
    {
        var requirements = DeserializeStringList(p.RequirementsJson);
        var infrastructure = DeserializeInfrastructure(p.InfrastructureJson);
        var safetyWarnings = DeserializeSafetyWarnings(p.SafetyWarningsJson);

        var archNodes = p.ArchitectureNodes.Select(n => new ArchNodeDto
        {
            Id = n.NodeId,
            Label = n.Label,
            Type = n.Type,
            Layer = n.Layer,
            Description = n.Description,
            X = n.PositionX,
            Y = n.PositionY
        }).ToList();

        var archEdges = p.ArchitectureConnections.Select(c => new ArchEdgeDto
        {
            From = c.SourceNodeId,
            To = c.TargetNodeId,
            Protocol = c.Protocol,
            Description = c.Description
        }).ToList();

        var arch = new ArchitectureSpecDto { Nodes = archNodes, Connections = archEdges };

        return new ProjectDetailDto(
            p.Id,
            p.UserId,
            p.Title,
            p.Description,
            p.Difficulty,
            p.EstimatedCost,
            p.EstimatedBuildTime,
            p.Controller,
            p.Connectivity,
            p.PowerSource,
            p.Status,
            p.SafetyReviewRequired,
            p.SafetyReviewReason,
            p.Version,
            requirements,
            p.Components.Select(c => new ProjectComponentDto(
                c.Id, c.ComponentId, c.Name, c.Category, c.Description, c.Quantity, c.UnitPrice, c.VerifiedPrice, c.VendorName, c.PurchaseUrl, c.SpecificationsJson, c.PinoutJson, c.DatasheetUrl, c.CompatibilityNotes
            )).ToList(),
            p.Connections.Select(c => new ConnectionDto(
                c.Id, c.FromComponent, c.FromPin, c.ToComponent, c.ToPin, c.Signal, c.WireColor, c.Voltage, c.Description
            )).ToList(),
            arch,
            infrastructure,
            p.CodeArtifacts.Select(c => new CodeArtifactDto(
                c.Id, c.TargetStack, c.SubCategory, c.FileName, c.Language, c.CodeContent, c.Description
            )).ToList(),
            p.BuildSteps.OrderBy(s => s.StepNumber).Select(s => new BuildStepDto(
                s.Id, s.StepNumber, s.Title, s.Description, DeserializeStringList(s.RequiredComponentsJson), s.DiagramHint, s.Warnings, s.ExpectedResult, s.IsCompleted
            )).ToList(),
            p.TestCases.Select(t => new TestCaseDto(
                t.Id, t.Category, t.Title, t.Description, t.Status, t.Notes
            )).ToList(),
            safetyWarnings,
            p.Messages.OrderBy(m => m.CreatedAt).Select(m => new ProjectMessageDto(
                m.Id, m.Role, m.Content, m.CreatedAt
            )).ToList(),
            p.CreatedAt,
            p.UpdatedAt
        );
    }

    private static List<string> DeserializeStringList(string json)
    {
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? new(); }
        catch { return new(); }
    }

    private static InfrastructureSpecDto DeserializeInfrastructure(string json)
    {
        try { return JsonSerializer.Deserialize<InfrastructureSpecDto>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new(); }
        catch { return new(); }
    }

    private static List<SafetyWarningDto> DeserializeSafetyWarnings(string json)
    {
        try { return JsonSerializer.Deserialize<List<SafetyWarningDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new(); }
        catch { return new(); }
    }
}
