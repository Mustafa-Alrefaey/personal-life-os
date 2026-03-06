using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;
using System.Security.Claims;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly TaskService _taskService;
    private readonly BillService _billService;
    private readonly TransactionService _transactionService;
    private readonly JournalService _journalService;
    private readonly ReceiptService _receiptService;

    public DashboardController(
        TaskService taskService,
        BillService billService,
        TransactionService transactionService,
        JournalService journalService,
        ReceiptService receiptService)
    {
        _taskService = taskService;
        _billService = billService;
        _transactionService = transactionService;
        _journalService = journalService;
        _receiptService = receiptService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardDto>>> GetDashboard()
    {
        try
        {
            var userId = GetCurrentUserId();

            // Run sequentially: all repositories share the same scoped DbContext instance.
            // Task.WhenAll on the same DbContext causes a concurrency exception.
            var tasks        = await _taskService.GetAllTasksAsync(userId);
            var bills        = await _billService.GetAllBillsAsync(userId);
            var transactions = await _transactionService.GetAllTransactionsAsync(userId);
            var journals     = await _journalService.GetAllJournalsAsync(userId);
            var receipts     = await _receiptService.GetAllReceiptsAsync(userId);

            var completedTasks = tasks.Count(t => t.StatusCode == "Completed");
            var pendingTasks   = tasks.Count(t => t.StatusCode == "Pending");
            var overdueTasks   = tasks.Count(t =>
                t.StatusCode == "Pending" &&
                t.DueDate.HasValue &&
                t.DueDate.Value.Date < DateTime.Now.Date);

            var totalIncome   = transactions.Where(t => t.Type == Domain.Enums.TransactionType.Income).Sum(t => t.Amount);
            var totalExpenses = transactions.Where(t => t.Type == Domain.Enums.TransactionType.Expense).Sum(t => t.Amount);

            var recentTasks = tasks
                .OrderByDescending(t => t.CreatedDate).Take(5)
                .Select(t => new TaskDto
                {
                    Id = t.Id, Title = t.Title, Description = t.Description,
                    DueDate = t.DueDate, Category = t.Category,
                    StatusCode = t.StatusCode, CreatedDate = t.CreatedDate
                }).ToList();

            var upcomingBills = bills
                .Where(b => b.StatusCode == "Pending").OrderBy(b => b.DueDate).Take(5)
                .Select(b => new BillDto
                {
                    Id = b.Id, Name = b.Name, Amount = b.Amount,
                    DueDate = b.DueDate, StatusCode = b.StatusCode,
                    ReminderDaysBefore = b.ReminderDaysBefore
                }).ToList();

            var dto = new DashboardDto
            {
                TotalTasks        = tasks.Count,
                CompletedTasks    = completedTasks,
                PendingTasks      = pendingTasks,
                OverdueTasks      = overdueTasks,
                TotalJournalEntries = journals.Count,
                TotalReceipts     = receipts.Count,
                TotalBills        = bills.Count,
                UnpaidBills       = bills.Count(b => b.StatusCode == "Pending"),
                TotalIncome       = totalIncome,
                TotalExpenses     = totalExpenses,
                NetBalance        = totalIncome - totalExpenses,
                RecentTasks       = recentTasks,
                UpcomingBills     = upcomingBills
            };

            return Ok(ApiResponse<DashboardDto>.SuccessResponse(dto, "Dashboard data retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<DashboardDto>.ErrorResponse(
                "An error occurred while retrieving dashboard data",
                new List<string> { ex.Message }));
        }
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedAccessException("User ID not found in token");
        return userId;
    }
}
