using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Core.Entities;

public class SupportTicket : TenantBaseEntity
{
    [Required]
    [StringLength(50)]
    public string TicketNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Subject { get; set; } = string.Empty;

    public string? Description { get; set; }

    [StringLength(50)]
    public string Priority { get; set; } = "Medium";

    [StringLength(50)]
    public string Status { get; set; } = "Open";

    [StringLength(100)]
    public string? Category { get; set; }

    public Guid? CustomerId { get; set; }
    public virtual Customer? Customer { get; set; }

    public Guid? AssignedToId { get; set; }
    public virtual ApplicationUser? AssignedTo { get; set; }
}

