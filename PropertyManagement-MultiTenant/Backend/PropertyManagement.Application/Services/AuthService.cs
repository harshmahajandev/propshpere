using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PropertyManagement.Application.DTOs.Auth;
using PropertyManagement.Core.Entities;
using PropertyManagement.Infrastructure.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PropertyManagement.Application.Services;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<CompanyRegistrationResponseDto> RegisterCompanyAsync(CompanyRegistrationDto request);
    Task<bool> ValidateCompanyCodeAsync(string companyCode);
}

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration)
    {
        _context = context;
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        // Step 1: Validate company code
        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.CompanyCode == request.CompanyCode && c.IsActive);

        if (company == null)
        {
            throw new UnauthorizedAccessException("Invalid company code");
        }

        // Step 2: Find user by username or email within the company
        var user = await _userManager.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u =>
                u.CompanyId == company.Id &&
                (u.UserName == request.Username || u.Email == request.Username) &&
                u.IsActive);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Step 3: Validate password
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Step 4: Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Step 5: Generate JWT token
        var token = await GenerateJwtToken(user);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Role = user.Role,
                CompanyId = user.CompanyId,
                CompanyName = user.Company.CompanyName,
                CompanyCode = user.Company.CompanyCode
            }
        };
    }

    public async Task<CompanyRegistrationResponseDto> RegisterCompanyAsync(CompanyRegistrationDto request)
    {
        // Step 1: Generate unique company code
        var companyCode = await GenerateUniqueCompanyCode(request.CompanyName);

        // Step 2: Create company
        var company = new Company
        {
            Id = Guid.NewGuid(),
            CompanyName = request.CompanyName,
            CompanyCode = companyCode,
            Description = request.Description,
            Industry = request.Industry,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Address = request.Address,
            City = request.City,
            Country = request.Country,
            IsActive = true,
            SubscriptionPlan = "Trial",
            SubscriptionStartDate = DateTime.UtcNow,
            SubscriptionEndDate = DateTime.UtcNow.AddDays(30), // 30-day trial
            MaxUsers = 5,
            MaxProperties = 50
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        // Step 3: Create admin user
        var adminUser = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.AdminUsername,
            Email = request.AdminEmail,
            EmailConfirmed = true,
            FirstName = request.AdminFirstName,
            LastName = request.AdminLastName,
            CompanyId = company.Id,
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(adminUser, request.AdminPassword);

        if (!createResult.Succeeded)
        {
            // Rollback company creation
            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create admin user: {errors}");
        }

        return new CompanyRegistrationResponseDto
        {
            CompanyId = company.Id,
            CompanyName = company.CompanyName,
            CompanyCode = company.CompanyCode,
            Message = $"Company registered successfully! Your unique company code is: {companyCode}. Please save this code as it will be required for login.",
            AdminUser = new UserDto
            {
                Id = adminUser.Id,
                Username = adminUser.UserName ?? string.Empty,
                Email = adminUser.Email ?? string.Empty,
                FirstName = adminUser.FirstName,
                LastName = adminUser.LastName,
                FullName = adminUser.FullName,
                Role = adminUser.Role,
                CompanyId = adminUser.CompanyId,
                CompanyName = company.CompanyName,
                CompanyCode = company.CompanyCode
            }
        };
    }

    public async Task<bool> ValidateCompanyCodeAsync(string companyCode)
    {
        return await _context.Companies.AnyAsync(c => c.CompanyCode == companyCode && c.IsActive);
    }

    private async Task<string> GenerateUniqueCompanyCode(string companyName)
    {
        // Generate code from company name (first 4 letters + 4 random digits)
        var prefix = new string(companyName.Where(char.IsLetter).Take(4).ToArray()).ToUpper();
        if (prefix.Length < 4)
        {
            prefix = prefix.PadRight(4, 'X');
        }

        string companyCode;
        bool exists;

        do
        {
            var random = new Random().Next(1000, 9999);
            companyCode = $"{prefix}{random}";
            exists = await _context.Companies.AnyAsync(c => c.CompanyCode == companyCode);
        }
        while (exists);

        return companyCode;
    }

    private async Task<string> GenerateJwtToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("CompanyId", user.CompanyId.ToString()),
            new Claim("CompanyCode", user.Company.CompanyCode),
            new Claim("CompanyName", user.Company.CompanyName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["JwtSettings:SecretKey"] ?? "YourSuperSecretKeyHereThatIsAtLeast32CharactersLong!"));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"] ?? "PropertyManagementAPI",
            audience: _configuration["JwtSettings:Audience"] ?? "PropertyManagementClient",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

