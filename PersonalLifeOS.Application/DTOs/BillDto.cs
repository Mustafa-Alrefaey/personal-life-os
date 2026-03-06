using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class BillDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string? Category { get; set; }
    public string StatusCode { get; set; } = string.Empty;
    public int ReminderDaysBefore { get; set; }
}

public class CreateBillDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    public int ReminderDaysBefore { get; set; } = 3;
}

public class UpdateBillDto
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    public int ReminderDaysBefore { get; set; } = 3;

    [Required]
    public string StatusCode { get; set; } = "Pending";
}
