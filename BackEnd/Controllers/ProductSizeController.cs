using System.Runtime.InteropServices.JavaScript;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using BackEnd.Context;
using Backend.Models;
using BackEnd.Dto;
using Newtonsoft.Json;

namespace Backend.Controllers
{
    [ApiController]
    // [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("[controller]")]
    public class ProductSizeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductSizeController> _logger;

        public ProductSizeController(ApplicationDbContext context,ILogger<ProductSizeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<ProductSizeDto> GetAllProductSizes()
        {
            return _context.ProductSizes
                .Select(ps => new ProductSizeDto {
                    ProductSizeId = ps.ProductSizeId,
                    Size = ps.Size,
                    Quantity = ps.Quantity,
                    ProductId = ps.ProductId
                })
                .ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<ProductSizeDto> GetProductSizeById(Guid id)
        {
            var productSize = _context.ProductSizes.Find(id);
            if (productSize == null) {
                return NotFound();
            }

            var productSizeDto = new ProductSizeDto {
                ProductSizeId = productSize.ProductSizeId,
                Size = productSize.Size,
                Quantity = productSize.Quantity,
                ProductId = productSize.ProductId
            };

            return productSizeDto;
        }
        
        [HttpGet("ByProductId/{productId}")]
        public ActionResult<IEnumerable<ProductSizeDto>> GetProductSizesByProductId(string productId)
        {
            var productSizes = _context.ProductSizes
                .Where(ps => ps.ProductId == productId)
                .Select(ps => new ProductSizeDto {
                    ProductSizeId = ps.ProductSizeId,
                    Size = ps.Size,
                    Quantity = ps.Quantity,
                    ProductId = ps.ProductId
                })
                .ToList();
            if (productSizes.Count == 0) {
                return NotFound(new{error=$"not product size with {productId}"});
            }
            return productSizes;
        }
        [HttpPost]
        public ActionResult<ProductSizeDto>? AddProductSize([FromBody]ProductSizeDto productSizeDto)
        {
            try {
                _logger.LogInformation($"Received ProductSize data: {JsonConvert.SerializeObject(productSizeDto)}");
                if (!ModelState.IsValid) {
                    return BadRequest(ModelState);
                }
                var productSize = new ProductSize {
                    ProductSizeId = productSizeDto.ProductSizeId,
                    Size = productSizeDto.Size,
                    Quantity = productSizeDto.Quantity,
                    ProductId = productSizeDto.ProductId
                };
                _context.ProductSizes.Add(productSize);
                _context.SaveChanges();
                return CreatedAtAction(nameof(GetProductSizeById), new { id = productSize.ProductSizeId,  message = "Add product size successfully"  }, productSizeDto);
            }
            catch (JsonException ex) {
                _logger.LogError($"Error deserializing JSON: {ex}");

                return BadRequest(new { message = "Invalid JSON data" });
            }
            catch (Exception e) {
                _logger.LogError($"Error message: {e}");
                return StatusCode(500, new { message = "Internal Server Error" });
            }
        }
        [HttpPut("{id}")]
        public IActionResult UpdateProductSize(string id, [FromBody]ProductSizeDto productSizeDto)
        { 
            try {
                _logger.LogInformation($"Received update ProductSize data: {JsonConvert.SerializeObject(productSizeDto)}");

                if (id != productSizeDto.ProductSizeId) {
                    return BadRequest();
                }
                var productSize = new ProductSize {
                    ProductSizeId = productSizeDto.ProductSizeId,
                    Size = productSizeDto.Size,
                    Quantity = productSizeDto.Quantity,
                    ProductId = productSizeDto.ProductId
                };
                _context.Entry(productSize).State = EntityState.Modified;
                _context.SaveChanges();
                return Ok(new { message = "Update product size successfully" });
            }
            catch (Exception ex) {
                _logger.LogError($"Error updating product size: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while updating product size" });
            }
        }

    }
}
