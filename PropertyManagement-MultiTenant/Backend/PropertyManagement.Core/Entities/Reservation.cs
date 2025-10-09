using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.Core.Entities;

/// <summary>
/// Reservation Entity - Property bookings and reservations
/// </summary>
public class Reservation : TenantBaseEntity
{
    [Required]
    [StringLength(50)]
    public string ReservationNumber { get; set; } = string.Empty;

    public Guid PropertyId { get; set; }
    public virtual Property Property { get; set; } = null!;

    public Guid? LeadId { get; set; }
    public virtual Lead? Lead { get; set; }

    public Guid? CustomerId { get; set; }
    public virtual Customer? Customer { get; set; }

    [Required]
    [StringLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string CustomerEmail { get; set; } = string.Empty;

    [StringLength(20)]
    public string? CustomerPhone { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed, Expired

    public DateTime ReservationDate { get; set; } = DateTime.UtcNow;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public int HoldDuration { get; set; } = 7; // Days

    [Column(TypeName = "decimal(18,2)")]
    public decimal DepositAmount { get; set; } = 0;

    [StringLength(50)]
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Partial, Refunded

    [StringLength(2000)]
    public string? Notes { get; set; }

    [StringLength(500)]
    public string? CancellationReason { get; set; }

    public DateTime? CancelledAt { get; set; }
}

