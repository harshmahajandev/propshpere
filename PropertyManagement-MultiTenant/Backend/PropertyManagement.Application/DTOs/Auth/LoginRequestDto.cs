using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Application.DTOs.Auth;

/// <summary>
/// Login Request - Company Code + Username + Password
/// </summary>
public class LoginRequestDto
{
    [Required(ErrorMessage = "Company code is required")]
    public string CompanyCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Username or email is required")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = false;
}

