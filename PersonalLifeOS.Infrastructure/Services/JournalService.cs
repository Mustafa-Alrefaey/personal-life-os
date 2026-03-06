using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class JournalService
{
    private readonly JournalRepository _repository;

    public JournalService(JournalRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<DailyJournal>> GetAllJournalsAsync(string userId)
    {
        return await _repository.GetAllByUserIdAsync(userId);
    }

    public async Task<DailyJournal?> GetJournalByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<DailyJournal> CreateJournalAsync(CreateJournalDto dto, string userId)
    {
        // Check if a soft-deleted entry exists for this date and reactivate it
        var existing = await _repository.GetByDateIncludeDeletedAsync(userId, dto.Date.Date);
        if (existing != null)
        {
            existing.Notes = dto.Notes;
            existing.StatusCode = "Active";
            existing.UpdatedBy = userId;
            await _repository.UpdateAsync(existing);
            return existing;
        }

        var journal = new DailyJournal
        {
            Date = dto.Date.Date,
            Notes = dto.Notes,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = "Active"
        };

        return await _repository.AddAsync(journal);
    }

    public async Task UpdateJournalAsync(UpdateJournalDto dto, string userId)
    {
        var journal = await _repository.GetByIdAsync(dto.Id);
        if (journal != null && journal.UserId == userId)
        {
            journal.Date = dto.Date.Date;
            journal.Notes = dto.Notes;
            journal.UpdatedBy = userId;

            await _repository.UpdateAsync(journal);
        }
    }

    public async Task DeleteJournalAsync(int id, string userId)
    {
        await _repository.DeleteAsync(id, userId);
    }
}
