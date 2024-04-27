namespace BackEnd.Dto;

public class RequestOrderDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public string UserId { get; set; }
    public decimal TotalPrice { get; set; }
    public string OrderId { get; set; }
    public List<OrderItemDto> CartItems { get; set; }
        
    public RequestOrderDto()
    {
        CartItems = new List<OrderItemDto>();
    }
}
    
public class OrderItemDto
{
    public string? productSizeId { get; set; }
    public string? ProductId { get; set; }
    public string? Size { get; set; }
    public int? Quantity { get; set; }
    public decimal? TotalPrice { get; set; }
    public Guid? OrderItemId { get; set; }
}
