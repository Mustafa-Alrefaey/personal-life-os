using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
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

    protected ActionResult HandleException<T>(Exception ex) => ex switch
    {
        KeyNotFoundException     => NotFound(ApiResponse<T>.ErrorResponse("Not found", new List<string> { ex.Message })),
        UnauthorizedAccessException => Forbid(),
        _ => StatusCode(500, ApiResponse<T>.ErrorResponse("An error occurred", new List<string> { ex.Message }))
    };
}
