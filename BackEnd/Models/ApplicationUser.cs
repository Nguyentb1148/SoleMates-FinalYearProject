using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

public class ApplicationUser : IdentityUser
{
    public ICollection<EmailConfirmation>? EmailConfirmations { get; set; }
    public string? ImageFileName { get; set; }
    public virtual ICollection<Order>? Orders { get; set; }
    public string? Address { get; set; }
}

