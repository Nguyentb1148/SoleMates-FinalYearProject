using BackEnd.Context;
using BackEnd.Dto;
using Backend.Models;
using BackEnd.Repo;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace BackEnd.Controllers
{
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,Roles = "User")]
    [Route("[controller]")]   
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<UserController> _logger;
        
        public UserController(UserManager<ApplicationUser> userManager, ApplicationDbContext context,ILogger<UserController> logger)
        {
            _userManager = userManager;
            _logger = logger;
            _context = context;
        }
        
        [HttpGet("getUserData/{id}")]
        public async Task<IActionResult> GetUserData(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) {
                _logger.LogError($"User with ID '{id}' not found.");
                return NotFound($"User with ID '{id}' not found.");
            }
            string imageData = null;
            if (!string.IsNullOrWhiteSpace(user.ImageFileName)) {
            }
            var userData = new {
                user.Id,
                user.UserName,
                user.Email,
                user.EmailConfirmed,
                user.PhoneNumber,
                user.ImageFileName,
                user.Address
            };
            return Ok(userData);
        }

        [HttpPost("updateUserProfile/{id}")]
        public async Task<IActionResult> UpdateUserProfile([FromForm] UserProfileDto model)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            var user = await _context.ApplicationUsers.FindAsync(userId);

            if (string.IsNullOrEmpty(userId)) {
                _logger.LogError("User id not found in claims.");
                return BadRequest("User id not found in claims.");
            }
            _logger.LogInformation($"Received song data: {JsonConvert.SerializeObject(model)}");

            _logger.LogInformation("Start update profile data update {0}", model.Username);
            _logger.LogInformation("User Id: {0}", userId);

            if (model.Username!=null) {
                _logger.LogInformation("new user name: {0}",model.Username);
                user.UserName = model.Username;
            }
            if (model.Address!=null) {
                _logger.LogInformation("new user name: {0}",model.Username);
                user.Address = model.Address;
            } 
            if (model.PhoneNumber!=null) {
                _logger.LogInformation("new user name: {0}",model.Username);
                user.PhoneNumber = model.PhoneNumber;
            }
            if (model.ImageFile != null) {
                _logger.LogInformation("new profile image");
                user.ImageFileName = model.ImageFile;
            }
            _logger.LogInformation("End update profile data update");
            await _context.SaveChangesAsync();
            return Ok(new {user,message="Update UserProfile successfully"});
        }
        
    }
}