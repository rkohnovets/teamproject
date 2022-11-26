using Microsoft.EntityFrameworkCore.Migrations;

namespace teamproject.Data.Migrations
{
    public partial class updatedyandextokenagain : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InSandbox",
                table: "YandexTokens",
                newName: "In_sandbox");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "In_sandbox",
                table: "YandexTokens",
                newName: "InSandbox");
        }
    }
}
