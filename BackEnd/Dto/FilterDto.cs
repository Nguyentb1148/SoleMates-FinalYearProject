using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace BackEnd.Dto;

public class FilterDto
{
    public Design? Design { get; set; }
    public ProductLine? Product { get; set; }
    public Material? Material { get; set; }
    public Color? Color { get; set; }
    public int? Price { get; set; }
}