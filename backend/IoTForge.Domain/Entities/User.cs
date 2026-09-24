using IoTForge.Domain.Enums;

namespace IoTForge.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.Beginner;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
