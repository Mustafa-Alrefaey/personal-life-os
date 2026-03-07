using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Require JWT authentication for all endpoints
public class TasksController : BaseApiController
{
    private readonly TaskService _taskService;

    public TasksController(TaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// Get all tasks for the authenticated user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TaskDto>>>> GetAllTasks()
    {
        try
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetAllTasksAsync(userId);

            var taskDtos = tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                Category = t.Category,
                Priority = t.Priority,
                StatusCode = t.StatusCode,
                CreatedDate = t.CreatedDate
            }).ToList();

            return Ok(ApiResponse<List<TaskDto>>.SuccessResponse(
                taskDtos,
                $"Retrieved {taskDtos.Count} tasks"
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<TaskDto>>.ErrorResponse(
                "An error occurred while retrieving tasks",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Get a specific task by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> GetTaskById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.GetTaskByIdAsync(id);

            if (task == null)
            {
                return NotFound(ApiResponse<TaskDto>.ErrorResponse(
                    "Task not found",
                    new List<string> { $"Task with ID {id} does not exist" }
                ));
            }

            // Ensure user owns this task
            if (task.UserId != userId)
            {
                return Forbid();
            }

            var taskDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Category = task.Category,
                Priority = task.Priority,
                StatusCode = task.StatusCode,
                CreatedDate = task.CreatedDate
            };

            return Ok(ApiResponse<TaskDto>.SuccessResponse(taskDto, "Task retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<TaskDto>.ErrorResponse(
                "An error occurred while retrieving the task",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<TaskDto>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.CreateTaskAsync(dto, userId);

            var taskDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Category = task.Category,
                Priority = task.Priority,
                StatusCode = task.StatusCode,
                CreatedDate = task.CreatedDate
            };

            return CreatedAtAction(
                nameof(GetTaskById),
                new { id = task.Id },
                ApiResponse<TaskDto>.SuccessResponse(taskDto, "Task created successfully")
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<TaskDto>.ErrorResponse(
                "An error occurred while creating the task",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Update an existing task
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
        }

        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "ID mismatch",
                new List<string> { "The ID in the URL does not match the ID in the request body" }
            ));
        }

        try
        {
            var userId = GetCurrentUserId();
            var existingTask = await _taskService.GetTaskByIdAsync(id);

            if (existingTask == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Task not found",
                    new List<string> { $"Task with ID {id} does not exist" }
                ));
            }

            // Ensure user owns this task
            if (existingTask.UserId != userId)
            {
                return Forbid();
            }

            await _taskService.UpdateTaskAsync(dto, userId);

            return Ok(ApiResponse<object>.SuccessResponse(null, "Task updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "An error occurred while updating the task",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Delete a task
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existingTask = await _taskService.GetTaskByIdAsync(id);

            if (existingTask == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Task not found",
                    new List<string> { $"Task with ID {id} does not exist" }
                ));
            }

            // Ensure user owns this task
            if (existingTask.UserId != userId)
            {
                return Forbid();
            }

            await _taskService.DeleteTaskAsync(id, userId);

            return Ok(ApiResponse<object>.SuccessResponse(null, "Task deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "An error occurred while deleting the task",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Mark a task as incomplete (back to pending)
    /// </summary>
    [HttpPost("{id}/uncomplete")]
    public async Task<ActionResult<ApiResponse<object>>> UncompleteTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existingTask = await _taskService.GetTaskByIdAsync(id);

            if (existingTask == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Task not found", new List<string> { $"Task with ID {id} does not exist" }));

            if (existingTask.UserId != userId)
                return Forbid();

            await _taskService.UncompleteTaskAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Task marked as pending"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred", new List<string> { ex.Message }));
        }
    }

    /// <summary>
    /// Mark a task as complete
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<ActionResult<ApiResponse<object>>> CompleteTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existingTask = await _taskService.GetTaskByIdAsync(id);

            if (existingTask == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Task not found",
                    new List<string> { $"Task with ID {id} does not exist" }
                ));
            }

            // Ensure user owns this task
            if (existingTask.UserId != userId)
            {
                return Forbid();
            }

            await _taskService.CompleteTaskAsync(id, userId);

            return Ok(ApiResponse<object>.SuccessResponse(null, "Task marked as complete"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "An error occurred while completing the task",
                new List<string> { ex.Message }
            ));
        }
    }

}
