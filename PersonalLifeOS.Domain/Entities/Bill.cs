namespace PersonalLifeOS.Domain.Entities;

public class Bill
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public int ReminderDaysBefore { get; set; } = 3;
    public string StatusCode { get; set; } = "Pending";
    public string UserId { get; set; } = string.Empty;

    // Audit fields
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedDate { get; set; }
}
