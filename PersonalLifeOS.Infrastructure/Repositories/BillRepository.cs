using Microsoft.EntityFrameworkCore;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class BillRepository
{
    private readonly ApplicationDbContext _context;

    public BillRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Bill>> GetAllByUserIdAsync(string userId)
    {
        return await _context.Bills
            .Where(b => b.UserId == userId && b.StatusCode != GeneralStatuses.DELETED)
            .OrderBy(b => b.DueDate)
            .ToListAsync();
    }

    public async Task<Bill?> GetByIdAsync(int id)
    {
        return await _context.Bills
            .FirstOrDefaultAsync(b => b.Id == id && b.StatusCode != GeneralStatuses.DELETED);
    }

    public async Task<List<Bill>> GetUpcomingBillsAsync(string userId)
    {
        return await _context.Bills
            .Where(b => b.UserId == userId &&
                       b.StatusCode == GeneralStatuses.PENDING &&
                       b.DueDate >= DateTime.Now.Date)
            .OrderBy(b => b.DueDate)
            .Take(5)
            .ToListAsync();
    }

    public async Task<Bill> AddAsync(Bill bill)
    {
        bill.CreatedDate = DateTime.Now;
        _context.Bills.Add(bill);
        await _context.SaveChangesAsync();
        return bill;
    }

    public async Task UpdateAsync(Bill bill)
    {
        bill.UpdatedDate = DateTime.Now;
        _context.Bills.Update(bill);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var bill = await GetByIdAsync(id);
        if (bill != null && bill.UserId == userId)
        {
            bill.StatusCode = GeneralStatuses.DELETED;
            bill.UpdatedDate = DateTime.Now;
            bill.UpdatedBy = userId;
            await _context.SaveChangesAsync();
        }
    }
}
