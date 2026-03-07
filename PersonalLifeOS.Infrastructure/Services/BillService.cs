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

    public async Task<List<BillDto>> GetAllBillsAsync(string userId)
    {
        var bills = await _repository.GetAllByUserIdAsync(userId);
        return bills.Select(MapToDto).ToList();
    }

    public async Task<BillDto> GetBillByIdAsync(int id, string userId)
    {
        var bill = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Bill with ID {id} does not exist");
        if (bill.UserId != userId)
            throw new UnauthorizedAccessException();
        return MapToDto(bill);
    }

    public async Task<BillDto> CreateBillAsync(CreateBillDto dto, string userId)
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
        var created = await _repository.AddAsync(bill);
        return MapToDto(created);
    }

    public async Task UpdateBillAsync(UpdateBillDto dto, string userId)
    {
        var bill = await _repository.GetByIdAsync(dto.Id)
            ?? throw new KeyNotFoundException($"Bill with ID {dto.Id} does not exist");
        if (bill.UserId != userId)
            throw new UnauthorizedAccessException();

        bill.Name = dto.Name;
        bill.Amount = dto.Amount;
        bill.DueDate = dto.DueDate;
        bill.ReminderDaysBefore = dto.ReminderDaysBefore;
        bill.StatusCode = dto.StatusCode;
        bill.UpdatedBy = userId;
        await _repository.UpdateAsync(bill);
    }

    public async Task MarkBillAsPaidAsync(int id, string userId)
    {
        var bill = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Bill with ID {id} does not exist");
        if (bill.UserId != userId)
            throw new UnauthorizedAccessException();

        bill.StatusCode = "Paid";
        bill.UpdatedBy = userId;
        await _repository.UpdateAsync(bill);
    }

    public async Task MarkBillAsUnpaidAsync(int id, string userId)
    {
        var bill = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Bill with ID {id} does not exist");
        if (bill.UserId != userId)
            throw new UnauthorizedAccessException();

        bill.StatusCode = GeneralStatuses.PENDING;
        bill.UpdatedBy = userId;
        await _repository.UpdateAsync(bill);
    }

    public async Task DeleteBillAsync(int id, string userId)
    {
        var bill = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Bill with ID {id} does not exist");
        if (bill.UserId != userId)
            throw new UnauthorizedAccessException();

        await _repository.DeleteAsync(id, userId);
    }

    internal static BillDto MapToDto(Bill b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Amount = b.Amount,
        DueDate = b.DueDate,
        StatusCode = b.StatusCode,
        ReminderDaysBefore = b.ReminderDaysBefore
    };
}
