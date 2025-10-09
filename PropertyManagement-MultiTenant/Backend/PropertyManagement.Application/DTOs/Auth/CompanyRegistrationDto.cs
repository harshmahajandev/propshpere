using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Application.DTOs.Auth;

/// <summary>
/// Company Registration Request
/// </summary>
public class CompanyRegistrationDto
{
    [Required(ErrorMessage = "Company name is required")]
    [StringLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(200)]
    public string? Industry { get; set; }

    [Required(ErrorMessage = "Contact email is required")]
    [EmailAddress]
    [StringLength(100)]
    public string ContactEmail { get; set; } = string.Empty;

    [StringLength(20)]
    public string? ContactPhone { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    // Admin User Information
    [Required(ErrorMessage = "Admin first name is required")]
    [StringLength(100)]
    public string AdminFirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Admin last name is required")]
    [StringLength(100)]
    public string AdminLastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Admin email is required")]
    [EmailAddress]
    [StringLength(200)]
    public string AdminEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Admin username is required")]
    [StringLength(100)]
    public string AdminUsername { get; set; } = string.Empty;

    [Required(ErrorMessage = "Admin password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
    public string AdminPassword { get; set; } = string.Empty;

    [Compare("AdminPassword", ErrorMessage = "Passwords do not match")]
    public string AdminPasswordConfirm { get; set; } = string.Empty;
}

/// <summary>
/// Company Registration Response - Returns the unique company code
/// </summary>
public class CompanyRegistrationResponseDto
{
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public UserDto AdminUser { get; set; } = null!;
}

