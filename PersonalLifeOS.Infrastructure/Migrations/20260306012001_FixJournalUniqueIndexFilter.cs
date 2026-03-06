using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalLifeOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixJournalUniqueIndexFilter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyJournals_UserId_Date",
                table: "DailyJournals");

            migrationBuilder.CreateIndex(
                name: "IX_DailyJournals_UserId_Date",
                table: "DailyJournals",
                columns: new[] { "UserId", "Date" },
                unique: true,
                filter: "[StatusCode] <> 'Deleted'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyJournals_UserId_Date",
                table: "DailyJournals");

            migrationBuilder.CreateIndex(
                name: "IX_DailyJournals_UserId_Date",
                table: "DailyJournals",
                columns: new[] { "UserId", "Date" },
                unique: true);
        }
    }
}
