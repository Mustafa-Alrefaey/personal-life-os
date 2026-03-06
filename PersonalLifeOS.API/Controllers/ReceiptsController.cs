using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReceiptsController : BaseApiController
{
    private readonly ReceiptService _receiptService;

    public ReceiptsController(ReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ReceiptDto>>>> GetAllReceipts()
    {
        try
        {
            var userId = GetCurrentUserId();
            var receipts = await _receiptService.GetAllReceiptsAsync(userId);
            var dtos = receipts.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<ReceiptDto>>.SuccessResponse(dtos, $"Retrieved {dtos.Count} receipts"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<ReceiptDto>>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ReceiptDto>>> GetReceiptById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var receipt = await _receiptService.GetReceiptByIdAsync(id);
            if (receipt == null)
                return NotFound(ApiResponse<ReceiptDto>.ErrorResponse("Receipt not found", new List<string> { $"Receipt with ID {id} does not exist" }));
            if (receipt.UserId != userId)
                return Forbid();
            return Ok(ApiResponse<ReceiptDto>.SuccessResponse(MapToDto(receipt), "Receipt retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ReceiptDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<ReceiptDto>>> CreateReceipt([FromForm] CreateReceiptDto dto, IFormFile imageFile)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<ReceiptDto>.ErrorResponse("Validation failed", errors));
        }

        if (imageFile == null || imageFile.Length == 0)
            return BadRequest(ApiResponse<ReceiptDto>.ErrorResponse("Validation failed", new List<string> { "An image file is required" }));

        try
        {
            var userId = GetCurrentUserId();
            var receipt = await _receiptService.CreateReceiptAsync(dto, imageFile, userId);
            return CreatedAtAction(nameof(GetReceiptById), new { id = receipt.Id },
                ApiResponse<ReceiptDto>.SuccessResponse(MapToDto(receipt), "Receipt created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ReceiptDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateReceipt(int id, [FromBody] UpdateReceiptDto dto)
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
            var existing = await _receiptService.GetReceiptByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Receipt not found", new List<string> { $"Receipt with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _receiptService.UpdateReceiptAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Receipt updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPut("{id}/image")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateReceiptImage(int id, IFormFile imageFile)
    {
        if (imageFile == null || imageFile.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", new List<string> { "An image file is required" }));

        try
        {
            var userId = GetCurrentUserId();
            var existing = await _receiptService.GetReceiptByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Receipt not found", new List<string> { $"Receipt with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _receiptService.UpdateReceiptImageAsync(id, imageFile, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Receipt image updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteReceipt(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = await _receiptService.GetReceiptByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Receipt not found", new List<string> { $"Receipt with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _receiptService.DeleteReceiptAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Receipt deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    private static ReceiptDto MapToDto(Domain.Entities.Receipt r) => new()
    {
        Id = r.Id,
        Title = r.Title,
        Amount = r.Amount,
        Date = r.Date,
        Category = r.Category,
        ImagePath = r.ImagePath,
        StatusCode = r.StatusCode,
        CreatedDate = r.CreatedDate
    };

}
