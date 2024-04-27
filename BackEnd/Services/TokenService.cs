using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BackEnd.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TokenService> _logger;
        public TokenService(IConfiguration configuration,UserManager<ApplicationUser> userManager, ApplicationDbContext context, ILogger<TokenService> logger)
        {
            _configuration = configuration;
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        public async Task<string> GenerateAccessToken(ApplicationUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.Now.AddSeconds(30);

            var userClaims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);

            var roleClaims = roles.Select(r => new Claim(ClaimTypes.Role, r)).ToList();
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
            }
            .Union(userClaims)
            .Union(roleClaims);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public RefreshToken GenerateRefreshToken(string userId, string jwtId)
        {
            return new RefreshToken
            {
                UserId = userId,
                Token = Guid.NewGuid().ToString().Replace("-", ""),
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddDays(7), 
                JwtId = jwtId,
                IsRevoked = false
            };
        }
        
    }
}
