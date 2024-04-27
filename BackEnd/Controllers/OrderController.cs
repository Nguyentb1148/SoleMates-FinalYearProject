using BackEnd.Context;
using BackEnd.Dto;
using Backend.Models;
using BackEnd.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Order = Backend.Models.Order;

namespace BackEnd.Controllers;

[ApiController]
[Route("[controller]")]   
public class OrderController : ControllerBase
{
    private readonly ILogger<OrderController> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    public OrderController(ILogger<OrderController> logger, ApplicationDbContext context, IEmailService emailService)
    {
        _logger = logger;
        _context = context;
        _emailService = emailService;
    }
    [HttpPost("CreateOrder")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> CreateOrder([FromBody] RequestOrderDto requestOrderDto)
    {
        try {
            var order = new Order {
                OrderId = Guid.NewGuid(),
                DateTime = DateTime.UtcNow,
                TotalPrice = requestOrderDto.TotalPrice,
                Status = OrderStatus.Processing,
                UserId = requestOrderDto.UserId,
                Name = requestOrderDto.Name,
                Email = requestOrderDto.Email,
                PhoneNumber = requestOrderDto.PhoneNumber,
                Address = requestOrderDto.Address
            };
            foreach (var cartItem in requestOrderDto.CartItems) {
                
                var orderItem = new OrderItem {
                    OrderItemId = Guid.NewGuid(),
                    Quantity = cartItem.Quantity,
                    OrderId = order.OrderId,
                    ProductSizeId = cartItem.productSizeId,
                    TotalPrice = cartItem.TotalPrice
                };
                _context.OrderItems.Add(orderItem);
            }
            
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return Ok("Add new Order");
        }
        catch (Exception ex) {
            _logger.LogError($"Error creating order: {ex.Message}");
            return StatusCode(500, "Internal server error");
        }
    }
    [HttpGet("AllOrders")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> GetAllOrders()
    {
        try {
            var orders = await _context.Orders
                .ToListAsync();
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    [HttpGet("{orderId}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> GetOrderById(Guid orderId)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                return NotFound("Order not found");
            }

            var orderDto = new OrderDetailDto
            {
                OrderId = order.OrderId,
                DateTime = order.DateTime,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                UserId = order.UserId,
                Name = order.Name,
                Email = order.Email,
                PhoneNumber = order.PhoneNumber,
                Address = order.Address,
                OrderItems = order.OrderItems.Select(oi => {
                    var parts = oi.ProductSizeId?.Split('-');
                    return new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        Quantity = oi.Quantity,
                        Size = parts?.Length > 0 ? parts[0] : null,
                        ProductId = parts?.Length > 1 ? string.Join("-", parts.Skip(1)) : null,  
                        TotalPrice = oi.TotalPrice
                    };
                }).ToList()
            };
            return Ok(orderDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    [HttpPost("ConfirmOrder/{orderId}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> ConfirmOrder(Guid orderId)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                return NotFound("Order not found");
            }

            order.Status = OrderStatus.Shipping;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            // Send email with order details
            var orderDetails = await GetOrderDetails(orderId);
            var emailSubject = "Your order is on its way!";
            var emailBody = $"Your order is now in status {OrderStatus.Shipping} and is expected to be delivered in 2-3 days. You can use OrderId to search status<br><br>Order Details:<br>{orderDetails}";
            await _emailService.SendEmailAsync(order.Email, emailSubject, emailBody);

            return Ok("Order confirmed and status updated to Shipping");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    private async Task<string> GetOrderDetails(Guid orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.ProductSize)
            .ThenInclude(ps => ps.Product)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
        {
            return "Order not found";
        }

        var orderDto = new OrderDetailDto
        {
            OrderId = order.OrderId,
            DateTime = order.DateTime,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            UserId = order.UserId,
            Name = order.Name,
            Email = order.Email,
            PhoneNumber = order.PhoneNumber,
            Address = order.Address,
            OrderItems = order.OrderItems.Select(oi => {
                var parts = oi.ProductSizeId?.Split('-');
                var product = oi.ProductSize?.Product;
                var firstImageUrl = product?.ImageUrls?.FirstOrDefault();
                return new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    Quantity = oi.Quantity,
                    ProductName = product.Name,
                    Size = parts?.Length > 0 ? parts[0] : null,
                    ProductId = parts?.Length > 1 ? string.Join("-", parts.Skip(1)) : null,
                    TotalPrice = oi.TotalPrice,
                    ImageUrl = firstImageUrl
                };
            }).ToList()
        };

        return $"Order ID: {orderDto.OrderId}<br>" +
               $"Date/Time: {orderDto.DateTime}<br>" +
               $"Total Price: ${orderDto.TotalPrice} USD<br>" +
               $"Status: {orderDto.Status}<br>" +
               $"Name: {orderDto.Name}<br>" +
               "Order Items:<br>" +
               string.Join("<br>", orderDto.OrderItems.Select(oi => $"<div style='border: 1px solid #ddd; padding: 10px; display: flex; align-items: center;'><div style='flex: 0 0 200px; margin-right: 10px;'><img src='{oi.ImageUrl}' width='200' height='200'></div><div><h4>{oi.ProductName}</h4><p>Size: {oi.Size}</p><p>Quantity: {oi.Quantity}</p><p>Total Price: ${oi.TotalPrice} USD</p></div></div>"));
    }
    
    [HttpPost("CancelOrder/{orderId}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> CancelOrder(Guid orderId)
    {
        try {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) {
                return NotFound("Order not found");
            }
            Console.WriteLine($" email send message cancel: {order.Email}");
            order.Status = OrderStatus.Cancelled;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
            
            var emailSubject = "Your order has been cancelled";
            var emailBody = "We regret to inform you that your order has been cancelled.";
            await _emailService.SendEmailAsync(order.Email, emailSubject, emailBody);
            return Ok("Order cancelled successfully");
        }
        catch (Exception ex) {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("DeliverOrder/{orderId}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> DeliverOrder(Guid orderId)
    {
        try
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound("Order not found");
            }
            order.Status = OrderStatus.Delivered;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            var confirmationLink = $"http://localhost:3000/confirm-delivery?orderId={orderId}";
            var emailSubject = "Your order has been delivered";
            var emailBody = $"Your order has been delivered successfully. If you have received your order, please confirm delivery by clicking the following link: <a href='{confirmationLink}'>Confirm Delivery</a>";
            await _emailService.SendEmailAsync(order.Email, emailSubject, emailBody);
            return Ok("Order delivered successfully");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    
    [HttpPost("SearchOrder")]
    public async Task<IActionResult> SearchOrder([FromBody] SearchOrderDto searchOrderDto)
    {
        try {
            if ( searchOrderDto.OrderId == null || !(searchOrderDto.OrderId is Guid))
            {
                return BadRequest();
            }
            _logger.LogInformation($"{searchOrderDto.OrderId} - {searchOrderDto.Email}");
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductSize)
                .ThenInclude(ps => ps.Product)
                .FirstOrDefaultAsync(o => o.OrderId == searchOrderDto.OrderId && o.Email == searchOrderDto.Email);

            if (order == null ) {
                return NotFound("Order not found");
            }
            var orderDetailDto = new OrderDetailDto
            {
                OrderId = order.OrderId,
                DateTime = order.DateTime,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                UserId = order.UserId,
                Name = order.Name,
                Email = order.Email,
                PhoneNumber = order.PhoneNumber,
                Address = order.Address,
                OrderItems = order.OrderItems.Select(oi => {
                    var parts = oi.ProductSizeId?.Split('-');
                    var product = oi.ProductSize?.Product;
                    var firstImageUrl = product?.ImageUrls?.FirstOrDefault();
                    return new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        Quantity = oi.Quantity,
                        ProductName = product.Name,
                        Size = parts?.Length > 0 ? parts[0] : null,
                        ProductId = parts?.Length > 1 ? string.Join("-", parts.Skip(1)) : null,
                        TotalPrice = oi.TotalPrice,
                        ImageUrl = firstImageUrl
                    };
                }).ToList()
            };          
            return Ok(orderDetailDto);
        }
        catch (Exception ex) {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

public class SearchOrderDto
{
    public Guid? OrderId { get; set; }
    public string? Email { get; set; }
}
public class OrderItemDto
{
    public Guid? OrderItemId { get; set; }
    public string? ProductName { get; set; }
    public int? Quantity { get; set; }
    public string? Size { get; set; }
    public string? ProductId { get; set; }
    public decimal? TotalPrice { get; set; }
    public string? ImageUrl { get; set; }
}
public class OrderDetailDto
{
    public Guid? OrderId { get; set; }
    public DateTime? DateTime { get; set; }
    public decimal? TotalPrice { get; set; }
    public OrderStatus? Status { get; set; }
    public string? UserId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public List<OrderItemDto> OrderItems { get; set; }
}