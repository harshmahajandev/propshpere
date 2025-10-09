using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Core.Entities;

/// <summary>
/// Application User - Extends IdentityUser with company/tenant relationship
/// Users log in with: Company Code + Username + Password
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    public string FullName => $"{FirstName} {LastName}";

    // Multi-tenant relationship
    public Guid CompanyId { get; set; }
    public virtual Company Company { get; set; } = null!;

    // User Role within company
    [StringLength(50)]
    public string Role { get; set; } = "User"; // Admin, Manager, SalesRep, User, Customer

    public bool IsActive { get; set; } = true;

    [StringLength(20)]
    public string? PhoneNumber2 { get; set; }

    [StringLength(100)]
    public string? Department { get; set; }

    [StringLength(100)]
    public string? JobTitle { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    [StringLength(500)]
    public string? ProfileImageUrl { get; set; }

    // Navigation Properties
    public virtual ICollection<Property> CreatedProperties { get; set; } = new List<Property>();
    public virtual ICollection<Lead> AssignedLeads { get; set; } = new List<Lead>();
}

