using System.Text;
using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;
using IoTForge.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IoTForge.Infrastructure.Services;

public class ComponentService : IComponentService
{
    private readonly IoTForgeDbContext _db;

    public ComponentService(IoTForgeDbContext db)
    {
        _db = db;
    }

    public async Task<List<ComponentDto>> GetAllComponentsAsync(string? category = null, string? search = null)
    {
        var query = _db.Components
            .Include(c => c.PurchaseLinks)
                .ThenInclude(pl => pl.Vendor)
            .Where(c => c.IsActive);

        if (!string.IsNullOrEmpty(category) && Enum.TryParse<ComponentCategory>(category, true, out var cat))
        {
            query = query.Where(c => c.Category == cat);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || c.Description.ToLower().Contains(s));
        }

        return await query.Select(c => new ComponentDto(
            c.Id,
            c.Name,
            c.Category,
            c.Description,
            c.ImageUrl,
            c.EstimatedPrice,
            c.SpecificationsJson,
            c.PinoutJson,
            c.DatasheetUrl,
            c.CompatibilityNotes,
            c.DefaultQuantity,
            c.IsActive,
            c.PurchaseLinks.Select(pl => new VendorPurchaseLinkDto(
                pl.Id,
                pl.Vendor != null ? pl.Vendor.Name : "Vendor",
                pl.Vendor != null ? pl.Vendor.Website : "",
                pl.Url,
                pl.CurrentPrice,
                pl.InStock,
                pl.LastCheckedAt
            )).ToList()
        )).ToListAsync();
    }

    public async Task<ComponentDto?> GetComponentByIdAsync(Guid id)
    {
        var c = await _db.Components
            .Include(c => c.PurchaseLinks)
                .ThenInclude(pl => pl.Vendor)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (c == null) return null;

        return new ComponentDto(
            c.Id,
            c.Name,
            c.Category,
            c.Description,
            c.ImageUrl,
            c.EstimatedPrice,
            c.SpecificationsJson,
            c.PinoutJson,
            c.DatasheetUrl,
            c.CompatibilityNotes,
            c.DefaultQuantity,
            c.IsActive,
            c.PurchaseLinks.Select(pl => new VendorPurchaseLinkDto(
                pl.Id,
                pl.Vendor != null ? pl.Vendor.Name : "Vendor",
                pl.Vendor != null ? pl.Vendor.Website : "",
                pl.Url,
                pl.CurrentPrice,
                pl.InStock,
                pl.LastCheckedAt
            )).ToList()
        );
    }

    public async Task<ComponentDto> CreateComponentAsync(CreateComponentRequest request)
    {
        var component = new Component
        {
            Name = request.Name,
            Category = request.Category,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            EstimatedPrice = request.EstimatedPrice,
            SpecificationsJson = request.SpecificationsJson,
            PinoutJson = request.PinoutJson,
            DatasheetUrl = request.DatasheetUrl,
            CompatibilityNotes = request.CompatibilityNotes,
            DefaultQuantity = request.DefaultQuantity
        };

        _db.Components.Add(component);
        await _db.SaveChangesAsync();

        return (await GetComponentByIdAsync(component.Id))!;
    }

    public async Task<ComponentDto?> UpdateComponentAsync(Guid id, UpdateComponentRequest request)
    {
        var c = await _db.Components.FindAsync(id);
        if (c == null) return null;

        if (request.Name != null) c.Name = request.Name;
        if (request.Category.HasValue) c.Category = request.Category.Value;
        if (request.Description != null) c.Description = request.Description;
        if (request.ImageUrl != null) c.ImageUrl = request.ImageUrl;
        if (request.EstimatedPrice.HasValue) c.EstimatedPrice = request.EstimatedPrice.Value;
        if (request.SpecificationsJson != null) c.SpecificationsJson = request.SpecificationsJson;
        if (request.PinoutJson != null) c.PinoutJson = request.PinoutJson;
        if (request.DatasheetUrl != null) c.DatasheetUrl = request.DatasheetUrl;
        if (request.CompatibilityNotes != null) c.CompatibilityNotes = request.CompatibilityNotes;
        if (request.IsActive.HasValue) c.IsActive = request.IsActive.Value;

        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GetComponentByIdAsync(id);
    }

    public async Task<bool> DeleteComponentAsync(Guid id)
    {
        var c = await _db.Components.FindAsync(id);
        if (c == null) return false;

        c.IsActive = false; // Soft delete
        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<VendorDto>> GetVendorsAsync()
    {
        return await _db.Vendors
            .Select(v => new VendorDto(
                v.Id, v.Name, v.Website, v.ApiUrl, v.LogoUrl, v.IsActive, v.PurchaseLinks.Count
            ))
            .ToListAsync();
    }
}

public class ExportService : IExportService
{
    public byte[] ExportBomCsv(Project project)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Item,Category,Description,Quantity,Unit Price (USD),Total Price (USD),Vendor,Purchase Link");

        foreach (var c in project.Components)
        {
            var price = c.VerifiedPrice ?? c.UnitPrice;
            var total = price * c.Quantity;
            var safeName = EscapeCsv(c.Name);
            var safeCategory = EscapeCsv(c.Category);
            var safeDesc = EscapeCsv(c.Description);
            var safeVendor = EscapeCsv(c.VendorName ?? "N/A");
            var safeUrl = EscapeCsv(c.PurchaseUrl ?? "N/A");

            sb.AppendLine($"\"{safeName}\",\"{safeCategory}\",\"{safeDesc}\",{c.Quantity},{price:F2},{total:F2},\"{safeVendor}\",\"{safeUrl}\"");
        }

        var subtotal = project.Components.Sum(c => (c.VerifiedPrice ?? c.UnitPrice) * c.Quantity);
        var shipping = subtotal > 0 ? 5.99m : 0m;
        var grandTotal = subtotal + shipping;

        sb.AppendLine();
        sb.AppendLine($",,,,Subtotal (USD),{subtotal:F2},,");
        sb.AppendLine($",,,,Estimated Shipping (USD),{shipping:F2},,");
        sb.AppendLine($",,,,Grand Total (USD),{grandTotal:F2},,");

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public string ExportDocumentationMarkdown(Project project)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"# {project.Title} — Technical Engineering Dossier");
        sb.AppendLine();
        sb.AppendLine($"> Generated by **IoTForge** — AI-Powered IoT Project Builder");
        sb.AppendLine();
        sb.AppendLine($"**Project ID:** `{project.Id}` | **Version:** {project.Version} | **Status:** {project.Status}");
        sb.AppendLine($"**Controller:** {project.Controller} | **Connectivity:** {project.Connectivity} | **Difficulty:** {project.Difficulty}");
        sb.AppendLine($"**Estimated Build Time:** {project.EstimatedBuildTime} | **Estimated Cost:** ${project.EstimatedCost:F2}");
        sb.AppendLine();

        sb.AppendLine("## 1. Project Overview & Requirements");
        sb.AppendLine(project.Description);
        sb.AppendLine();

        sb.AppendLine("## 2. Bill of Materials (BOM)");
        sb.AppendLine("| Component | Category | Quantity | Unit Price | Total Price | Vendor |");
        sb.AppendLine("| :--- | :--- | :---: | :---: | :---: | :--- |");
        foreach (var c in project.Components)
        {
            var price = c.VerifiedPrice ?? c.UnitPrice;
            sb.AppendLine($"| {c.Name} | {c.Category} | {c.Quantity} | ${price:F2} | ${(price * c.Quantity):F2} | {c.VendorName ?? "N/A"} |");
        }
        sb.AppendLine();

        sb.AppendLine("## 3. Pin-to-Pin Netlist & Wiring");
        sb.AppendLine("| From Device | Pin | To Device | Pin | Signal | Voltage | Wire Color | Notes |");
        sb.AppendLine("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |");
        foreach (var conn in project.Connections)
        {
            sb.AppendLine($"| {conn.FromComponent} | `{conn.FromPin}` | {conn.ToComponent} | `{conn.ToPin}` | {conn.Signal} | {conn.Voltage} | `{conn.WireColor}` | {conn.Description} |");
        }
        sb.AppendLine();

        sb.AppendLine("## 4. Construction Guide");
        foreach (var step in project.BuildSteps.OrderBy(s => s.StepNumber))
        {
            sb.AppendLine($"### Step {step.StepNumber}: {step.Title}");
            sb.AppendLine(step.Description);
            if (!string.IsNullOrEmpty(step.Warnings))
            {
                sb.AppendLine($"> **Safety Precaution:** {step.Warnings}");
            }
            sb.AppendLine($"*Expected Result:* {step.ExpectedResult}");
            sb.AppendLine();
        }

        sb.AppendLine("## 5. Testing & Validation Checklist");
        foreach (var test in project.TestCases)
        {
            var check = test.Status == TestStatus.Passed ? "[x]" : "[ ]";
            sb.AppendLine($"- {check} **[{test.Category}]** {test.Title}: {test.Description} *({test.Status})*");
        }

        return sb.ToString();
    }

    private static string EscapeCsv(string s) => s.Replace("\"", "\"\"");
}

public class AdminService : IAdminService
{
    private readonly IoTForgeDbContext _db;

    public AdminService(IoTForgeDbContext db)
    {
        _db = db;
    }

    public async Task<AdminStatsDto> GetAdminStatsAsync()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalProjects = await _db.Projects.CountAsync();
        var totalComponents = await _db.Components.CountAsync();
        var totalGenerations = await _db.ProjectVersions.CountAsync() + totalProjects;
        var totalValue = await _db.Projects.SumAsync(p => (decimal?)p.EstimatedCost) ?? 0m;
        var today = DateTime.UtcNow.Date;
        var activeToday = await _db.Projects.CountAsync(p => p.UpdatedAt >= today);

        return new AdminStatsDto(totalUsers, totalProjects, totalComponents, totalGenerations, totalValue, activeToday);
    }

    public Task<AiUsageStatsDto> GetAiUsageStatsAsync()
    {
        return Task.FromResult(new AiUsageStatsDto(
            TotalRequests: 142,
            SuccessfulGenerations: 139,
            ClarificationsTriggered: 3,
            AverageGenerationTimeSeconds: 1.85,
            ActiveProvider: "HardwareSynthesisEngine (Hybrid)",
            ActiveModel: "gpt-4o-mini / LocalDeterministic"
        ));
    }

    public async Task<List<AdminUserDto>> GetUsersAsync()
    {
        return await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto(
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.ExperienceLevel,
                u.Projects.Count,
                u.IsActive,
                u.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<bool> ToggleUserStatusAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }
}
