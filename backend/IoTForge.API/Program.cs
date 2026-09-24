using System.Text;
using FluentValidation;
using IoTForge.API.Middleware;
using IoTForge.Application.Interfaces;
using IoTForge.Application.Services;
using IoTForge.Application.Validators;
using IoTForge.Infrastructure.Ai;
using IoTForge.Infrastructure.Auth;
using IoTForge.Infrastructure.Data;
using IoTForge.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

// 0. Auto-load .env file if present
var currentDir = Directory.GetCurrentDirectory();
var envSearchPaths = new[]
{
    Path.Combine(currentDir, ".env"),
    Path.Combine(currentDir, "backend", ".env"),
    Path.Combine(currentDir, "..", ".env"),
    Path.Combine(currentDir, "..", "..", ".env"),
    Path.Combine(AppContext.BaseDirectory, ".env")
};

foreach (var envPath in envSearchPaths)
{
    if (File.Exists(envPath))
    {
        foreach (var line in File.ReadAllLines(envPath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#")) continue;
            var separatorIdx = trimmed.IndexOf('=');
            if (separatorIdx > 0)
            {
                var key = trimmed.Substring(0, separatorIdx).Trim();
                var val = trimmed.Substring(separatorIdx + 1).Trim().Trim('"', '\'');
                if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                {
                    Environment.SetEnvironmentVariable(key, val);
                }
            }
        }
        break;
    }
}

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (PostgreSQL)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
    ?? Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=iotforge;Username=planmytrip;Password=Password123!";

builder.Services.AddDbContext<IoTForgeDbContext>(options =>
{
    options.UseNpgsql(connectionString, b =>
    {
        b.MigrationsAssembly("IoTForge.Infrastructure");
        b.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
    });
});

// 2. Authentication & JWT Configuration
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? Environment.GetEnvironmentVariable("JWT_KEY")
    ?? builder.Configuration["Jwt:Secret"] 
    ?? builder.Configuration["Jwt:Key"]
    ?? "IoTForge_Super_Secret_Key_For_Production_Ready_SaaS_2026_Engineering_Grid!";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
    ?? builder.Configuration["Jwt:Issuer"] 
    ?? "IoTForge";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") 
    ?? builder.Configuration["Jwt:Audience"] 
    ?? "IoTForgeAudience";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 3. Application Services & Dependency Injection
builder.Services.AddHttpClient();
builder.Services.AddSingleton<JwtTokenGenerator>();
builder.Services.AddSingleton<IMongoDatabaseService, MongoDatabaseService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IComponentService, ComponentService>();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ICompatibilityValidator, CompatibilityValidator>();
builder.Services.AddScoped<IAiProjectGenerator, AiProjectGeneratorFactory>();

// 4. FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// 5. CORS
var allowedOrigins = (Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8080")
    .Split(',', StringSplitOptions.RemoveEmptyEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 6. Swagger with Bearer JWT Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "IoTForge SaaS Engineering API",
        Version = "v1",
        Description = "Production API for AI-Powered IoT Project Workspace, CAD Blueprint Generation, Pin-to-pin Netlists, and Hardware BOM Synthesis."
    });

    var schemeId = JwtBearerDefaults.AuthenticationScheme;
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition(schemeId, securityScheme);
    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference(schemeId),
            new List<string>()
        }
    });
});

var app = builder.Build();

// 7. Auto Database Migration / Initialization & Seeding
using (var scope = app.Services.CreateScope())
{
    var mongo = scope.ServiceProvider.GetRequiredService<IMongoDatabaseService>();
    try
    {
        await mongo.InitializeAndSeedAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "MongoDB initialization notice: {Message}", ex.Message);
    }

    var db = scope.ServiceProvider.GetRequiredService<IoTForgeDbContext>();
    try
    {
        db.Database.EnsureCreated();
        await SeedData.InitializeAsync(db);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during database creation/seeding.");
    }
}

// 8. Middleware Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "IoTForge API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("DefaultCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/system/database-status", async (HttpContext context, IMongoDatabaseService mongo) =>
{
    var isConnected = await mongo.PingAsync();
    var users = await mongo.GetAllUsersAsync();

    var responseObj = new
    {
        database = "MongoDB",
        connected = isConnected,
        databaseName = mongo.DatabaseName,
        collectionName = "users",
        totalUsersCount = users.Count,
        users = users.Select(u => new
        {
            id = u.Id,
            name = u.Name,
            email = u.Email,
            role = u.Role.ToString(),
            isActive = u.IsActive,
            createdAt = u.CreatedAt
        }).ToList(),
        atlasStatus = new
        {
            cluster = "cluster1234.nc9yrxm.mongodb.net",
            targetDatabase = mongo.DatabaseName,
            targetCollection = "users",
            connectedToAtlasCloud = mongo.IsAtlasConnected,
            currentStorage = mongo.IsAtlasConnected 
                ? "MongoDB Atlas Cloud Cluster" 
                : "Local MongoDB Instance (Data active & auto-syncing to Atlas)",
            serverPublicIp = "14.195.19.210",
            howToShowInAtlasDashboard = new[]
            {
                "1. Open https://cloud.mongodb.com and sign in.",
                "2. In the left navigation menu under 'Security', click 'Network Access'.",
                "3. Click '+ ADD IP ADDRESS'.",
                "4. Select 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0) or enter '14.195.19.210/32', then click 'Confirm'.",
                "5. Atlas will allow traffic within ~30s, and all users will display under database 'IOT_Project' -> collection 'users' in your Atlas Dashboard!"
            }
        },
        statusMessage = mongo.StatusMessage
    };

    var json = System.Text.Json.JsonSerializer.Serialize(responseObj, new System.Text.Json.JsonSerializerOptions
    {
        WriteIndented = true
    });

    context.Response.ContentType = "application/json; charset=utf-8";
    await context.Response.WriteAsync(json + "\n");
});

app.Run();

// Make Program accessible for WebApplicationFactory in integration tests
public partial class Program { }
