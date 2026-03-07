using Microsoft.EntityFrameworkCore;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class TransactionRepository
{
    private readonly ApplicationDbContext _context;

    public TransactionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Transaction>> GetAllByUserIdAsync(string userId)
    {
        return await _context.Transactions
            .Where(t => t.UserId == userId && t.StatusCode != GeneralStatuses.DELETED)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(int id)
    {
        return await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.StatusCode != GeneralStatuses.DELETED);
    }

    public async Task<decimal> GetMonthlyExpenseAsync(string userId, int year, int month)
    {
        return await _context.Transactions
            .Where(t => t.UserId == userId &&
                       t.Type == Domain.Enums.TransactionType.Expense &&
                       t.Date.Year == year &&
                       t.Date.Month == month &&
                       t.StatusCode != GeneralStatuses.DELETED)
            .SumAsync(t => t.Amount);
    }

    public async Task<Transaction> AddAsync(Transaction transaction)
    {
        transaction.CreatedDate = DateTime.Now;
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task UpdateAsync(Transaction transaction)
    {
        transaction.UpdatedDate = DateTime.Now;
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var transaction = await GetByIdAsync(id);
        if (transaction != null && transaction.UserId == userId)
        {
            transaction.StatusCode = GeneralStatuses.DELETED;
            transaction.UpdatedDate = DateTime.Now;
            transaction.UpdatedBy = userId;
            await _context.SaveChangesAsync();
        }
    }
}
