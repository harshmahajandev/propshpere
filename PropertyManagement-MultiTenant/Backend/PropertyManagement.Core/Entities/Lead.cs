using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.Core.Entities;

/// <summary>
/// Lead Entity - Represents potential customers in the CRM system
/// </summary>
public class Lead : TenantBaseEntity
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    public string FullName => $"{FirstName} {LastName}";

    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(50)]
    public string BuyerType { get; set; } = "Retail"; // HNI, Investor, Retail

    [StringLength(50)]
    public string Status { get; set; } = "Prospect"; // Prospect, Contacted, Viewing, Negotiation, Closed, Lost

    public int Score { get; set; } = 0; // AI Lead Score 0-100

    // Budget Information
    [Column(TypeName = "decimal(18,2)")]
    public decimal BudgetMin { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BudgetMax { get; set; }

    [StringLength(10)]
    public string BudgetCurrency { get; set; } = "BHD";

    // Property Preferences
    public string? PropertyInterest { get; set; } // JSON array: Villa, Commercial, Plot, etc.

    [StringLength(50)]
    public string Timeline { get; set; } = "3-6_months"; // Immediate, 3-6_months, 6-12_months, 12+_months

    [StringLength(10)]
    public string PreferredLanguage { get; set; } = "en"; // en, ar

    [StringLength(2000)]
    public string? Notes { get; set; }

    public DateTime? LastContactedAt { get; set; }
    public DateTime? NextFollowUpAt { get; set; }

    // AI Insights
    public string? AIInsights { get; set; } // JSON object with recommendations
    public double ConversionProbability { get; set; } = 0; // 0-1

    // Assignment
    public Guid? AssignedToId { get; set; }
    public virtual ApplicationUser? AssignedTo { get; set; }

    // Property Interest
    public Guid? InterestedPropertyId { get; set; }
    public virtual Property? InterestedProperty { get; set; }

    // Navigation Properties
    public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

