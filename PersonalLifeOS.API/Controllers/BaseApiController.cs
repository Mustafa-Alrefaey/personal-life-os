using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected string GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedAccessException("User ID not found in token");
        return userId;
    }
}
