using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEnd.Controllers;

    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("[controller]")]
    public class AdminController : ControllerBase
    {
        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminOnly()
        {
            return Ok(new { message ="Admin endpoint accessed."});
        }

        [HttpGet("authorized")]
        [Authorize(Roles = "Admin, User")]
        public IActionResult Authorized()
        {
            return Ok(new { message = "Authorization successfully." });
        }
    }