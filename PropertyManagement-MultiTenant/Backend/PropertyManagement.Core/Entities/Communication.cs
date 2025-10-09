using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Core.Entities;

public class Communication : TenantBaseEntity
{
    [Required]
    [StringLength(50)]
    public string Type { get; set; } = "Email";

    [StringLength(50)]
    public string Direction { get; set; } = "Outbound";

    [StringLength(200)]
    public string? Subject { get; set; }

    public string? Content { get; set; }

    public Guid? CustomerId { get; set; }
    public virtual Customer? Customer { get; set; }

    public DateTime CommunicationDate { get; set; } = DateTime.UtcNow;
}

