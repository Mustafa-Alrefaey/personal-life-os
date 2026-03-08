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
            return Ok(ApiResponse<List<ReceiptDto>>.SuccessResponse(receipts, $"Retrieved {receipts.Count} receipts"));
        }
        catch (Exception ex) { return HandleException<List<ReceiptDto>>(ex); }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ReceiptDto>>> GetReceiptById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var receipt = await _receiptService.GetReceiptByIdAsync(id, userId);
            return Ok(ApiResponse<ReceiptDto>.SuccessResponse(receipt, "Receipt retrieved successfully"));
        }
        catch (Exception ex) { return HandleException<ReceiptDto>(ex); }
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 50 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<ReceiptDto>>> CreateReceipt([FromForm] CreateReceiptDto dto, IFormFile imageFile)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<ReceiptDto>.ErrorResponse("Validation failed", errors));
        }

        if (imageFile == null || imageFile.Length == 0)
            return BadRequest(ApiResponse<ReceiptDto>.ErrorResponse("Validation failed",
                new List<string> { "An image file is required" }));

        try
        {
            var userId = GetCurrentUserId();
            var receipt = await _receiptService.CreateReceiptAsync(dto, imageFile, userId);
            return CreatedAtAction(nameof(GetReceiptById), new { id = receipt.Id },
                ApiResponse<ReceiptDto>.SuccessResponse(receipt, "Receipt created successfully"));
        }
        catch (Exception ex) { return HandleException<ReceiptDto>(ex); }
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
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch",
                new List<string> { "The ID in the URL does not match the ID in the request body" }));

        try
        {
            var userId = GetCurrentUserId();
            await _receiptService.UpdateReceiptAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Receipt updated successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpPut("{id}/image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 50 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<object>>> UpdateReceiptImage(int id, IFormFile imageFile)
    {
        if (imageFile == null || imageFile.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed",
                new List<string> { "An image file is required" }));

        try
        {
            var userId = GetCurrentUserId();
            await _receiptService.UpdateReceiptImageAsync(id, imageFile, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Receipt image updated successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteReceipt(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _receiptService.DeleteReceiptAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Receipt deleted successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }
}
