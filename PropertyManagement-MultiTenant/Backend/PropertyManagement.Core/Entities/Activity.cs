using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Core.Entities;

public class Activity : TenantBaseEntity
{
    [Required]
    [StringLength(50)]
    public string ActivityType { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Subject { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    public Guid? LeadId { get; set; }
    public virtual Lead? Lead { get; set; }

    public Guid? UserId { get; set; }
    public virtual ApplicationUser? User { get; set; }

    public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
}

