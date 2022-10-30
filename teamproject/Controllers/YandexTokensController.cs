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

namespace teamproject.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class YandexTokensController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IClientRequestParametersProvider _clientRequestParametersProvider;

        public YandexTokensController(ApplicationDbContext context
             , IClientRequestParametersProvider clientRequestParametersProvider
            )
        {
            _clientRequestParametersProvider = clientRequestParametersProvider;
            _context = context;
        }

        // GET: api/YandexTokens/1
        [HttpGet("{user_id}")]
        public IEnumerable<string> GetYandexTokens(string user_id)
        {
            //var clientFromRequest = _clientRequestParametersProvider.GetClientParameters(HttpContext, user_id);

            return _context.YandexTokens.Where(yt => yt.User_id == user_id).Select(yt => yt.Token);
        }
        /*
        public async Task<ActionResult<IEnumerable<YandexToken>>> GetYandexTokens(string user_id)
        {
            //var tokens = _context.YandexTokens.Where(yt => yt.User_id == user_id);


            return await _context.YandexTokens.ToListAsync();
        }
        */

        // GET: api/YandexTokens/1/1
        /*
        [HttpGet("{user_id}/{id}")]
        public async Task<ActionResult<YandexToken>> GetYandexToken(string user_id, string id)
        {
            var yandexToken = await _context.YandexTokens.FindAsync(id);

            if (yandexToken == null)
            {
                return NotFound();
            }

            return yandexToken;
        } */


        // PUT: api/YandexTokens/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /*
        [HttpPut("{id}")]
        public async Task<IActionResult> PutYandexToken(string id, YandexToken yandexToken)
        {
            if (id != yandexToken.Token)
            {
                return BadRequest();
            }

            _context.Entry(yandexToken).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!YandexTokenExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        */

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
                if (YandexTokenExists(yandexToken.User_id, yandexToken.Token))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Ok(yandexToken); //CreatedAtAction("GetYandexToken", new { id = yandexToken.Token }, yandexToken);
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

        private bool YandexTokenExists(string user_id, string token)
        {
            return _context.YandexTokens.Any(e => e.User_id == user_id && e.Token == token);
        }
    }
}
