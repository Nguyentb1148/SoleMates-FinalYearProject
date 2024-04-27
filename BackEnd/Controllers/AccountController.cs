using BackEnd.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Dto;
using Backend.Models;
using BackEnd.Repo;
using BackEnd.Services;
using FirebaseAdmin.Auth;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailService _emailService;
        private readonly ILogger<AccountController> _logger; 
        private readonly UserRepository _userRepository;
        private readonly TokenService _tokenService; 
        private readonly ApplicationDbContext _context;
        
        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ILogger<AccountController> logger,
            UserRepository userRepository,
            TokenService tokenService,
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger; 
            _userRepository = userRepository;
            _tokenService = tokenService; 
            _context = context;
            _emailService = emailService;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            _logger.LogInformation("register start");

            if (!ModelState.IsValid&&model.Password!=model.ConfirmPassword) {
                return BadRequest(ModelState);
            }
            
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null) {
                return Conflict(new { message = "Email is already registered." });
            }
            var result = await _userRepository.CreateUserWithRoleAsync(model, "User");
            if (result.Succeeded) {
                var user = await _userManager.FindByEmailAsync(model.Email);
                await _signInManager.SignInAsync(user, isPersistent: false);
                var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var callbackUrl = Url.Action(nameof(ConfirmEmail), "Account", new { userId = user.Id, code }, protocol: HttpContext.Request.Scheme);
                await _emailService.SendEmailAsync(model.Email, "Confirm your email", $"Please confirm your account by clicking this link: <a href='{callbackUrl}'>link</a>");
                _logger.LogInformation("after call send email");

                return Ok(new { message = "User registered successfully,Confirm your email before login." });
            }
            else {
                foreach (var error in result.Errors) {
                    ModelState.AddModelError(string.Empty, error.Description);
                }

                return BadRequest(ModelState);
            }
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }
            _logger.LogInformation("Attempting login for {Email}", model.Email);
            var user = await _userManager.FindByEmailAsync(model.Email);
            var userData = new {
                user.Id,
                user.UserName,
                user.Email,
                user.EmailConfirmed,
                user.PhoneNumber,
                user.ImageFileName,
                user.Address
            };
            _logger.LogInformation($"after find user: {user}");
            if (user == null) {
                _logger.LogWarning("Login failed for {Email}: User not found", model.Email);
                return Unauthorized(new { message = "Invalid login attempt Be." });
            }
            _logger.LogInformation("before Signin ");
            var result = await _signInManager.PasswordSignInAsync(user, model.Password, model.RememberMe, false);
            _logger.LogInformation("after Signin ");

            if (result.Succeeded) {
                _logger.LogInformation( "Signin succeeded ");
                var roles = await _userManager.GetRolesAsync(user); 
                var accessToken = await _tokenService.GenerateAccessToken(user); 
                var refreshToken =_tokenService.GenerateRefreshToken(user.Id,Guid.NewGuid().ToString()); 
                await SaveRefreshTokenAsync(refreshToken);
                var userRole = roles.Contains("Admin") ? "Admin" : roles.Contains("StoreOwner") ? "StoreOwner" : "User";
                return Ok(new {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken.Token,
                    User = JsonConvert.SerializeObject(userData),
                    Role = userRole
                });
            }
            else {
                _logger.LogError("fail Signin ");
                return Unauthorized(new { message = "Invalid login attempt. (Login)" });
            }
        }
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken( RefreshTokenRequestDto request)
        {
            var refreshToken = await _context.RefreshTokens
                .SingleOrDefaultAsync(rt => rt.Token == request.Token && !rt.IsRevoked);
            if (refreshToken == null) {
                return BadRequest(new { message = "Invalid refresh token." });
            }
            if (refreshToken.ExpiresUtc < DateTime.UtcNow) {
                return Unauthorized(new { message = "Refresh token has expired. Please log in again." });
            }
            var user = await _userManager.FindByIdAsync(refreshToken.UserId);
            if (user == null) {
                return BadRequest(new { message = "User not found." });
            }
            var newAccessToken = await _tokenService.GenerateAccessToken(user);
            _logger.LogInformation("Return new access token");

            return Ok(new {
                AccessToken = newAccessToken
            });
        }
        private async Task SaveRefreshTokenAsync(RefreshToken refreshToken)
        {
            var existingToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.UserId == refreshToken.UserId && !rt.IsRevoked);

            if (existingToken != null) {
                existingToken.Token = refreshToken.Token;
                existingToken.IssuedUtc = refreshToken.IssuedUtc;
                existingToken.ExpiresUtc = refreshToken.ExpiresUtc;
                existingToken.JwtId = refreshToken.JwtId;
                existingToken.IsRevoked = refreshToken.IsRevoked;
                existingToken.ReplacedByToken = null; 
            }
            else {
                await _context.RefreshTokens.AddAsync(refreshToken);
            }
            await _context.SaveChangesAsync();
        }
        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin(RegisterDto model)
        {
            var result = await _userRepository.CreateUserWithRoleAdminAsync(model);
            if (result.Succeeded) {
                return Ok(new { message = "Admin registered successfully." });
            }
            else {
                return BadRequest(result.Errors);
            }
        }
        [HttpPost("register-storeOwner")]
        public async Task<IActionResult> RegisterStoreOwner(RegisterDto model)
        {
            var result = await _userRepository.CreateUserWithRoleStoreOwnerAsync(model);
            if (result.Succeeded) {
                _logger.LogInformation("Create StoreOwner account successfully");
                return Ok(new { message = "StoreOwner registered successfully." });
            }
            else {
                return BadRequest(result.Errors);
            }
            
        }
        [HttpGet("Confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(code)) {
                return BadRequest("User ID and Code are required to confirm email");
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) {           
                return BadRequest("Invalid User ID");
            }
            var result = await _userManager.ConfirmEmailAsync(user, code);
            if (result.Succeeded) {
                return Ok("Email confirmed successfully.");
            }
            return BadRequest("Error confirming your email.");
        }
         [HttpPost("LoginViaGoogle")]
        public async Task<IActionResult> LoginViaGoogle(string email)
        {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }
            var existingUser = await _userManager.FindByEmailAsync(email);
            var userData = new {
                existingUser.Id,
                existingUser.UserName,
                existingUser.Email,
                existingUser.EmailConfirmed,
                existingUser.PhoneNumber,
                existingUser.ImageFileName,
                existingUser.Address
            };
            if (existingUser != null) {
                var result = await _signInManager.PasswordSignInAsync(email, "Password01@", isPersistent: false, lockoutOnFailure: false);
                if (result.Succeeded) {
                    
                    var roles = await _userManager.GetRolesAsync(existingUser); 
                    var accessToken = await _tokenService.GenerateAccessToken(existingUser);
                    var refreshToken =_tokenService.GenerateRefreshToken(existingUser.Id,Guid.NewGuid().ToString()); 
                    var userRole = roles.Contains("Admin") ? "Admin" : roles.Contains("StoreOwner") ? "StoreOwner" : "User";
                    await SaveRefreshTokenAsync(refreshToken);
                    return Ok(new {
                        AccessToken = accessToken,
                        RefreshToken = refreshToken.Token,
                        User = JsonConvert.SerializeObject(userData),
                        Role = userRole
                    });
                }
                else {
                    return Unauthorized(new { message = "Invalid login attempt." });
                }
            }
            else 
            {
                return NotFound();
            }
        }
    }
    
}
