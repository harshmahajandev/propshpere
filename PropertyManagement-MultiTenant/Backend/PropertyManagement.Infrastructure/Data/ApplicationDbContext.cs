using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PropertyManagement.Core.Entities;

namespace PropertyManagement.Infrastructure.Data;

/// <summary>
/// Main Database Context with Multi-Tenant support
/// Automatically filters data by CompanyId for tenant isolation
/// </summary>
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    private readonly ITenantService? _tenantService;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantService? tenantService = null)
        : base(options)
    {
        _tenantService = tenantService;
    }

    // DbSets
    public DbSet<Company> Companies { get; set; }
    public DbSet<Property> Properties { get; set; }
    public DbSet<PropertyUnit> PropertyUnits { get; set; }
    public DbSet<Lead> Leads { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Communication> Communications { get; set; }
    public DbSet<SupportTicket> SupportTickets { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure Identity tables with Guid keys
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("Users");
            entity.HasOne(u => u.Company)
                .WithMany(c => c.Users)
                .HasForeignKey(u => u.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");

        // Company Configuration
        builder.Entity<Company>(entity =>
        {
            entity.HasIndex(c => c.CompanyCode).IsUnique();
            entity.HasIndex(c => c.ContactEmail);
        });

        // Configure all foreign keys to use Restrict delete behavior to prevent circular cascades
        foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        // Apply Multi-Tenant Query Filters
        ApplyTenantQueryFilters(builder);

        // Seed Initial Data
        SeedData(builder);
    }

    private void ApplyTenantQueryFilters(ModelBuilder builder)
    {
        // Apply global query filter for all tenant-based entities
        builder.Entity<Property>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<PropertyUnit>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<Lead>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<Customer>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<Reservation>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<Activity>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<Invoice>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<Communication>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
        builder.Entity<SupportTicket>().HasQueryFilter(e => e.CompanyId == _tenantService!.GetTenantId());
    }

    private void SeedData(ModelBuilder builder)
    {
        // Seed a demo company
        var demoCompanyId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        builder.Entity<Company>().HasData(new Company
        {
            Id = demoCompanyId,
            CompanyName = "Demo Real Estate Company",
            CompanyCode = "DEMO2024",
            Description = "Demo company for testing the multi-tenant property management system",
            Industry = "Real Estate",
            ContactEmail = "demo@realestate.com",
            ContactPhone = "+973-1234-5678",
            City = "Manama",
            Country = "Bahrain",
            IsActive = true,
            SubscriptionPlan = "Professional",
            MaxUsers = 20,
            MaxProperties = 500,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            SubscriptionStartDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            SubscriptionEndDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Automatically set CompanyId for new tenant entities
        if (_tenantService != null)
        {
            var tenantId = _tenantService.GetTenantId();
            
            foreach (var entry in ChangeTracker.Entries<TenantBaseEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CompanyId = tenantId;
                }
            }
        }

        // Auto-update timestamps
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

/// <summary>
/// Service to manage current tenant context
/// </summary>
public interface ITenantService
{
    Guid GetTenantId();
    void SetTenantId(Guid tenantId);
    string GetTenantCode();
}

