using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public enum Design
    {
        LowTop,
        HighTop,
        Mule
    }

    public enum ProductLine
    {
        Basas,
        Vintas,
        Urbas,
        Pattas,
        Socks,
        Shoelaces
    }

    public enum Material
    {
        Canvas,
        Suede,
        Leather,
        Flannel,
        Corduroy
    }

    public enum Color
    {
        Gray,
        White,
        Cream,
        Charcoal,
        Teal,
        Beige,
        Silver,
        NavyBlue,
        OliveGreen,
        Lavender,
        Coral,
        CarrotOrange,
        CrimsonRed
    }

    public class Product
    {
        public string ProductId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<string> ImageUrls { get; set; }
        public virtual ICollection<ProductSize>? ProductSizes { get; set; }
        public Design Design { get; set; }
        public ProductLine ProductLine { get; set; }
        public decimal Price { get; set; }
        public Material Material { get; set; }
        public Color Color { get; set; }
    }
}