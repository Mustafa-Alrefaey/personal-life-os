namespace PersonalLifeOS.Application.DTOs;

public class DashboardDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }

    public int TotalJournalEntries { get; set; }
    public int TotalReceipts { get; set; }
    public int TotalBills { get; set; }
    public int UnpaidBills { get; set; }

    public decimal TotalExpenses { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal NetBalance { get; set; }

    public List<TaskDto>? RecentTasks { get; set; }
    public List<BillDto>? UpcomingBills { get; set; }
}
