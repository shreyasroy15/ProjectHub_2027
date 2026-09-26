namespace IoTForge.Domain.Entities;

public class Vendor : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g. Adafruit, SparkFun, Mouser, DigiKey, Amazon
    public string Website { get; set; } = string.Empty;
    public string? ApiUrl { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<PurchaseLink> PurchaseLinks { get; set; } = new List<PurchaseLink>();
}

public class PurchaseLink : BaseEntity
{
    public Guid ComponentId { get; set; }
    public Component? Component { get; set; }

    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }

    public string Url { get; set; } = string.Empty;
    public decimal? CurrentPrice { get; set; }
    public bool InStock { get; set; } = true;
    public DateTime? LastCheckedAt { get; set; }
}
