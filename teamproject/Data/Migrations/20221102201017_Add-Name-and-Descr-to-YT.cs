using Microsoft.EntityFrameworkCore.Migrations;

namespace teamproject.Data.Migrations
{
    public partial class AddNameandDescrtoYT : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "YandexTokens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Short_name",
                table: "YandexTokens",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "YandexTokens");

            migrationBuilder.DropColumn(
                name: "Short_name",
                table: "YandexTokens");
        }
    }
}
