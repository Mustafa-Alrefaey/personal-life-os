using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : BaseApiController
{
    private readonly TransactionService _transactionService;

    public TransactionsController(TransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetAllTransactions()
    {
        try
        {
            var userId = GetCurrentUserId();
            var transactions = await _transactionService.GetAllTransactionsAsync(userId);
            var dtos = transactions.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<TransactionDto>>.SuccessResponse(dtos, $"Retrieved {dtos.Count} transactions"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<TransactionDto>>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TransactionDto>>> GetTransactionById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var transaction = await _transactionService.GetTransactionByIdAsync(id);
            if (transaction == null)
                return NotFound(ApiResponse<TransactionDto>.ErrorResponse("Transaction not found", new List<string> { $"Transaction with ID {id} does not exist" }));
            if (transaction.UserId != userId)
                return Forbid();
            return Ok(ApiResponse<TransactionDto>.SuccessResponse(MapToDto(transaction), "Transaction retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<TransactionDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransactionDto>>> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<TransactionDto>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var userId = GetCurrentUserId();
            var transaction = await _transactionService.CreateTransactionAsync(dto, userId);
            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id },
                ApiResponse<TransactionDto>.SuccessResponse(MapToDto(transaction), "Transaction created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<TransactionDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateTransaction(int id, [FromBody] UpdateTransactionDto dto)
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
            var existing = await _transactionService.GetTransactionByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Transaction not found", new List<string> { $"Transaction with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _transactionService.UpdateTransactionAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Transaction updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTransaction(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = await _transactionService.GetTransactionByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Transaction not found", new List<string> { $"Transaction with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _transactionService.DeleteTransactionAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Transaction deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    private static TransactionDto MapToDto(Domain.Entities.Transaction t) => new()
    {
        Id = t.Id,
        Amount = t.Amount,
        Type = t.Type,
        Category = t.Category,
        Date = t.Date,
        Notes = t.Notes,
        StatusCode = t.StatusCode,
    };

}
