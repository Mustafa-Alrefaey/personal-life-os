using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class BillService
{
    private readonly BillRepository _repository;

    public BillService(BillRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Bill>> GetAllBillsAsync(string userId)
    {
        return await _repository.GetAllByUserIdAsync(userId);
    }

    public async Task<List<Bill>> GetUpcomingBillsAsync(string userId)
    {
        return await _repository.GetUpcomingBillsAsync(userId);
    }

    public async Task<Bill?> GetBillByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Bill> CreateBillAsync(CreateBillDto dto, string userId)
    {
        var bill = new Bill
        {
            Name = dto.Name,
            Amount = dto.Amount,
            DueDate = dto.DueDate,
            ReminderDaysBefore = dto.ReminderDaysBefore,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.PENDING
        };

        return await _repository.AddAsync(bill);
    }

    public async Task UpdateBillAsync(UpdateBillDto dto, string userId)
    {
        var bill = await _repository.GetByIdAsync(dto.Id);
        if (bill != null && bill.UserId == userId)
        {
            bill.Name = dto.Name;
            bill.Amount = dto.Amount;
            bill.DueDate = dto.DueDate;
            bill.ReminderDaysBefore = dto.ReminderDaysBefore;
            bill.StatusCode = dto.StatusCode;
            bill.UpdatedBy = userId;

            await _repository.UpdateAsync(bill);
        }
    }

    public async Task MarkBillAsPaidAsync(int id, string userId)
    {
        var bill = await _repository.GetByIdAsync(id);
        if (bill != null && bill.UserId == userId)
        {
            bill.StatusCode = "Paid";
            bill.UpdatedBy = userId;
            await _repository.UpdateAsync(bill);
        }
    }

    public async Task DeleteBillAsync(int id, string userId)
    {
        await _repository.DeleteAsync(id, userId);
    }
}
