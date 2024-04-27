using Backend.Models;

namespace BackEnd.Dto;

public class ProductDto
{
    public string ProductId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public ICollection<string?> ImageUrls { get; set; }
    public virtual ICollection<ProductSize>? ProductSizes { get; set; }
    public Design Design { get; set; }
    public ProductLine ProductLine { get; set; }
    public decimal Price { get; set; }
    public Material Material { get; set; }
    public Color Color { get; set; }
}