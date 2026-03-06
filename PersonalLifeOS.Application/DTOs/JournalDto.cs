using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class JournalDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string StatusCode { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

public class CreateJournalDto
{
    [Required]
    public DateTime Date { get; set; } = DateTime.Today;

    [Required]
    public string Notes { get; set; } = string.Empty;
}

public class UpdateJournalDto
{
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public string Notes { get; set; } = string.Empty;
}
