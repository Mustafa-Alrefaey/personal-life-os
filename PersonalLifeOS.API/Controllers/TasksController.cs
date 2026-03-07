using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : BaseApiController
{
    private readonly TaskService _taskService;

    public TasksController(TaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TaskDto>>>> GetAllTasks()
    {
        try
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetAllTasksAsync(userId);
            return Ok(ApiResponse<List<TaskDto>>.SuccessResponse(tasks, $"Retrieved {tasks.Count} tasks"));
        }
        catch (Exception ex) { return HandleException<List<TaskDto>>(ex); }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> GetTaskById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.GetTaskByIdAsync(id, userId);
            return Ok(ApiResponse<TaskDto>.SuccessResponse(task, "Task retrieved successfully"));
        }
        catch (Exception ex) { return HandleException<TaskDto>(ex); }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<TaskDto>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.CreateTaskAsync(dto, userId);
            return CreatedAtAction(nameof(GetTaskById), new { id = task.Id },
                ApiResponse<TaskDto>.SuccessResponse(task, "Task created successfully"));
        }
        catch (Exception ex) { return HandleException<TaskDto>(ex); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
        }

        if (id != dto.Id)
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch",
                new List<string> { "The ID in the URL does not match the ID in the request body" }));

        try
        {
            var userId = GetCurrentUserId();
            await _taskService.UpdateTaskAsync(dto, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Task updated successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _taskService.DeleteTaskAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Task deleted successfully"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult<ApiResponse<object>>> CompleteTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _taskService.CompleteTaskAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Task marked as complete"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }

    [HttpPost("{id}/uncomplete")]
    public async Task<ActionResult<ApiResponse<object>>> UncompleteTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _taskService.UncompleteTaskAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Task marked as pending"));
        }
        catch (Exception ex) { return HandleException<object>(ex); }
    }
}
