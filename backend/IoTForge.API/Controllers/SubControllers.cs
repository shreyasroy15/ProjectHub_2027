using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IoTForge.API.Controllers;

[ApiController]
[Route("api/components")]
public class ComponentsController : BaseApiController
{
    private readonly IComponentService _componentService;

    public ComponentsController(IComponentService componentService)
    {
        _componentService = componentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ComponentDto>>> GetAll([FromQuery] string? category, [FromQuery] string? search)
    {
        var components = await _componentService.GetAllComponentsAsync(category, search);
        return Ok(components);
    }

    [HttpGet("vendors")]
    public async Task<ActionResult<List<VendorDto>>> GetVendors()
    {
        var vendors = await _componentService.GetVendorsAsync();
        return Ok(vendors);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ComponentDto>> GetById(Guid id)
    {
        var component = await _componentService.GetComponentByIdAsync(id);
        if (component == null) return NotFound();
        return Ok(component);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ComponentDto>> Create([FromBody] CreateComponentRequest request)
    {
        var created = await _componentService.CreateComponentAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ComponentDto>> Update(Guid id, [FromBody] UpdateComponentRequest request)
    {
        var updated = await _componentService.UpdateComponentAsync(id, request);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _componentService.DeleteComponentAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/bom")]
public class BomController : BaseApiController
{
    private readonly IProjectService _projectService;

    public BomController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<BomSummaryDto>> GetBom(Guid projectId)
    {
        var bom = await _projectService.GetProjectBomAsync(projectId, CurrentUserId);
        return Ok(bom);
    }
}

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/connections")]
public class WiringController : BaseApiController
{
    private readonly IProjectService _projectService;

    public WiringController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ConnectionDto>>> GetConnections(Guid projectId)
    {
        var connections = await _projectService.GetProjectConnectionsAsync(projectId, CurrentUserId);
        return Ok(connections);
    }

    [HttpPut]
    public async Task<ActionResult<List<ConnectionDto>>> UpdateConnections(Guid projectId, [FromBody] List<ConnectionSpecDto> connections)
    {
        var updated = await _projectService.UpdateProjectConnectionsAsync(projectId, CurrentUserId, connections);
        return Ok(updated);
    }
}

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/code")]
public class CodeController : BaseApiController
{
    private readonly IProjectService _projectService;

    public CodeController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CodeArtifactDto>>> GetCode(Guid projectId)
    {
        var code = await _projectService.GetProjectCodeAsync(projectId, CurrentUserId);
        return Ok(code);
    }

    [HttpPost("generate")]
    public async Task<ActionResult<CodeArtifactDto>> RegenerateCode(Guid projectId, [FromQuery] string targetStack, [FromQuery] string subCategory)
    {
        var artifact = await _projectService.RegenerateProjectCodeAsync(projectId, CurrentUserId, targetStack, subCategory);
        return Ok(artifact);
    }
}

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/build-guide")]
public class BuildGuideController : BaseApiController
{
    private readonly IProjectService _projectService;

    public BuildGuideController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BuildStepDto>>> GetBuildGuide(Guid projectId)
    {
        var guide = await _projectService.GetBuildGuideAsync(projectId, CurrentUserId);
        return Ok(guide);
    }

    [HttpPut("{stepId:guid}")]
    public async Task<ActionResult<BuildStepDto>> ToggleStep(Guid projectId, Guid stepId, [FromBody] UpdateStepStatusRequest request)
    {
        var updated = await _projectService.ToggleStepCompletionAsync(projectId, stepId, CurrentUserId, request.IsCompleted);
        return Ok(updated);
    }
}

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/tests")]
public class TestsController : BaseApiController
{
    private readonly IProjectService _projectService;

    public TestsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TestCaseDto>>> GetTests(Guid projectId)
    {
        var tests = await _projectService.GetTestCasesAsync(projectId, CurrentUserId);
        return Ok(tests);
    }

    [HttpPut("{testId:guid}")]
    public async Task<ActionResult<TestCaseDto>> UpdateTest(Guid projectId, Guid testId, [FromBody] UpdateTestStatusRequest request)
    {
        var updated = await _projectService.UpdateTestCaseStatusAsync(projectId, testId, CurrentUserId, request);
        return Ok(updated);
    }
}

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/export")]
public class ExportController : BaseApiController
{
    private readonly IExportService _exportService;
    private readonly IoTForge.Infrastructure.Data.IoTForgeDbContext _db;

    public ExportController(IExportService exportService, IoTForge.Infrastructure.Data.IoTForgeDbContext db)
    {
        _exportService = exportService;
        _db = db;
    }

    [HttpGet("bom-csv")]
    public async Task<IActionResult> ExportBomCsv(Guid projectId)
    {
        var project = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
            Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(
                _db.Projects, p => p.Components),
            p => p.Id == projectId && p.UserId == CurrentUserId);

        if (project == null) return NotFound();

        var bytes = _exportService.ExportBomCsv(project);
        return File(bytes, "text/csv", $"{project.Title.Replace(" ", "_")}_BOM.csv");
    }

    [HttpGet("documentation")]
    public async Task<IActionResult> ExportDocumentation(Guid projectId)
    {
        var project = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
            Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(
                Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(
                    Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(
                        _db.Projects, p => p.Components),
                    p => p.Connections),
                p => p.BuildSteps),
            p => p.Id == projectId && p.UserId == CurrentUserId);

        if (project == null) return NotFound();

        var md = _exportService.ExportDocumentationMarkdown(project);
        return Content(md, "text/markdown");
    }
}

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var stats = await _adminService.GetAdminStatsAsync();
        return Ok(stats);
    }

    [HttpGet("ai-usage")]
    public async Task<ActionResult<AiUsageStatsDto>> GetAiUsage()
    {
        var usage = await _adminService.GetAiUsageStatsAsync();
        return Ok(usage);
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> GetUsers()
    {
        var users = await _adminService.GetUsersAsync();
        return Ok(users);
    }

    [HttpPost("users/{userId:guid}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId)
    {
        var ok = await _adminService.ToggleUserStatusAsync(userId);
        if (!ok) return NotFound();
        return Ok(new { message = "User status updated" });
    }
}
