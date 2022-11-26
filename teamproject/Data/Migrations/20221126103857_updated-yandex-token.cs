using Microsoft.EntityFrameworkCore.Migrations;

namespace teamproject.Data.Migrations
{
    public partial class updatedyandextoken : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_YandexTokens",
                table: "YandexTokens");

            migrationBuilder.DropColumn(
                name: "Short_name",
                table: "YandexTokens");

            migrationBuilder.AddColumn<bool>(
                name: "InSandbox",
                table: "YandexTokens",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_YandexTokens",
                table: "YandexTokens",
                columns: new[] { "Token", "User_id", "InSandbox" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_YandexTokens",
                table: "YandexTokens");

            migrationBuilder.DropColumn(
                name: "InSandbox",
                table: "YandexTokens");

            migrationBuilder.AddColumn<string>(
                name: "Short_name",
                table: "YandexTokens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_YandexTokens",
                table: "YandexTokens",
                columns: new[] { "Token", "User_id" });
        }
    }
}
