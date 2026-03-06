namespace PersonalLifeOS.Domain.Entities;

public class MonthlyPayment
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public string StatusCode { get; set; } = "Pending";
    public string UserId { get; set; } = string.Empty;
    public string? Notes { get; set; }

    // Audit fields
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedDate { get; set; }
}
