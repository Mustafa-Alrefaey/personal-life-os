using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Identity;

namespace PersonalLifeOS.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaskEntity> Tasks { get; set; }
    public DbSet<DailyJournal> DailyJournals { get; set; }
    public DbSet<Receipt> Receipts { get; set; }
    public DbSet<Bill> Bills { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<MonthlyPayment> MonthlyPayments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // TaskEntity configuration
        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.StatusCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
            entity.HasIndex(e => new { e.UserId, e.StatusCode });
            entity.HasIndex(e => e.DueDate);
        });

        // DailyJournal configuration
        modelBuilder.Entity<DailyJournal>(entity =>
        {
            entity.ToTable("DailyJournals");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Notes).IsRequired();
            entity.Property(e => e.StatusCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
            entity.HasIndex(e => new { e.UserId, e.Date });
        });

        // Receipt configuration
        modelBuilder.Entity<Receipt>(entity =>
        {
            entity.ToTable("Receipts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ImagePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.StatusCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
            entity.HasIndex(e => new { e.UserId, e.Date });
        });

        // Bill configuration
        modelBuilder.Entity<Bill>(entity =>
        {
            entity.ToTable("Bills");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.StatusCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
            entity.HasIndex(e => new { e.UserId, e.DueDate, e.StatusCode });
        });

        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("Transactions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.StatusCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
            entity.HasIndex(e => new { e.UserId, e.Date, e.Type });
        });

        // MonthlyPayment configuration
        modelBuilder.Entity<MonthlyPayment>(entity =>
        {
            entity.ToTable("MonthlyPayments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.StatusCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasIndex(e => new { e.UserId, e.Year, e.Month });
        });
    }
}
