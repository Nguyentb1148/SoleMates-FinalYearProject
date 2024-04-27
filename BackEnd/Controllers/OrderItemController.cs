using BackEnd.Context;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme , Roles="StoreOwner")]
    [Route("[controller]")]
    public class OrderItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderItemController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public ActionResult<OrderItem> GetOrderItemById(int id)
        {
            var orderItem = _context.OrderItems.Find(id);
            if (orderItem == null)
            {
                return NotFound();
            }
            return orderItem;
        }

        [HttpPost]
        public ActionResult<OrderItem> AddOrderItem(OrderItem orderItem)
        {
            _context.OrderItems.Add(orderItem);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetOrderItemById), new { id = orderItem.OrderItemId }, orderItem);
        }
        
        [HttpPut("{orderItemId}")] 
        public async Task<IActionResult> ConfirmOrder(Guid? orderItemId)
        {
            var orderItem = await _context.OrderItems
                .Include(oi => oi.ProductSize)
                .FirstOrDefaultAsync(oi => oi.OrderItemId == orderItemId);


            if (orderItem == null) {
                return NotFound();
            }

            if (orderItem.ProductSize != null) {
                if (orderItem.ProductSize.Quantity >= orderItem.Quantity) {
                    orderItem.ProductSize.Quantity -= orderItem.Quantity;
                    _context.Update(orderItem);
                    await _context.SaveChangesAsync();
                    return Ok(new {message = "confirm order item"});
                } else {
                    return BadRequest($"Not enough stock. Available: {orderItem.ProductSize.Quantity}, Requested: {orderItem.Quantity}");
                }
            } else {
                return BadRequest("Product size details not found.");
            }
        }

    }
}
