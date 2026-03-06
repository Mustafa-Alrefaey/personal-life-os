using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class TaskService
{
    private readonly TaskRepository _repository;

    public TaskService(TaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskEntity>> GetAllTasksAsync(string userId)
    {
        return await _repository.GetAllByUserIdAsync(userId);
    }

    public async Task<TaskEntity?> GetTaskByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<TaskEntity> CreateTaskAsync(CreateTaskDto dto, string userId)
    {
        var task = new TaskEntity
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            Category = dto.Category,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = "Pending"
        };

        return await _repository.AddAsync(task);
    }

    public async Task UpdateTaskAsync(UpdateTaskDto dto, string userId)
    {
        var task = await _repository.GetByIdAsync(dto.Id);
        if (task != null && task.UserId == userId)
        {
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.DueDate = dto.DueDate;
            task.Category = dto.Category;
            task.StatusCode = dto.StatusCode;
            task.UpdatedBy = userId;

            await _repository.UpdateAsync(task);
        }
    }

    public async Task CompleteTaskAsync(int id, string userId)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task != null && task.UserId == userId)
        {
            task.StatusCode = "Completed";
            task.UpdatedBy = userId;
            await _repository.UpdateAsync(task);
        }
    }

    public async Task DeleteTaskAsync(int id, string userId)
    {
        await _repository.DeleteAsync(id, userId);
    }
}
