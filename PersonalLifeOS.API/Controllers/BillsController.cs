using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BillsController : BaseApiController
{
    private readonly BillService _billService;

    public BillsController(BillService billService)
    {
        _billService = billService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BillDto>>>> GetAllBills()
    {
        try
        {
            var userId = GetCurrentUserId();
            var bills = await _billService.GetAllBillsAsync(userId);
            var dtos = bills.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<BillDto>>.SuccessResponse(dtos, $"Retrieved {dtos.Count} bills"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<BillDto>>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BillDto>>> GetBillById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var bill = await _billService.GetBillByIdAsync(id);
            if (bill == null)
                return NotFound(ApiResponse<BillDto>.ErrorResponse("Bill not found", new List<string> { $"Bill with ID {id} does not exist" }));
            if (bill.UserId != userId)
                return Forbid();
            return Ok(ApiResponse<BillDto>.SuccessResponse(MapToDto(bill), "Bill retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<BillDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BillDto>>> CreateBill([FromBody] CreateBillDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<BillDto>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var userId = GetCurrentUserId();
            var bill = await _billService.CreateBillAsync(dto, userId);
            return CreatedAtAction(nameof(GetBillById), new { id = bill.Id },
                ApiResponse<BillDto>.SuccessResponse(MapToDto(bill), "Bill created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<BillDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateBill(int id, [FromBody] UpdateBillDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
        }

        if (id != dto.Id)
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch", new List<string> { "The ID in the URL does not match the ID in the request body" }));

        try
        {
            var userId = GetCurrentUserId();
            var existing = await _billService.GetBillByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Bill not found", new List<string> { $"Bill with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _billService.UpdateBillAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Bill updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPost("{id}/pay")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsPaid(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = await _billService.GetBillByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Bill not found", new List<string> { $"Bill with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _billService.MarkBillAsPaidAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Bill marked as paid"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBill(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = await _billService.GetBillByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Bill not found", new List<string> { $"Bill with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _billService.DeleteBillAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Bill deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    private static BillDto MapToDto(Domain.Entities.Bill b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Amount = b.Amount,
        DueDate = b.DueDate,
        StatusCode = b.StatusCode,
        ReminderDaysBefore = b.ReminderDaysBefore
    };

}
