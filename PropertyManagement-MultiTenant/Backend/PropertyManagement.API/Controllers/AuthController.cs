using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Application.DTOs.Auth;
using PropertyManagement.Application.Services;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// User login with Company Code + Username + Password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(new
            {
                success = true,
                data = response,
                message = "Login successful"
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred during login"
            });
        }
    }

    /// <summary>
    /// Register a new company with admin user
    /// Returns unique company code for future logins
    /// </summary>
    [HttpPost("register-company")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterCompany([FromBody] CompanyRegistrationDto request)
    {
        try
        {
            var response = await _authService.RegisterCompanyAsync(request);
            return Ok(new
            {
                success = true,
                data = response,
                message = "Company registered successfully"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during company registration");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred during registration"
            });
        }
    }

    /// <summary>
    /// Validate if a company code exists
    /// </summary>
    [HttpGet("validate-company-code/{companyCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateCompanyCode(string companyCode)
    {
        try
        {
            var isValid = await _authService.ValidateCompanyCodeAsync(companyCode);
            return Ok(new
            {
                success = true,
                data = new { isValid, companyCode },
                message = isValid ? "Company code is valid" : "Company code not found"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating company code");
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred during validation"
            });
        }
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var username = User.Identity?.Name;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var companyId = User.FindFirst("CompanyId")?.Value;
        var companyCode = User.FindFirst("CompanyCode")?.Value;
        var companyName = User.FindFirst("CompanyName")?.Value;
        var firstName = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value;
        var lastName = User.FindFirst(System.Security.Claims.ClaimTypes.Surname)?.Value;

        return Ok(new
        {
            success = true,
            data = new
            {
                id = userId,
                username,
                email,
                firstName,
                lastName,
                fullName = $"{firstName} {lastName}",
                role,
                companyId,
                companyCode,
                companyName
            }
        });
    }
}

