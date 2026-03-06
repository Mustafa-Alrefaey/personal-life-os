using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class ReceiptDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Category { get; set; }
    public string ImagePath { get; set; } = string.Empty;
    public string StatusCode { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

public class CreateReceiptDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.Today;

    [MaxLength(50)]
    public string? Category { get; set; }
}

public class UpdateReceiptDto
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }
}
