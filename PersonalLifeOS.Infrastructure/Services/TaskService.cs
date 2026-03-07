using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class TaskService
{
    private readonly TaskRepository _repository;

    public TaskService(TaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskDto>> GetAllTasksAsync(string userId)
    {
        var tasks = await _repository.GetAllByUserIdAsync(userId);
        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDto> GetTaskByIdAsync(int id, string userId)
    {
        var task = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Task with ID {id} does not exist");
        if (task.UserId != userId)
            throw new UnauthorizedAccessException();
        return MapToDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, string userId)
    {
        var task = new TaskEntity
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            Category = dto.Category,
            Priority = dto.Priority,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.PENDING
        };
        var created = await _repository.AddAsync(task);
        return MapToDto(created);
    }

    public async Task UpdateTaskAsync(UpdateTaskDto dto, string userId)
    {
        var task = await _repository.GetByIdAsync(dto.Id)
            ?? throw new KeyNotFoundException($"Task with ID {dto.Id} does not exist");
        if (task.UserId != userId)
            throw new UnauthorizedAccessException();

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.DueDate = dto.DueDate;
        task.Category = dto.Category;
        task.Priority = dto.Priority;
        task.StatusCode = dto.StatusCode;
        task.UpdatedBy = userId;
        await _repository.UpdateAsync(task);
    }

    public async Task CompleteTaskAsync(int id, string userId)
    {
        var task = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Task with ID {id} does not exist");
        if (task.UserId != userId)
            throw new UnauthorizedAccessException();

        task.StatusCode = GeneralStatuses.COMPLETED;
        task.UpdatedBy = userId;
        await _repository.UpdateAsync(task);
    }

    public async Task UncompleteTaskAsync(int id, string userId)
    {
        var task = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Task with ID {id} does not exist");
        if (task.UserId != userId)
            throw new UnauthorizedAccessException();

        task.StatusCode = GeneralStatuses.PENDING;
        task.UpdatedBy = userId;
        await _repository.UpdateAsync(task);
    }

    public async Task DeleteTaskAsync(int id, string userId)
    {
        var task = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Task with ID {id} does not exist");
        if (task.UserId != userId)
            throw new UnauthorizedAccessException();

        await _repository.DeleteAsync(id, userId);
    }

    internal static TaskDto MapToDto(TaskEntity t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        DueDate = t.DueDate,
        Category = t.Category,
        Priority = t.Priority,
        StatusCode = t.StatusCode,
        CreatedDate = t.CreatedDate
    };
}
