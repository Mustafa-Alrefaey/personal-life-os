using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : BaseApiController
{
    private readonly DashboardService _dashboardService;

    public DashboardController(DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardDto>>> GetDashboard()
    {
        try
        {
            var userId = GetCurrentUserId();
            var dto = await _dashboardService.GetDashboardAsync(userId);
            return Ok(ApiResponse<DashboardDto>.SuccessResponse(dto, "Dashboard data retrieved successfully"));
        }
        catch (Exception ex) { return HandleException<DashboardDto>(ex); }
    }
}
