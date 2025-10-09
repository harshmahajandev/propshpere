using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Core.Entities;

public class PropertyUnit : TenantBaseEntity
{
    [Required]
    [StringLength(50)]
    public string UnitNumber { get; set; } = string.Empty;

    public Guid PropertyId { get; set; }
    public virtual Property Property { get; set; } = null!;

    [StringLength(50)]
    public string Status { get; set; } = "Available";

    public double? Size { get; set; }
    public int? Floor { get; set; }
}

