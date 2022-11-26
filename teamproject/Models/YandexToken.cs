using System.Diagnostics.Eventing.Reader;

namespace teamproject.Models
{
    public class YandexToken
    {
        public bool In_sandbox { get; set; } = false;
        public string Token { get; set; }
        public string User_id { get; set; }
        public string Description { get; set; } = "";
    }
}
