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
            return Ok(ApiResponse<List<TransactionDto>>.SuccessResponse(transactions, $"Retrieved {transactions.Count} transactions"));
        }
        catch (Exception ex) { return HandleException<List<TransactionDto>>(ex); }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TransactionDto>>> GetTransactionById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var transaction = await _transactionService.GetTransactionByIdAsync(id, userId);
            return Ok(ApiResponse<TransactionDto>.SuccessResponse(transaction, "Transaction retrieved successfully"));
        }
        catch (Exception ex) { return HandleException<TransactionDto>(ex); }
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
                ApiResponse<TransactionDto>.SuccessResponse(transaction, "Transaction created successfully"));
        }
        catch (Exception ex) { return HandleException<TransactionDto>(ex); }
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
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch",
                new List<string> { "The ID in the URL does not match the ID in the request body" }));

        try
        {
            var userId = GetCurrentUserId();
            await _transactionService.UpdateTransactionAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Transaction updated successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTransaction(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _transactionService.DeleteTransactionAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Transaction deleted successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }
}
