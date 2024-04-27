using BackEnd.Models;

namespace Backend.Models;

public class EmailConfirmation
{
    public Guid Id { get; set; } // Primary key
    public string? Email { get; set; } // Nullable ApplicationUser property
    public string? Token { get; set; } // Nullable Token property
    public DateTime ExpiryDate { get; set; }
    public ConfirmationType Type { get; set; } = ConfirmationType.AccountConfirmation;
    public string? UserId { get; set; }
    public virtual ApplicationUser? User { get; set; } // Nullable ApplicationUser navigation property
}


public enum ConfirmationType
{
    AccountConfirmation,
    PasswordReset
}