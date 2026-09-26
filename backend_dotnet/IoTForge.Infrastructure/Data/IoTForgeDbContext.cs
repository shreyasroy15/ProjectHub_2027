using IoTForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IoTForge.Infrastructure.Data;

public class IoTForgeDbContext : DbContext
{
    public IoTForgeDbContext(DbContextOptions<IoTForgeDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Component> Components => Set<Component>();
    public DbSet<ProjectComponent> ProjectComponents => Set<ProjectComponent>();
    public DbSet<Connection> Connections => Set<Connection>();
    public DbSet<ArchitectureNode> ArchitectureNodes => Set<ArchitectureNode>();
    public DbSet<ArchitectureConnection> ArchitectureConnections => Set<ArchitectureConnection>();
    public DbSet<CodeArtifact> CodeArtifacts => Set<CodeArtifact>();
    public DbSet<BuildStep> BuildSteps => Set<BuildStep>();
    public DbSet<TestCase> TestCases => Set<TestCase>();
    public DbSet<ProjectMessage> ProjectMessages => Set<ProjectMessage>();
    public DbSet<ProjectVersion> ProjectVersions => Set<ProjectVersion>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<PurchaseLink> PurchaseLinks => Set<PurchaseLink>();
    public DbSet<ProjectTemplate> ProjectTemplates => Set<ProjectTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User indexes & configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.Property(u => u.Name).HasMaxLength(100).IsRequired();
        });

        // Project configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasIndex(p => p.UserId);
            entity.Property(p => p.Title).HasMaxLength(200).IsRequired();
            entity.Property(p => p.EstimatedCost).HasPrecision(18, 2);

            entity.HasOne(p => p.User)
                  .WithMany(u => u.Projects)
                  .HasForeignKey(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.Components)
                  .WithOne(c => c.Project)
                  .HasForeignKey(c => c.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.Connections)
                  .WithOne(c => c.Project)
                  .HasForeignKey(c => c.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.CodeArtifacts)
                  .WithOne(c => c.Project)
                  .HasForeignKey(c => c.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.BuildSteps)
                  .WithOne(s => s.Project)
                  .HasForeignKey(s => s.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.TestCases)
                  .WithOne(t => t.Project)
                  .HasForeignKey(t => t.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.Messages)
                  .WithOne(m => m.Project)
                  .HasForeignKey(m => m.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.Versions)
                  .WithOne(v => v.Project)
                  .HasForeignKey(v => v.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.ArchitectureNodes)
                  .WithOne(n => n.Project)
                  .HasForeignKey(n => n.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.ArchitectureConnections)
                  .WithOne(c => c.Project)
                  .HasForeignKey(c => c.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Component & PurchaseLink configuration
        modelBuilder.Entity<Component>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(150).IsRequired();
            entity.Property(c => c.EstimatedPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<ProjectComponent>(entity =>
        {
            entity.Property(pc => pc.UnitPrice).HasPrecision(18, 2);
            entity.Property(pc => pc.VerifiedPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<PurchaseLink>(entity =>
        {
            entity.Property(pl => pl.CurrentPrice).HasPrecision(18, 2);
            entity.HasOne(pl => pl.Component)
                  .WithMany(c => c.PurchaseLinks)
                  .HasForeignKey(pl => pl.ComponentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(pl => pl.Vendor)
                  .WithMany(v => v.PurchaseLinks)
                  .HasForeignKey(pl => pl.VendorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProjectTemplate>(entity =>
        {
            entity.Property(t => t.Title).HasMaxLength(200).IsRequired();
            entity.Property(t => t.EstimatedCost).HasPrecision(18, 2);
        });
    }
}
