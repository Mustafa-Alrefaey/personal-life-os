using System.ComponentModel.DataAnnotations;
using PersonalLifeOS.Domain.Enums;

namespace PersonalLifeOS.Application.DTOs;

public class TransactionDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string? Category { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public string StatusCode { get; set; } = string.Empty;
}

public class CreateTransactionDto
{
    [Required]
    public decimal Amount { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.Today;

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateTransactionDto
{
    public int Id { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
