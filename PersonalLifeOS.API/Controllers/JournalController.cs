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
            return Ok(ApiResponse<List<JournalDto>>.SuccessResponse(journals, $"Retrieved {journals.Count} journal entries"));
        }
        catch (Exception ex) { return HandleException<List<JournalDto>>(ex); }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<JournalDto>>> GetJournalById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var journal = await _journalService.GetJournalByIdAsync(id, userId);
            return Ok(ApiResponse<JournalDto>.SuccessResponse(journal, "Journal entry retrieved successfully"));
        }
        catch (Exception ex) { return HandleException<JournalDto>(ex); }
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
                ApiResponse<JournalDto>.SuccessResponse(journal, "Journal entry created successfully"));
        }
        catch (Exception ex) { return HandleException<JournalDto>(ex); }
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
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch",
                new List<string> { "The ID in the URL does not match the ID in the request body" }));

        try
        {
            var userId = GetCurrentUserId();
            await _journalService.UpdateJournalAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Journal entry updated successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteJournal(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _journalService.DeleteJournalAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Journal entry deleted successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }
}
