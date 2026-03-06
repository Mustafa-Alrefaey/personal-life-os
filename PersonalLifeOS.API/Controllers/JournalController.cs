using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JournalController : BaseApiController
{
    private readonly JournalService _journalService;

    public JournalController(JournalService journalService)
    {
        _journalService = journalService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<JournalDto>>>> GetAllJournals()
    {
        try
        {
            var userId = GetCurrentUserId();
            var journals = await _journalService.GetAllJournalsAsync(userId);
            var dtos = journals.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<JournalDto>>.SuccessResponse(dtos, $"Retrieved {dtos.Count} journal entries"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<JournalDto>>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<JournalDto>>> GetJournalById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var journal = await _journalService.GetJournalByIdAsync(id);
            if (journal == null)
                return NotFound(ApiResponse<JournalDto>.ErrorResponse("Entry not found", new List<string> { $"Journal with ID {id} does not exist" }));
            if (journal.UserId != userId)
                return Forbid();
            return Ok(ApiResponse<JournalDto>.SuccessResponse(MapToDto(journal), "Journal entry retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<JournalDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<JournalDto>>> CreateJournal([FromBody] CreateJournalDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<JournalDto>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var userId = GetCurrentUserId();
            var journal = await _journalService.CreateJournalAsync(dto, userId);
            return CreatedAtAction(nameof(GetJournalById), new { id = journal.Id },
                ApiResponse<JournalDto>.SuccessResponse(MapToDto(journal), "Journal entry created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<JournalDto>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateJournal(int id, [FromBody] UpdateJournalDto dto)
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
            var existing = await _journalService.GetJournalByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Entry not found", new List<string> { $"Journal with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _journalService.UpdateJournalAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Journal entry updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteJournal(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = await _journalService.GetJournalByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Entry not found", new List<string> { $"Journal with ID {id} does not exist" }));
            if (existing.UserId != userId)
                return Forbid();
            await _journalService.DeleteJournalAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Journal entry deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    private static JournalDto MapToDto(Domain.Entities.DailyJournal j) => new()
    {
        Id = j.Id,
        Date = j.Date,
        Notes = j.Notes,
        StatusCode = j.StatusCode,
        CreatedDate = j.CreatedDate
    };

}
