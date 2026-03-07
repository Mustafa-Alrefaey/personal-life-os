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
            return Ok(ApiResponse<List<BillDto>>.SuccessResponse(bills, $"Retrieved {bills.Count} bills"));
        }
        catch (Exception ex) { return HandleException<List<BillDto>>(ex); }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BillDto>>> GetBillById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var bill = await _billService.GetBillByIdAsync(id, userId);
            return Ok(ApiResponse<BillDto>.SuccessResponse(bill, "Bill retrieved successfully"));
        }
        catch (Exception ex) { return HandleException<BillDto>(ex); }
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
                ApiResponse<BillDto>.SuccessResponse(bill, "Bill created successfully"));
        }
        catch (Exception ex) { return HandleException<BillDto>(ex); }
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
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch",
                new List<string> { "The ID in the URL does not match the ID in the request body" }));

        try
        {
            var userId = GetCurrentUserId();
            await _billService.UpdateBillAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Bill updated successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpPost("{id}/pay")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsPaid(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _billService.MarkBillAsPaidAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Bill marked as paid"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpPost("{id}/unpay")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsUnpaid(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _billService.MarkBillAsUnpaidAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Bill marked as unpaid"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBill(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _billService.DeleteBillAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Bill deleted successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }
}
