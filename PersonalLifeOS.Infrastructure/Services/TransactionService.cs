using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class TransactionService
{
    private readonly TransactionRepository _repository;

    public TransactionService(TransactionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TransactionDto>> GetAllTransactionsAsync(string userId)
    {
        var transactions = await _repository.GetAllByUserIdAsync(userId);
        return transactions.Select(MapToDto).ToList();
    }

    public async Task<TransactionDto> GetTransactionByIdAsync(int id, string userId)
    {
        var transaction = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Transaction with ID {id} does not exist");
        if (transaction.UserId != userId)
            throw new UnauthorizedAccessException();
        return MapToDto(transaction);
    }

    public async Task<TransactionDto> CreateTransactionAsync(CreateTransactionDto dto, string userId)
    {
        var transaction = new Transaction
        {
            Amount = dto.Amount,
            Type = dto.Type,
            Category = dto.Category,
            Date = dto.Date,
            Notes = dto.Notes,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.ACTIVE
        };
        var created = await _repository.AddAsync(transaction);
        return MapToDto(created);
    }

    public async Task UpdateTransactionAsync(UpdateTransactionDto dto, string userId)
    {
        var transaction = await _repository.GetByIdAsync(dto.Id)
            ?? throw new KeyNotFoundException($"Transaction with ID {dto.Id} does not exist");
        if (transaction.UserId != userId)
            throw new UnauthorizedAccessException();

        transaction.Amount = dto.Amount;
        transaction.Type = dto.Type;
        transaction.Category = dto.Category;
        transaction.Date = dto.Date;
        transaction.Notes = dto.Notes;
        transaction.UpdatedBy = userId;
        await _repository.UpdateAsync(transaction);
    }

    public async Task DeleteTransactionAsync(int id, string userId)
    {
        var transaction = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Transaction with ID {id} does not exist");
        if (transaction.UserId != userId)
            throw new UnauthorizedAccessException();

        await _repository.DeleteAsync(id, userId);
    }

    internal static TransactionDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        Amount = t.Amount,
        Type = t.Type,
        Category = t.Category,
        Date = t.Date,
        Notes = t.Notes,
        StatusCode = t.StatusCode,
    };
}
