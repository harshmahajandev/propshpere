using Microsoft.AspNetCore.Http;
using PropertyManagement.Infrastructure.Data;
using System.Security.Claims;

namespace PropertyManagement.Infrastructure.Services;

/// <summary>
/// Implementation of Tenant Service for managing multi-tenant context
/// Retrieves tenant information from the current user's claims
/// </summary>
public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid _tenantId;
    private string _tenantCode = string.Empty;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetTenantId()
    {
        if (_tenantId != Guid.Empty)
            return _tenantId;

        var user = _httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            var tenantIdClaim = user.FindFirst("CompanyId")?.Value;
            if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                _tenantId = tenantId;
                return _tenantId;
            }
        }

        return Guid.Empty;
    }

    public void SetTenantId(Guid tenantId)
    {
        _tenantId = tenantId;
    }

    public string GetTenantCode()
    {
        if (!string.IsNullOrEmpty(_tenantCode))
            return _tenantCode;

        var user = _httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            _tenantCode = user.FindFirst("CompanyCode")?.Value ?? string.Empty;
        }

        return _tenantCode;
    }
}

