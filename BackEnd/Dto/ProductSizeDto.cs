using Backend.Models;

namespace BackEnd.Dto;

public class ProductSizeDto
{
    public string? ProductSizeId { get; set; }
    public Size Size { get; set; }
    public int? Quantity { get; set; }
    public string? ProductId { get; set; }
    
}