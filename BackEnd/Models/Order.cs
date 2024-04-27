namespace Backend.Models;

public class Order
{
    public Guid? OrderId { get; set; }
    public DateTime? DateTime { get; set; }
    public decimal? TotalPrice { get; set; }
    public OrderStatus? Status { get; set; }
    public string? UserId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public virtual ApplicationUser? User { get; set; }
    public virtual ICollection<OrderItem>? OrderItems { get; set; }

}

public enum OrderStatus
{
    Processing,
    Shipping,
    Delivered,
    Cancelled,
}
