using IoTForge.Domain.Entities;
using MongoDB.Driver;

namespace IoTForge.Infrastructure.Data;

public interface IMongoDatabaseService
{
    bool IsConnected { get; }
    bool IsAtlasConnected { get; }
    string StatusMessage { get; }
    string DatabaseName { get; }
    IMongoDatabase? Database { get; }
    IMongoCollection<User>? UsersCollection { get; }

    Task<bool> PingAsync(CancellationToken cancellationToken = default);
    Task InitializeAndSeedAsync(CancellationToken cancellationToken = default);
    Task<bool> SyncToAtlasIfAvailableAsync(CancellationToken cancellationToken = default);

    Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetUserByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task CreateUserAsync(User user, CancellationToken cancellationToken = default);
    Task UpdateUserAsync(User user, CancellationToken cancellationToken = default);
    Task<List<User>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<long> GetUserCountAsync(CancellationToken cancellationToken = default);
}
