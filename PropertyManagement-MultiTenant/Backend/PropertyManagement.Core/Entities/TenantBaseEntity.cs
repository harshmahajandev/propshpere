namespace PropertyManagement.Core.Entities;

/// <summary>
/// Base entity for all multi-tenant entities
/// Ensures data isolation by company/tenant
/// </summary>
public abstract class TenantBaseEntity : BaseEntity
{
    public Guid CompanyId { get; set; }
    public virtual Company Company { get; set; } = null!;
}

