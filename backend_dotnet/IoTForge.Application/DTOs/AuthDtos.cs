using IoTForge.Domain.Enums;

namespace IoTForge.Application.DTOs;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string ConfirmPassword,
    ExperienceLevel ExperienceLevel = ExperienceLevel.Beginner
);

public record LoginRequest(
    string Email,
    string Password
);

public record RefreshTokenRequest(
    string RefreshToken
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserDto User
);

public record UserDto(
    Guid Id,
    string Name,
    string Email,
    UserRole Role,
    ExperienceLevel ExperienceLevel,
    DateTime CreatedAt
);

public record ForgotPasswordRequest(
    string Email
);
