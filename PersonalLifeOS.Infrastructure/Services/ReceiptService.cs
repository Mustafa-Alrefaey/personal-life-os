using Microsoft.AspNetCore.Http;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.FileStorage;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class ReceiptService
{
    private readonly ReceiptRepository _repository;
    private readonly FileStorageService _fileStorage;

    public ReceiptService(ReceiptRepository repository, FileStorageService fileStorage)
    {
        _repository = repository;
        _fileStorage = fileStorage;
    }

    public async Task<List<ReceiptDto>> GetAllReceiptsAsync(string userId)
    {
        var receipts = await _repository.GetAllByUserIdAsync(userId);
        return receipts.Select(MapToDto).ToList();
    }

    public async Task<ReceiptDto> GetReceiptByIdAsync(int id, string userId)
    {
        var receipt = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Receipt with ID {id} does not exist");
        if (receipt.UserId != userId)
            throw new UnauthorizedAccessException();
        return MapToDto(receipt);
    }

    public async Task<ReceiptDto> CreateReceiptAsync(CreateReceiptDto dto, IFormFile imageFile, string userId)
    {
        var imagePath = await _fileStorage.SaveFileAsync(imageFile.OpenReadStream(), imageFile.FileName);

        var receipt = new Receipt
        {
            Title = dto.Title,
            Amount = dto.Amount,
            Date = dto.Date,
            Category = dto.Category,
            ImagePath = imagePath,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.ACTIVE
        };

        var created = await _repository.AddAsync(receipt);
        return MapToDto(created);
    }

    public async Task UpdateReceiptAsync(UpdateReceiptDto dto, string userId)
    {
        var receipt = await _repository.GetByIdAsync(dto.Id)
            ?? throw new KeyNotFoundException($"Receipt with ID {dto.Id} does not exist");
        if (receipt.UserId != userId)
            throw new UnauthorizedAccessException();

        receipt.Title = dto.Title;
        receipt.Amount = dto.Amount;
        receipt.Date = dto.Date;
        receipt.Category = dto.Category;
        receipt.UpdatedBy = userId;
        await _repository.UpdateAsync(receipt);
    }

    public async Task UpdateReceiptImageAsync(int id, IFormFile imageFile, string userId)
    {
        var receipt = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Receipt with ID {id} does not exist");
        if (receipt.UserId != userId)
            throw new UnauthorizedAccessException();

        _fileStorage.DeleteFile(receipt.ImagePath);
        var newPath = await _fileStorage.SaveFileAsync(imageFile.OpenReadStream(), imageFile.FileName);
        receipt.ImagePath = newPath;
        receipt.UpdatedBy = userId;
        await _repository.UpdateAsync(receipt);
    }

    public async Task DeleteReceiptAsync(int id, string userId)
    {
        var receipt = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Receipt with ID {id} does not exist");
        if (receipt.UserId != userId)
            throw new UnauthorizedAccessException();

        _fileStorage.DeleteFile(receipt.ImagePath);
        await _repository.DeleteAsync(id, userId);
    }

    internal static ReceiptDto MapToDto(Receipt r) => new()
    {
        Id = r.Id,
        Title = r.Title,
        Amount = r.Amount,
        Date = r.Date,
        Category = r.Category,
        ImagePath = r.ImagePath,
        StatusCode = r.StatusCode,
        CreatedDate = r.CreatedDate
    };
}
