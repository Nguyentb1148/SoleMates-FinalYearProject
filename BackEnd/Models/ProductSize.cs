namespace Backend.Models;

public class ProductSize
{
    public string? ProductSizeId { get; set; }
    public Size Size { get; set; }
    public int? Quantity { get; set; }
    public string? ProductId { get; set; }

    public virtual Product? Product { get; set; }
}
public enum Size
{
    Eu35 = 35,
    Eu36 = 36,
    Eu365 = 365,
    Eu37 = 37,
    Eu38 = 38,
    Eu385 = 385,
    Eu39 = 39,
    Eu40 = 40,
    Eu405 = 405,
    Eu41 = 41,
    Eu42 = 42,
    Eu425 = 425,
    Eu43 = 43,
    Eu44 = 44,
    Eu445 = 445,
    Eu45 = 45,
    Eu46 = 46
}