using IoTForge.Domain.Enums;

namespace IoTForge.Domain.Entities;

public class Component : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public ComponentCategory Category { get; set; } = ComponentCategory.Microcontrollers;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal EstimatedPrice { get; set; }
    public string SpecificationsJson { get; set; } = "{}"; // Voltage, Operating Temp, Current, Protocol, etc.
    public string PinoutJson { get; set; } = "[]"; // List of pin definitions { name, type, voltage, function }
    public string? DatasheetUrl { get; set; }
    public string? CompatibilityNotes { get; set; }
    public int DefaultQuantity { get; set; } = 1;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<ProjectComponent> ProjectComponents { get; set; } = new List<ProjectComponent>();
    public ICollection<PurchaseLink> PurchaseLinks { get; set; } = new List<PurchaseLink>();
}
