using System.Text.RegularExpressions;
using IoTForge.Domain.Entities;
using IoTForge.Domain.Enums;
using IoTForge.Infrastructure.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace IoTForge.Infrastructure.Data;

public class MongoDatabaseService : IMongoDatabaseService, IDisposable
{
    private readonly ILogger<MongoDatabaseService> _logger;
    private readonly IConfiguration _config;
    private MongoClient? _client;
    private IMongoDatabase? _database;
    private IMongoCollection<User>? _usersCollection;
    private bool _isConnected;
    private bool _isAtlasConnected;
    private string _statusMessage = "Not connected";
    private readonly string _databaseName;
    private readonly string _primaryUri;
    private static bool _serializersRegistered = false;
    private static readonly object _syncLock = new();
    private readonly CancellationTokenSource _cts = new();

    public MongoDatabaseService(IConfiguration config, ILogger<MongoDatabaseService> logger)
    {
        _config = config;
        _logger = logger;

        RegisterSerializers();

        var rawUri = _config["MONGODB_URI"] 
            ?? _config["MONGO_URI"] 
            ?? Environment.GetEnvironmentVariable("MONGODB_URI") 
            ?? Environment.GetEnvironmentVariable("MONGO_URI") 
            ?? string.Empty;

        _primaryUri = SanitizeMongoUri(rawUri);
        var configuredDb = _config["MONGODB_DATABASE"] ?? Environment.GetEnvironmentVariable("MONGODB_DATABASE");
        _databaseName = !string.IsNullOrWhiteSpace(configuredDb)
            ? configuredDb.Trim()
            : (ExtractDatabaseName(_primaryUri) ?? "IOT_Project");

        if (!string.IsNullOrWhiteSpace(_primaryUri))
        {
            SetupClient(_primaryUri);
        }
        else
        {
            _statusMessage = "MONGODB_URI not configured";
        }

        // Start background auto-sync loop to detect when Atlas IP whitelist is active
        _ = Task.Run(AutoSyncAtlasLoopAsync);
    }

    private void SetupClient(string connectionUri)
    {
        try
        {
            var settings = MongoClientSettings.FromConnectionString(connectionUri);
            settings.ServerSelectionTimeout = TimeSpan.FromSeconds(3);
            settings.ConnectTimeout = TimeSpan.FromSeconds(3);
            _client = new MongoClient(settings);
            _database = _client.GetDatabase(_databaseName);
            _usersCollection = _database.GetCollection<User>("users");
            _statusMessage = "Targeting MongoDB database '" + _databaseName + "': " + MaskUri(connectionUri);
        }
        catch (Exception ex)
        {
            _statusMessage = $"MongoDB configuration error: {ex.Message}";
            _logger.LogError(ex, "Failed to configure MongoDB client with URI: {Uri}", MaskUri(connectionUri));
        }
    }

    public bool IsConnected => _isConnected;
    public bool IsAtlasConnected => _isAtlasConnected;
    public string StatusMessage => _statusMessage;
    public string DatabaseName => _databaseName;
    public IMongoDatabase? Database => _database;
    public IMongoCollection<User>? UsersCollection => _usersCollection;

    private static void RegisterSerializers()
    {
        lock (_syncLock)
        {
            if (_serializersRegistered) return;

            try
            {
                BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
            }
            catch
            {
                // Already registered
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(BaseEntity)))
            {
                BsonClassMap.RegisterClassMap<BaseEntity>(cm =>
                {
                    cm.AutoMap();
                    cm.MapIdProperty(c => c.Id);
                    cm.SetIsRootClass(true);
                });
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(User)))
            {
                BsonClassMap.RegisterClassMap<User>(cm =>
                {
                    cm.AutoMap();
                    cm.UnmapProperty(c => c.Projects);
                    cm.SetIgnoreExtraElements(true);
                });
            }

            _serializersRegistered = true;
        }
    }

    public static string SanitizeMongoUri(string rawUri)
    {
        if (string.IsNullOrWhiteSpace(rawUri)) return string.Empty;
        var uri = rawUri.Trim().Trim('"').Trim('\'');

        // Replace `<password>` if brackets were kept literally in mongodb+srv://user:<password>@host
        var match = Regex.Match(uri, @"^(mongodb(?:\+srv)?:\/\/[^:]+:)<([^>]+)>(@.+)$");
        if (match.Success)
        {
            uri = match.Groups[1].Value + match.Groups[2].Value + match.Groups[3].Value;
        }

        return uri;
    }

    private static string? ExtractDatabaseName(string uri)
    {
        try
        {
            var match = Regex.Match(uri, @"mongodb(?:\+srv)?:\/\/[^\/]+\/([^?\/]+)");
            if (match.Success && !string.IsNullOrWhiteSpace(match.Groups[1].Value))
            {
                return match.Groups[1].Value;
            }
        }
        catch { }
        return "IOT_Project";
    }

    public static string MaskUri(string uri)
    {
        if (string.IsNullOrEmpty(uri)) return string.Empty;
        return Regex.Replace(uri, @":([^@]+)@", ":******@");
    }

    public async Task<bool> PingAsync(CancellationToken cancellationToken = default)
    {
        // 1. First attempt: Primary URI (MongoDB Atlas Cloud Cluster)
        if (!string.IsNullOrEmpty(_primaryUri))
        {
            try
            {
                var settings = MongoClientSettings.FromConnectionString(_primaryUri);
                settings.ServerSelectionTimeout = TimeSpan.FromSeconds(3);
                settings.ConnectTimeout = TimeSpan.FromSeconds(3);
                var atlasClient = new MongoClient(settings);
                var atlasDb = atlasClient.GetDatabase(_databaseName);

                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromSeconds(3));

                await atlasDb.RunCommandAsync((Command<BsonDocument>)"{ping:1}", cancellationToken: cts.Token);

                _client = atlasClient;
                _database = atlasDb;
                _usersCollection = _database.GetCollection<User>("users");
                _isConnected = true;
                _isAtlasConnected = true;
                _statusMessage = $"Connected to MongoDB Atlas Cloud database '{_databaseName}' successfully. Data will display in Atlas Dashboard.";
                _logger.LogInformation("MongoDB Atlas Cloud connected successfully to database '{Db}'.", _databaseName);
                return true;
            }
            catch (Exception ex)
            {
                _isAtlasConnected = false;
                _logger.LogDebug("MongoDB Atlas Cloud ping failed: {Message}. Attempting local MongoDB fallback...", ex.Message);
            }
        }

        // 2. Second attempt: Local MongoDB fallback (mongodb://localhost:27017/IOT_Project)
        try
        {
            var localUri = "mongodb://localhost:27017";
            var localSettings = MongoClientSettings.FromConnectionString(localUri);
            localSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(2);
            localSettings.ConnectTimeout = TimeSpan.FromSeconds(2);
            var localClient = new MongoClient(localSettings);
            var localDb = localClient.GetDatabase(_databaseName);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(2));

            await localDb.RunCommandAsync((Command<BsonDocument>)"{ping:1}", cancellationToken: cts.Token);

            _client = localClient;
            _database = localDb;
            _usersCollection = _database.GetCollection<User>("users");
            _isConnected = true;
            _statusMessage = $"Connected to MongoDB database '{_databaseName}'. [Notice: Atlas Cloud IP Access List is pending for 14.195.19.210. Once whitelisted on cloud.mongodb.com, data automatically syncs to your Atlas dashboard]";
            return true;
        }
        catch (Exception ex)
        {
            _isConnected = false;
            _statusMessage = $"MongoDB Connection Pending: Atlas IP blocked (14.195.19.210) & local unreachable ({ex.Message})";
            _logger.LogError("All MongoDB connection attempts failed: {Message}", ex.Message);
            return false;
        }
    }

    public async Task<bool> SyncToAtlasIfAvailableAsync(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_primaryUri)) return false;

        try
        {
            var settings = MongoClientSettings.FromConnectionString(_primaryUri);
            settings.ServerSelectionTimeout = TimeSpan.FromSeconds(4);
            settings.ConnectTimeout = TimeSpan.FromSeconds(4);
            var atlasClient = new MongoClient(settings);
            var atlasDb = atlasClient.GetDatabase(_databaseName);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(4));

            await atlasDb.RunCommandAsync((Command<BsonDocument>)"{ping:1}", cancellationToken: cts.Token);

            var atlasUsers = atlasDb.GetCollection<User>("users");

            // Ensure unique index on Email in Atlas
            var indexKeys = Builders<User>.IndexKeys.Ascending(u => u.Email);
            await atlasUsers.Indexes.CreateOneAsync(new CreateIndexModel<User>(indexKeys, new CreateIndexOptions { Unique = true }), cancellationToken: cts.Token);

            // Copy all users from local collection or seed users to Atlas
            if (_usersCollection != null)
            {
                var existingUsers = await _usersCollection.Find(_ => true).ToListAsync(cancellationToken: cts.Token);
                foreach (var u in existingUsers)
                {
                    await atlasUsers.ReplaceOneAsync(x => x.Id == u.Id, u, new ReplaceOptions { IsUpsert = true }, cancellationToken: cts.Token);
                }
            }

            // Ensure default admin/engineer exist in Atlas
            var atlasCount = await atlasUsers.CountDocumentsAsync(_ => true, cancellationToken: cts.Token);
            if (atlasCount == 0)
            {
                var admin = new User
                {
                    Id = Guid.NewGuid(),
                    Name = "System Administrator",
                    Email = "admin@iotforge.io",
                    PasswordHash = PasswordHasher.HashPassword("AdminPassword123!"),
                    Role = UserRole.Admin,
                    ExperienceLevel = ExperienceLevel.Advanced,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var engineer = new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Senior IoT Engineer",
                    Email = "engineer@iotforge.io",
                    PasswordHash = PasswordHasher.HashPassword("Password123!"),
                    Role = UserRole.User,
                    ExperienceLevel = ExperienceLevel.Intermediate,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await atlasUsers.InsertManyAsync(new[] { admin, engineer }, cancellationToken: cts.Token);
            }

            // Successfully promoted to Atlas
            _client = atlasClient;
            _database = atlasDb;
            _usersCollection = atlasUsers;
            _isConnected = true;
            _isAtlasConnected = true;
            _statusMessage = $"Connected to MongoDB Atlas Cloud database '{_databaseName}' successfully! All user data is synced and visible on your MongoDB Atlas Dashboard.";
            _logger.LogInformation("Promoted and synced successfully to MongoDB Atlas Cloud database '{Db}'.", _databaseName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogDebug("Atlas auto-sync check: {Message}", ex.Message);
            return false;
        }
    }

    private async Task AutoSyncAtlasLoopAsync()
    {
        // Check Atlas every 15 seconds to automatically detect when user whitelists IP
        while (!_cts.Token.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(15), _cts.Token);
                if (!_isAtlasConnected)
                {
                    await SyncToAtlasIfAvailableAsync(_cts.Token);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch { }
        }
    }

    public async Task InitializeAndSeedAsync(CancellationToken cancellationToken = default)
    {
        var connected = await PingAsync(cancellationToken);
        if (!connected || _usersCollection == null)
        {
            return;
        }

        try
        {
            var indexKeysDefinition = Builders<User>.IndexKeys.Ascending(u => u.Email);
            var indexOptions = new CreateIndexOptions { Unique = true };
            var indexModel = new CreateIndexModel<User>(indexKeysDefinition, indexOptions);
            await _usersCollection.Indexes.CreateOneAsync(indexModel, cancellationToken: cancellationToken);

            var count = await _usersCollection.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
            if (count == 0)
            {
                _logger.LogInformation("Seeding default users into MongoDB collection 'users'...");

                var admin = new User
                {
                    Id = Guid.NewGuid(),
                    Name = "System Administrator",
                    Email = "admin@iotforge.io",
                    PasswordHash = PasswordHasher.HashPassword("AdminPassword123!"),
                    Role = UserRole.Admin,
                    ExperienceLevel = ExperienceLevel.Advanced,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Senior IoT Engineer",
                    Email = "engineer@iotforge.io",
                    PasswordHash = PasswordHasher.HashPassword("Password123!"),
                    Role = UserRole.User,
                    ExperienceLevel = ExperienceLevel.Intermediate,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _usersCollection.InsertManyAsync(new[] { admin, user }, cancellationToken: cancellationToken);
                _logger.LogInformation("MongoDB default users seeded successfully.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize/seed MongoDB collections.");
        }
    }

    public async Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        if (_usersCollection == null || !_isConnected) return null;
        var normalized = email.Trim().ToLowerInvariant();
        try
        {
            return await _usersCollection.Find(u => u.Email.ToLower() == normalized).FirstOrDefaultAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MongoDB GetUserByEmailAsync failed: {Message}", ex.Message);
            return null;
        }
    }

    public async Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (_usersCollection == null || !_isConnected) return null;
        try
        {
            return await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MongoDB GetUserByIdAsync failed: {Message}", ex.Message);
            return null;
        }
    }

    public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (_usersCollection == null || !_isConnected) return null;
        try
        {
            return await _usersCollection.Find(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiry > DateTime.UtcNow).FirstOrDefaultAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MongoDB GetUserByRefreshTokenAsync failed: {Message}", ex.Message);
            return null;
        }
    }

    public async Task CreateUserAsync(User user, CancellationToken cancellationToken = default)
    {
        if (_usersCollection == null || !_isConnected) return;
        try
        {
            await _usersCollection.InsertOneAsync(user, cancellationToken: cancellationToken);
            _logger.LogInformation("Successfully stored user in MongoDB '{Db}': {Email} ({Id})", _databaseName, user.Email, user.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MongoDB CreateUserAsync failed for {Email}: {Message}", user.Email, ex.Message);
        }
    }

    public async Task UpdateUserAsync(User user, CancellationToken cancellationToken = default)
    {
        if (_usersCollection == null || !_isConnected) return;
        try
        {
            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            _logger.LogInformation("Successfully updated user in MongoDB '{Db}': {Email}", _databaseName, user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MongoDB UpdateUserAsync failed for {Email}: {Message}", user.Email, ex.Message);
        }
    }

    public async Task<List<User>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        if (_usersCollection == null) return new List<User>();
        try
        {
            return await _usersCollection.Find(_ => true).ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve users from MongoDB");
            return new List<User>();
        }
    }

    public async Task<long> GetUserCountAsync(CancellationToken cancellationToken = default)
    {
        if (_usersCollection == null) return 0;
        try
        {
            return await _usersCollection.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to count users in MongoDB");
            return 0;
        }
    }

    public void Dispose()
    {
        _cts.Cancel();
        _cts.Dispose();
    }
}
