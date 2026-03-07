using Microsoft.EntityFrameworkCore;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class JournalRepository
{
    private readonly ApplicationDbContext _context;

    public JournalRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DailyJournal>> GetAllByUserIdAsync(string userId)
    {
        return await _context.DailyJournals
            .Where(j => j.UserId == userId && j.StatusCode != GeneralStatuses.DELETED)
            .OrderByDescending(j => j.Date)
            .ToListAsync();
    }

    public async Task<DailyJournal?> GetByIdAsync(int id)
    {
        return await _context.DailyJournals
            .FirstOrDefaultAsync(j => j.Id == id && j.StatusCode != GeneralStatuses.DELETED);
    }

    public async Task<DailyJournal?> GetByDateAsync(string userId, DateTime date)
    {
        return await _context.DailyJournals
            .FirstOrDefaultAsync(j => j.UserId == userId && j.Date.Date == date.Date && j.StatusCode != GeneralStatuses.DELETED);
    }

    public async Task<DailyJournal?> GetByDateIncludeDeletedAsync(string userId, DateTime date)
    {
        return await _context.DailyJournals
            .FirstOrDefaultAsync(j => j.UserId == userId && j.Date.Date == date.Date);
    }

    public async Task<DailyJournal> AddAsync(DailyJournal journal)
    {
        journal.CreatedDate = DateTime.Now;
        _context.DailyJournals.Add(journal);
        await _context.SaveChangesAsync();
        return journal;
    }

    public async Task UpdateAsync(DailyJournal journal)
    {
        journal.UpdatedDate = DateTime.Now;
        _context.DailyJournals.Update(journal);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var journal = await GetByIdAsync(id);
        if (journal != null && journal.UserId == userId)
        {
            journal.StatusCode = GeneralStatuses.DELETED;
            journal.UpdatedDate = DateTime.Now;
            journal.UpdatedBy = userId;
            await _context.SaveChangesAsync();
        }
    }
}
