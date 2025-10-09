using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertyManagement.Core.Entities;
using PropertyManagement.Infrastructure.Data;

namespace PropertyManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PropertiesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PropertiesController> _logger;

    public PropertiesController(ApplicationDbContext context, ILogger<PropertiesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all properties for the current tenant
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProperties([FromQuery] string? status, [FromQuery] string? type, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Properties
                .Include(p => p.CreatedBy)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(p => p.PropertyType == type);
            }

            var total = await query.CountAsync();
            var properties = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = properties,
                pagination = new
                {
                    page,
                    pageSize,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving properties");
            return StatusCode(500, new { success = false, message = "Error retrieving properties" });
        }
    }

    /// <summary>
    /// Get property by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProperty(Guid id)
    {
        try
        {
            var property = await _context.Properties
                .Include(p => p.CreatedBy)
                .Include(p => p.Units)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (property == null)
            {
                return NotFound(new { success = false, message = "Property not found" });
            }

            return Ok(new { success = true, data = property });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving property");
            return StatusCode(500, new { success = false, message = "Error retrieving property" });
        }
    }

    /// <summary>
    /// Create new property
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProperty([FromBody] Property property)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId != null && Guid.TryParse(userId, out var userGuid))
            {
                property.CreatedById = userGuid;
            }

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProperty), new { id = property.Id },
                new { success = true, data = property, message = "Property created successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating property");
            return StatusCode(500, new { success = false, message = "Error creating property" });
        }
    }

    /// <summary>
    /// Update property
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProperty(Guid id, [FromBody] Property property)
    {
        try
        {
            var existingProperty = await _context.Properties.FindAsync(id);
            if (existingProperty == null)
            {
                return NotFound(new { success = false, message = "Property not found" });
            }

            // Update properties
            existingProperty.Title = property.Title;
            existingProperty.Description = property.Description;
            existingProperty.PropertyType = property.PropertyType;
            existingProperty.Status = property.Status;
            existingProperty.Price = property.Price;
            existingProperty.Size = property.Size;
            existingProperty.Bedrooms = property.Bedrooms;
            existingProperty.Bathrooms = property.Bathrooms;
            existingProperty.Location = property.Location;
            existingProperty.Project = property.Project;
            existingProperty.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = existingProperty, message = "Property updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating property");
            return StatusCode(500, new { success = false, message = "Error updating property" });
        }
    }

    /// <summary>
    /// Delete property
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProperty(Guid id)
    {
        try
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null)
            {
                return NotFound(new { success = false, message = "Property not found" });
            }

            property.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Property deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting property");
            return StatusCode(500, new { success = false, message = "Error deleting property" });
        }
    }

    /// <summary>
    /// Get property statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        try
        {
            var total = await _context.Properties.CountAsync();
            var available = await _context.Properties.CountAsync(p => p.Status == "Available");
            var reserved = await _context.Properties.CountAsync(p => p.Status == "Reserved");
            var sold = await _context.Properties.CountAsync(p => p.Status == "Sold");

            return Ok(new
            {
                success = true,
                data = new
                {
                    total,
                    available,
                    reserved,
                    sold,
                    byType = await _context.Properties
                        .GroupBy(p => p.PropertyType)
                        .Select(g => new { type = g.Key, count = g.Count() })
                        .ToListAsync()
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statistics");
            return StatusCode(500, new { success = false, message = "Error retrieving statistics" });
        }
    }
}

