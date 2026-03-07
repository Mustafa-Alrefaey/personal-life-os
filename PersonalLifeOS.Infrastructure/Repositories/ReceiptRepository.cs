using Microsoft.EntityFrameworkCore;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class ReceiptRepository
{
    private readonly ApplicationDbContext _context;

    public ReceiptRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Receipt>> GetAllByUserIdAsync(string userId)
    {
        return await _context.Receipts
            .Where(r => r.UserId == userId && r.StatusCode != GeneralStatuses.DELETED)
            .OrderByDescending(r => r.Date)
            .ToListAsync();
    }

    public async Task<Receipt?> GetByIdAsync(int id)
    {
        return await _context.Receipts
            .FirstOrDefaultAsync(r => r.Id == id && r.StatusCode != GeneralStatuses.DELETED);
    }

    public async Task<Receipt> AddAsync(Receipt receipt)
    {
        receipt.CreatedDate = DateTime.Now;
        _context.Receipts.Add(receipt);
        await _context.SaveChangesAsync();
        return receipt;
    }

    public async Task UpdateAsync(Receipt receipt)
    {
        receipt.UpdatedDate = DateTime.Now;
        _context.Receipts.Update(receipt);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var receipt = await GetByIdAsync(id);
        if (receipt != null && receipt.UserId == userId)
        {
            receipt.StatusCode = GeneralStatuses.DELETED;
            receipt.UpdatedDate = DateTime.Now;
            receipt.UpdatedBy = userId;
            await _context.SaveChangesAsync();
        }
    }
}
