using System;
using Backend.Models;
using Microsoft.AspNetCore.Identity;

public class RefreshToken
{
    public Guid Id { get; set; } 
    public string? Token { get; set; }
    public string? UserId { get; set; }
    public virtual ApplicationUser? User { get; set; }
    public DateTime IssuedUtc { get; set; }
    public DateTime ExpiresUtc { get; set; }
    public bool IsRevoked { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? JwtId { get; set; }
}