using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;
using IoTForge.Infrastructure.Auth;
using IoTForge.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IoTForge.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IoTForgeDbContext _db;
    private readonly JwtTokenGenerator _jwt;
    private readonly IMongoDatabaseService _mongo;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IoTForgeDbContext db, JwtTokenGenerator jwt, IMongoDatabaseService mongo, ILogger<AuthService> logger)
    {
        _db = db;
        _jwt = jwt;
        _mongo = mongo;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // 1. Check existing in Mongo or DbContext
        bool existing = false;
        if (_mongo.IsConnected)
        {
            var mongoUser = await _mongo.GetUserByEmailAsync(normalizedEmail);
            existing = mongoUser != null;
        }

        if (!existing)
        {
            try
            {
                existing = await _db.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DbContext check during registration failed.");
            }
        }

        if (existing)
        {
            throw new InvalidOperationException("An account with this email address already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Role = UserRole.User,
            ExperienceLevel = request.ExperienceLevel == 0 ? ExperienceLevel.Beginner : request.ExperienceLevel,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var refreshToken = _jwt.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        // Save to MongoDB if connected
        if (_mongo.IsConnected)
        {
            await _mongo.CreateUserAsync(user);
            _logger.LogInformation("New user registered directly in MongoDB: {Email}", user.Email);
        }

        // Save to DbContext for relational consistency
        try
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not persist user to relational DbContext (using MongoDB primary).");
        }

        var accessToken = _jwt.GenerateAccessToken(user);
        var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role, user.ExperienceLevel, user.CreatedAt);

        return new AuthResponse(accessToken, refreshToken, userDto);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        User? user = null;

        // Try fetching from MongoDB first if connected
        if (_mongo.IsConnected)
        {
            user = await _mongo.GetUserByEmailAsync(normalizedEmail);
            if (user != null)
            {
                _logger.LogInformation("User retrieved from MongoDB: {Email}", user.Email);
            }
        }

        // Fallback to relational DbContext
        if (user == null)
        {
            try
            {
                user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DbContext query in LoginAsync failed.");
            }
        }

        if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("This user account has been deactivated.");
        }

        var refreshToken = _jwt.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;

        // Update in MongoDB
        if (_mongo.IsConnected)
        {
            await _mongo.UpdateUserAsync(user);
        }

        // Update in DbContext
        try
        {
            var tracked = await _db.Users.FindAsync(user.Id);
            if (tracked != null)
            {
                tracked.RefreshToken = refreshToken;
                tracked.RefreshTokenExpiry = user.RefreshTokenExpiry;
                await _db.SaveChangesAsync();
            }
        }
        catch { }

        var accessToken = _jwt.GenerateAccessToken(user);
        var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role, user.ExperienceLevel, user.CreatedAt);

        return new AuthResponse(accessToken, refreshToken, userDto);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        User? user = null;

        if (_mongo.IsConnected)
        {
            user = await _mongo.GetUserByRefreshTokenAsync(refreshToken);
        }

        if (user == null)
        {
            try
            {
                user = await _db.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiry > DateTime.UtcNow);
            }
            catch { }
        }

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var newRefreshToken = _jwt.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;

        if (_mongo.IsConnected)
        {
            await _mongo.UpdateUserAsync(user);
        }

        try
        {
            var tracked = await _db.Users.FindAsync(user.Id);
            if (tracked != null)
            {
                tracked.RefreshToken = newRefreshToken;
                tracked.RefreshTokenExpiry = user.RefreshTokenExpiry;
                await _db.SaveChangesAsync();
            }
        }
        catch { }

        var accessToken = _jwt.GenerateAccessToken(user);
        var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role, user.ExperienceLevel, user.CreatedAt);

        return new AuthResponse(accessToken, newRefreshToken, userDto);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        User? user = null;

        if (_mongo.IsConnected)
        {
            user = await _mongo.GetUserByIdAsync(userId);
        }

        if (user == null)
        {
            user = await _db.Users.FindAsync(userId);
        }

        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        return new UserDto(user.Id, user.Name, user.Email, user.Role, user.ExperienceLevel, user.CreatedAt);
    }
}
