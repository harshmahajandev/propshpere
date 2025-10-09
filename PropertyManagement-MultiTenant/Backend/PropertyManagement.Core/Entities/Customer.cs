using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.Core.Entities;

/// <summary>
/// Customer Entity - Converted leads or direct customers
/// </summary>
public class Customer : TenantBaseEntity
{
    [Required]
    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? Nationality { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(50)]
    public string CustomerType { get; set; } = "Individual"; // Individual, Corporate

    [StringLength(50)]
    public string RiskLevel { get; set; } = "Low"; // Low, Medium, High

    public string? Requirements { get; set; }

    public Guid? LinkedUserId { get; set; }
    public virtual ApplicationUser? LinkedUser { get; set; }

    // Financial Info
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPurchaseValue { get; set; } = 0;

    public int PropertiesPurchased { get; set; } = 0;

    // Navigation Properties
    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public virtual ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();
    public virtual ICollection<Communication> Communications { get; set; } = new List<Communication>();
}

