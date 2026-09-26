using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IoTForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/projects")]
public class ProjectsController : BaseApiController
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectSummaryDto>>> GetUserProjects()
    {
        var projects = await _projectService.GetUserProjectsAsync(CurrentUserId);
        return Ok(projects);
    }

    [HttpGet("templates")]
    [AllowAnonymous]
    public async Task<ActionResult<List<TemplateDto>>> GetTemplates()
    {
        var templates = await _projectService.GetTemplatesAsync();
        return Ok(templates);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDetailDto>> GetProjectById(Guid id)
    {
        var project = await _projectService.GetProjectByIdAsync(id, CurrentUserId);
        if (project == null) return NotFound(new { error = "Project not found or access denied." });
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDetailDto>> CreateProject([FromBody] CreateProjectRequest request)
    {
        var project = await _projectService.CreateProjectAsync(CurrentUserId, request);
        return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
    }

    [HttpPost("generate")]
    public async Task<ActionResult<ProjectDetailDto>> GenerateProject([FromBody] ProjectGenerationRequest request)
    {
        var project = await _projectService.GenerateAndSaveProjectAsync(CurrentUserId, request);
        return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProjectDetailDto>> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var updated = await _projectService.UpdateProjectAsync(id, CurrentUserId, request);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var deleted = await _projectService.DeleteProjectAsync(id, CurrentUserId);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("{id:guid}/chat")]
    public async Task<ActionResult<ProjectChatResponse>> ChatWithProject(Guid id, [FromBody] ProjectChatRequest request)
    {
        var response = await _projectService.ChatWithProjectAsync(id, CurrentUserId, request.Message);
        return Ok(response);
    }

    [HttpGet("{id:guid}/versions")]
    public async Task<ActionResult<List<ProjectVersionDto>>> GetVersions(Guid id)
    {
        var versions = await _projectService.GetVersionsAsync(id, CurrentUserId);
        return Ok(versions);
    }

    [HttpPost("{id:guid}/versions")]
    public async Task<ActionResult<ProjectVersionDto>> CreateVersion(Guid id, [FromBody] string notes)
    {
        var version = await _projectService.SaveVersionAsync(id, CurrentUserId, notes ?? "Manual checkpoint");
        return Ok(version);
    }

    [HttpPost("{id:guid}/versions/{versionId:guid}/restore")]
    public async Task<ActionResult<ProjectDetailDto>> RestoreVersion(Guid id, Guid versionId)
    {
        var project = await _projectService.RestoreVersionAsync(id, versionId, CurrentUserId);
        return Ok(project);
    }
}
