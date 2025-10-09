using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyManagement.Core.Entities;

/// <summary>
/// Property Entity - Represents a property listing in the system
/// </summary>
public class Property : TenantBaseEntity
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(100)]
    public string PropertyType { get; set; } = "Villa"; // Villa, Apartment, Commercial, Plot, Warehouse

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Available"; // Available, Reserved, Sold, Maintenance

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [StringLength(10)]
    public string Currency { get; set; } = "BHD";

    public double Size { get; set; } // in sqm

    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }

    [StringLength(200)]
    public string? Location { get; set; }

    [StringLength(200)]
    public string? Project { get; set; }

    [StringLength(100)]
    public string? Island { get; set; }

    [StringLength(200)]
    public string? Address { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Additional Features
    public string? Amenities { get; set; } // JSON array of amenities
    public string? Images { get; set; } // JSON array of image URLs
    public string? FloorPlans { get; set; } // JSON array of floor plan URLs
    public string? Videos { get; set; } // JSON array of video URLs

    public int InterestScore { get; set; } = 0; // 0-100 based on lead matches

    public int ViewCount { get; set; } = 0;
    public int InquiryCount { get; set; } = 0;

    // Ownership
    public Guid CreatedById { get; set; }
    public virtual ApplicationUser CreatedBy { get; set; } = null!;

    // Navigation Properties
    public virtual ICollection<Lead> InterestedLeads { get; set; } = new List<Lead>();
    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public virtual ICollection<PropertyUnit> Units { get; set; } = new List<PropertyUnit>();
}

