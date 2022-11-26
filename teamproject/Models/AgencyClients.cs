using System.Collections.Generic;

namespace teamproject.Models
{
    public class AgencyClients
    {
        public bool is_agency;
        public YandexDirectErrorResponse error;
        public AgencyClientsResult result;

        public class YandexDirectErrorResponse
        {
            public string request_id;
            public int error_code;
            public string error_string;
            public string error_detail;

        }
        public class AgencyClientsResult
        {
            public YandexDirectClient[] Clients;
            public class YandexDirectClient
            {
                //public int ClientId;
                public string Login;
                public string ClientInfo;
            }
        }
    }

    public class AgencyClientsBalancesRequest
    {
        public string token { get; set; }
        public string[] logins { get; set; }
    }
}
