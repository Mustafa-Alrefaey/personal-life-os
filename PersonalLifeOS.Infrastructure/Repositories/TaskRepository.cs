using Microsoft.EntityFrameworkCore;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class TaskRepository
{
    private readonly ApplicationDbContext _context;

    public TaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskEntity>> GetAllByUserIdAsync(string userId)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId && t.StatusCode != "Deleted")
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();
    }

    public async Task<TaskEntity?> GetByIdAsync(int id)
    {
        return await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.StatusCode != "Deleted");
    }

    public async Task<TaskEntity> AddAsync(TaskEntity task)
    {
        task.CreatedDate = DateTime.Now;
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task UpdateAsync(TaskEntity task)
    {
        task.UpdatedDate = DateTime.Now;
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id, string userId)
    {
        var task = await GetByIdAsync(id);
        if (task != null && task.UserId == userId)
        {
            task.StatusCode = "Deleted";
            task.UpdatedDate = DateTime.Now;
            task.UpdatedBy = userId;
            await _context.SaveChangesAsync();
        }
    }
}
