using FluentAssertions;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;
using IoTForge.Infrastructure.Auth;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace IoTForge.Tests;

public class AuthTests
{
    [Fact]
    public void PasswordHasher_ShouldHashAndVerifyPasswordCorrectly()
    {
        // Arrange
        var password = "SecurePassword123!";

        // Act
        var hash = PasswordHasher.HashPassword(password);
        var isValid = PasswordHasher.VerifyPassword(password, hash);
        var isInvalid = PasswordHasher.VerifyPassword("WrongPassword", hash);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        isValid.Should().BeTrue();
        isInvalid.Should().BeFalse();
    }

    [Fact]
    public void JwtTokenGenerator_ShouldGenerateValidAccessToken()
    {
        // Arrange
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Secret", "IoTForge_Super_Secret_Key_For_Production_Ready_SaaS_2026_Engineering_Grid!" },
            { "Jwt:Issuer", "IoTForge" },
            { "Jwt:Audience", "IoTForgeAudience" },
            { "Jwt:ExpiryMinutes", "60" }
        };

        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var generator = new JwtTokenGenerator(config);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Alex Tester",
            Email = "alex@iotforge.io",
            Role = UserRole.User,
            ExperienceLevel = ExperienceLevel.Intermediate
        };

        // Act
        var token = generator.GenerateAccessToken(user);
        var refreshToken = generator.GenerateRefreshToken();

        // Assert
        token.Should().NotBeNullOrEmpty();
        token.Split('.').Should().HaveCount(3); // Header.Payload.Signature
        refreshToken.Should().NotBeNullOrEmpty();
    }
}
