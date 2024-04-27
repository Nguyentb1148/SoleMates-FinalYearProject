using BackEnd.Context;
using BackEnd.Dto;
using Microsoft.AspNetCore.Mvc;

namespace BackEnd.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ILogger<SearchController> _logger;
        private readonly ApplicationDbContext _context;

        public SearchController(ILogger<SearchController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }
        [HttpPost("product")]
        public IActionResult SearchProductByName([FromBody] string productName)
        {
            try
            {
                var query = _context.Products.AsQueryable();
                if (!string.IsNullOrEmpty(productName)) {
                    query = query.Where(p => p.Name.Contains(productName));
                }
                var searchResults = query.ToList();
                return Ok(searchResults);
            }
            catch (Exception ex) {
                _logger.LogError("Error searching products by name:", ex);
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpPost("filter")]
        public IActionResult FilterProducts([FromBody] FilterDto filterDto)
        {
            try
            {
                var query = _context.Products.AsQueryable();
                if (filterDto != null) {
                    if (filterDto.Design != null) {
                        query = query.Where(p => p.Design == filterDto.Design);
                    }
                    if (filterDto.Product != null) {
                        query = query.Where(p => p.ProductLine == filterDto.Product);
                    }
                    if (filterDto.Material != null) {
                        query = query.Where(p => p.Material == filterDto.Material);
                    }
                    if (filterDto.Color != null) {
                        query = query.Where(p => p.Color == filterDto.Color);
                    }
                    if (filterDto.Price!=null) {
                        int? priceIndex = filterDto.Price;
                        switch (priceIndex) {
                            case 0:
                                query = query.Where(p => p.Price < 200);
                                break;
                            case 1:
                                query = query.Where(p => p.Price >= 200 && p.Price <= 299);
                                break;
                            case 2:
                                query = query.Where(p => p.Price >= 300 && p.Price <= 399);
                                break;
                            case 3:
                                query = query.Where(p => p.Price >= 400 && p.Price <= 499);
                                break;
                            case 4:
                                query = query.Where(p => p.Price >= 500 && p.Price <= 599);
                                break;
                            case 5:
                                query = query.Where(p => p.Price >= 600);
                                break;
                        }
                    }
                }
                var filteredProducts = query.ToList();
                return Ok(filteredProducts);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error filtering products:", ex);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
