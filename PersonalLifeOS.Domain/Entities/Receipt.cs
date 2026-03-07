using PersonalLifeOS.Domain.Enums;

namespace PersonalLifeOS.Domain.Entities;

public class Receipt
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Category { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string StatusCode { get; set; } = GeneralStatuses.ACTIVE;

    // Audit fields
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedDate { get; set; }
}
