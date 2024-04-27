using Microsoft.AspNetCore.Mvc;
using BackEnd.Context;
using BackEnd.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Newtonsoft.Json;

namespace Backend.Controllers
{
    [ApiController]
    // [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductController> _logger;

        public ProductController(ApplicationDbContext context,ILogger<ProductController> logger)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public IEnumerable<Product> GetAllProducts()
        {
            return _context.Products.ToList();
        }
        [HttpGet("ProductList")]
        public IEnumerable<object> GetAllProductNamesAndIds()
        {
            return _context.Products.Select(p => new Tuple<string, string>(p.ProductId, p.Name)).ToList();
        }

        
        [HttpGet("{id}")]
        public ActionResult<Product> GetProductById(string id)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound();
            }
            return product;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> AddProduct([FromBody] ProductDto? productDto)
        {
            _logger.LogInformation($"Received song data: {JsonConvert.SerializeObject(productDto)}");
            if (productDto!=null) {
                _logger.LogInformation($"ProductId : {productDto.ProductId}");
                 var product = new Product {
                     ProductId = productDto.ProductId, 
                     Name = productDto.Name,
                     Description = productDto.Description,
                     ProductSizes = productDto.ProductSizes,
                     Design = productDto.Design,
                     ProductLine = productDto.ProductLine,
                     Price = productDto.Price,
                     Material = productDto.Material,
                     Color = productDto.Color
                 };
                 if (productDto.ImageUrls.Any()) {
                     product.ImageUrls = new List<string>(); // Initialize if necessary
                     foreach (var imageUrl in productDto.ImageUrls) {
                         if (imageUrl != null) product.ImageUrls.Add(imageUrl);
                     }
                 }
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
            }
            else
                _logger.LogError("Product data is null");
            return Ok(new {message="Add Product successfully"});
        }

        [HttpPut("{id}")]
        public IActionResult UpdateProduct(string id, [FromBody] ProductDto? product)
        {
            _logger.LogInformation($"Product ID: {id}");
            if (id != product?.ProductId)
            {
                return BadRequest();
            }
            _logger.LogInformation($"Received song data: {JsonConvert.SerializeObject(product)}");


            var existingProduct = _context.Products.Find(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            _context.Entry(existingProduct).CurrentValues.SetValues(product);
            _context.SaveChanges();

            return Ok(new {message="Update Product successfully"});
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(string id)
        {
            _logger.LogInformation($"Product ID: {id}");
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            _context.SaveChanges();

            return Ok(new {message="Delete Product successfully"});
        }
    }
}
