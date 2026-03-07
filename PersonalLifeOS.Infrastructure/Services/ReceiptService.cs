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

    public async Task<List<Receipt>> GetAllReceiptsAsync(string userId)
    {
        return await _repository.GetAllByUserIdAsync(userId);
    }

    public async Task<Receipt?> GetReceiptByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Receipt> CreateReceiptAsync(CreateReceiptDto dto, IFormFile imageFile, string userId)
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

        return await _repository.AddAsync(receipt);
    }

    public async Task UpdateReceiptAsync(UpdateReceiptDto dto, string userId)
    {
        var receipt = await _repository.GetByIdAsync(dto.Id);
        if (receipt != null && receipt.UserId == userId)
        {
            receipt.Title = dto.Title;
            receipt.Amount = dto.Amount;
            receipt.Date = dto.Date;
            receipt.Category = dto.Category;
            receipt.UpdatedBy = userId;

            await _repository.UpdateAsync(receipt);
        }
    }

    public async Task UpdateReceiptImageAsync(int id, IFormFile imageFile, string userId)
    {
        var receipt = await _repository.GetByIdAsync(id);
        if (receipt != null && receipt.UserId == userId)
        {
            _fileStorage.DeleteFile(receipt.ImagePath);
            var newPath = await _fileStorage.SaveFileAsync(imageFile.OpenReadStream(), imageFile.FileName);
            receipt.ImagePath = newPath;
            receipt.UpdatedBy = userId;
            await _repository.UpdateAsync(receipt);
        }
    }

    public async Task DeleteReceiptAsync(int id, string userId)
    {
        var receipt = await _repository.GetByIdAsync(id);
        if (receipt != null && receipt.UserId == userId)
        {
            _fileStorage.DeleteFile(receipt.ImagePath);
            await _repository.DeleteAsync(id, userId);
        }
    }
}
