using Microsoft.AspNetCore.Identity;

namespace PersonalLifeOS.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? PreferredLanguage { get; set; }
    public string StatusCode { get; set; } = "Active";

    // Audit fields
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedDate { get; set; }
}
