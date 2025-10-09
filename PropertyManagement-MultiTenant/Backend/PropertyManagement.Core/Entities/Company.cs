using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Core.Entities;

/// <summary>
/// Company entity - Represents a tenant in the multi-tenant system
/// Each company gets a unique code for user authentication
/// </summary>
public class Company : BaseEntity
{
    [Required]
    [StringLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string CompanyCode { get; set; } = string.Empty; // Unique identifier for login

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(200)]
    public string? Industry { get; set; }

    [StringLength(100)]
    public string? ContactEmail { get; set; }

    [StringLength(20)]
    public string? ContactPhone { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    public bool IsActive { get; set; } = true;

    // Subscription/License Information
    public DateTime SubscriptionStartDate { get; set; } = DateTime.UtcNow;
    public DateTime? SubscriptionEndDate { get; set; }

    [StringLength(50)]
    public string SubscriptionPlan { get; set; } = "Trial"; // Trial, Basic, Professional, Enterprise

    public int MaxUsers { get; set; } = 5;
    public int MaxProperties { get; set; } = 50;

    // Navigation Properties
    public virtual ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
    public virtual ICollection<Property> Properties { get; set; } = new List<Property>();
    public virtual ICollection<Lead> Leads { get; set; } = new List<Lead>();
    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();
}

