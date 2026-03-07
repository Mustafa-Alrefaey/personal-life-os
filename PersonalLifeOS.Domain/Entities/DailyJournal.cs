using PersonalLifeOS.Domain.Enums;

namespace PersonalLifeOS.Domain.Entities;

public class DailyJournal
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string StatusCode { get; set; } = GeneralStatuses.ACTIVE;
    public string UserId { get; set; } = string.Empty;

    // Audit fields
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedDate { get; set; }
}
