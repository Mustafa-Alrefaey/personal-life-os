using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Enums;

namespace PersonalLifeOS.Infrastructure.Services;

public class DashboardService
{
    private readonly TaskService _taskService;
    private readonly BillService _billService;
    private readonly TransactionService _transactionService;
    private readonly JournalService _journalService;
    private readonly ReceiptService _receiptService;

    public DashboardService(
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

    // Run sequentially: all repositories share the same scoped DbContext instance.
    // Task.WhenAll on the same DbContext causes a concurrency exception.
    public async Task<DashboardDto> GetDashboardAsync(string userId)
    {
        var tasks        = await _taskService.GetAllTasksAsync(userId);
        var bills        = await _billService.GetAllBillsAsync(userId);
        var transactions = await _transactionService.GetAllTransactionsAsync(userId);
        var journals     = await _journalService.GetAllJournalsAsync(userId);
        var receipts     = await _receiptService.GetAllReceiptsAsync(userId);

        var completedTasks = tasks.Count(t => t.StatusCode == GeneralStatuses.COMPLETED);
        var pendingTasks   = tasks.Count(t => t.StatusCode == GeneralStatuses.PENDING);
        var overdueTasks   = tasks.Count(t =>
            t.StatusCode == GeneralStatuses.PENDING &&
            t.DueDate.HasValue &&
            t.DueDate.Value.Date < DateTime.Now.Date);

        var totalIncome   = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        var recentTasks = tasks
            .OrderByDescending(t => t.CreatedDate).Take(5)
            .ToList();

        var upcomingBills = bills
            .Where(b => b.StatusCode == GeneralStatuses.PENDING)
            .OrderBy(b => b.DueDate).Take(5)
            .ToList();

        return new DashboardDto
        {
            TotalTasks          = tasks.Count,
            CompletedTasks      = completedTasks,
            PendingTasks        = pendingTasks,
            OverdueTasks        = overdueTasks,
            TotalJournalEntries = journals.Count,
            TotalReceipts       = receipts.Count,
            TotalBills          = bills.Count,
            UnpaidBills         = bills.Count(b => b.StatusCode == GeneralStatuses.PENDING),
            TotalIncome         = totalIncome,
            TotalExpenses       = totalExpenses,
            NetBalance          = totalIncome - totalExpenses,
            RecentTasks         = recentTasks,
            UpcomingBills       = upcomingBills
        };
    }
}
