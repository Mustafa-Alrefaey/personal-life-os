using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class TransactionService
{
    private readonly TransactionRepository _repository;

    public TransactionService(TransactionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Transaction>> GetAllTransactionsAsync(string userId)
    {
        return await _repository.GetAllByUserIdAsync(userId);
    }

    public async Task<Transaction?> GetTransactionByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<decimal> GetMonthlyExpenseAsync(string userId, int year, int month)
    {
        return await _repository.GetMonthlyExpenseAsync(userId, year, month);
    }

    public async Task<Transaction> CreateTransactionAsync(CreateTransactionDto dto, string userId)
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
            StatusCode = "Active"
        };

        return await _repository.AddAsync(transaction);
    }

    public async Task UpdateTransactionAsync(UpdateTransactionDto dto, string userId)
    {
        var transaction = await _repository.GetByIdAsync(dto.Id);
        if (transaction != null && transaction.UserId == userId)
        {
            transaction.Amount = dto.Amount;
            transaction.Type = dto.Type;
            transaction.Category = dto.Category;
            transaction.Date = dto.Date;
            transaction.Notes = dto.Notes;
            transaction.UpdatedBy = userId;

            await _repository.UpdateAsync(transaction);
        }
    }

    public async Task DeleteTransactionAsync(int id, string userId)
    {
        await _repository.DeleteAsync(id, userId);
    }
}
