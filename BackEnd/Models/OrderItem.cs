namespace Backend.Models;

public class OrderItem
{
    public Guid? OrderItemId { get; set; }
    public int? Quantity { get; set; }
    public Guid? OrderId { get; set; }
    public string? ProductSizeId { get; set; }
    public decimal? TotalPrice { get; set; }
    public virtual Order? Order { get; set; }
    public virtual ProductSize? ProductSize { get; set; } // Add this line

}