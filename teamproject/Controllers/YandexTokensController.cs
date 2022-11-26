using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using teamproject.Data;
using teamproject.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using System.Net.Http;
using Newtonsoft.Json.Linq;
using System.Net.Http.Json;
using Newtonsoft.Json;
using System.Text;
using System.Net.Http.Headers;
using System.Text.Json.Nodes;
using System.Text.Json;

namespace teamproject.Controllers
{
    [Authorize]
    [ApiController]
    //[Route("api/[controller]")]
    [Route("api/sandbox/yandextokens")]
    public class YandexTokensSandboxController : YandexTokensController
    {
        public YandexTokensSandboxController(ApplicationDbContext context
             , IClientRequestParametersProvider clientRequestParametersProvider)
            : base(context, clientRequestParametersProvider)
        {
            yandex_direct_api_v4 = @"https://api-sandbox.direct.yandex.ru/live/v4/json/";
            yandex_direct_api_v5 = @"https://api-sandbox.direct.yandex.com/json/v5/";
        }
    }


    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class YandexTokensController : ControllerBase
    {
        protected readonly ApplicationDbContext _context;
        protected readonly IClientRequestParametersProvider _clientRequestParametersProvider;

        protected string yandex_direct_api_v4 = @"https://api.direct.yandex.ru/live/v4/json/";
        protected string yandex_direct_api_v5 = @"https://api.direct.yandex.com/json/v5/";
        //DbSet<YandexToken> tokensStorage;

        public YandexTokensController(ApplicationDbContext context
             , IClientRequestParametersProvider clientRequestParametersProvider)
        {
            _clientRequestParametersProvider = clientRequestParametersProvider;
            _context = context;
        }

        // GET: api/YandexTokens/1
        [HttpGet("{user_id}")]
        public IEnumerable<YandexToken> GetYandexTokens(string user_id)
        {
            return _context.YandexTokens.Where(yt => yt.User_id == user_id);
        }

        // POST: api/YandexTokens/balance и в теле JSON со строкой
        [HttpPost("balance")]
        public async Task<string> GetBalanceByToken([FromBody] string token)
        {
            var client = new HttpClient();
            
            var str = 
            @" {
                ""method"": ""AccountManagement"",
                ""token"": """ + token + @""",
                ""param"": {
                    ""Action"": ""Get"",
                    ""SelectionCriteria"": {
                        ""Logins"": [],
                        ""AccountIDS"": []
                    }
                }
            }";

            var response = await client.PostAsync(yandex_direct_api_v4, new StringContent(str, Encoding.UTF8, "application/json"));

            var responseString = await response.Content.ReadAsStringAsync();

            return responseString;
        }

        [HttpPost("accountinfo")]
        public async Task<string> GetAccountInfo([FromBody] string token)
        {
            var str =
                @"{
                  ""method"": ""get"",
                  ""params"": {
                    ""FieldNames"": [""Login"", ""ClientId"", ""ClientInfo""]
                  }
                }";

            var client = new HttpClient();
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(yandex_direct_api_v5 + "clients"),
                Method = HttpMethod.Post,
                Content = new StringContent(str, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = AuthenticationHeaderValue.Parse($"Bearer {token}");
            var response = await client.SendAsync(request);

            var responseString = await response.Content.ReadAsStringAsync();

            return responseString;
        }

        // POST: api/YandexTokens/agencyclients и в теле JSON со строкой
        [HttpPost("agencyclients")]
        public async Task<string> GetAgencyClients([FromBody] string token)
        {
            var str =
                @"{
                  ""method"": ""get"",
                  ""params"": {
                    ""SelectionCriteria"": {  },
                    ""FieldNames"": [ ""ClientInfo"", ""Login"" ]
                  }
                }";

            var client = new HttpClient();
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(yandex_direct_api_v5 + "agencyclients"),
                Method = HttpMethod.Post,
                Content = new StringContent(str, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = AuthenticationHeaderValue.Parse($"Bearer {token}");
            var response = await client.SendAsync(request);

            var responseString = await response.Content.ReadAsStringAsync();

            AgencyClients agencyClientsResponse = JsonConvert.DeserializeObject<AgencyClients>(responseString);
            agencyClientsResponse.is_agency = agencyClientsResponse.error == null;

            return JsonConvert.SerializeObject(agencyClientsResponse);
        }

        // POST: api/YandexTokens/agencyclients/balances
        [HttpPost("agencyclients/balances")]
        public async Task<string> GetAgencyClientsBalances([FromBody] AgencyClientsBalancesRequest balancesRequest)
        {
            var logins = new StringBuilder();
            foreach (var login in balancesRequest.logins)
                logins.Append(@"""" + login + @""", ");
            logins.Remove(logins.Length - 2, 2);

            var str =
            @" {
                ""method"": ""AccountManagement"",
                ""token"": """ + balancesRequest.token + @""",
                ""param"": {
                    ""Action"": ""Get"",
                    ""SelectionCriteria"": {
                        ""Logins"": [" + logins.ToString() + @"]
                    }
                }
            }";

            var client = new HttpClient();
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(yandex_direct_api_v4),
                Method = HttpMethod.Post,
                Content = new StringContent(str, Encoding.UTF8, "application/json")
            };

            var response = await client.SendAsync(request);

            var responseString = await response.Content.ReadAsStringAsync();

            return responseString;
        }

        // POST: api/YandexTokens
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<YandexToken>> PostYandexToken([FromBody] YandexToken yandexToken)
        {
            if (!UserExists(yandexToken.User_id))
                return BadRequest("Такого пользователя не существует!");
            _context.YandexTokens.Add(yandexToken);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (YandexTokenExists(yandexToken.User_id, yandexToken.Token, yandexToken.In_sandbox))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Ok(yandexToken);
        }

        // DELETE: api/YandexTokens/1/1
        [HttpDelete("{user_id}/{token}")]
        public async Task<IActionResult> DeleteYandexToken(string user_id, string token)
        {
            var yandexToken = await _context.YandexTokens
                .FirstOrDefaultAsync(yt => yt.User_id == user_id && yt.Token == token);
            
            if (yandexToken == null)
            {
                return NotFound();
            }

            _context.YandexTokens.Remove(yandexToken);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(string user_id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == user_id) != null;
        }

        private bool YandexTokenExists(string user_id, string token, bool inSandbox)
        {
            return _context.YandexTokens.Any(e => e.User_id == user_id && e.Token == token && e.In_sandbox == inSandbox);
        }
    }
}
