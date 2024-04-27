using Backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Context;

public class ApplicationDbContext :IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<ApplicationUser> ApplicationUsers { get; set; }
    public DbSet<EmailConfirmation> EmailConfirmations { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<ProductSize> ProductSizes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure the relationships
        ConfigureUserRelationships(modelBuilder);
        ConfigureOrderRelationships(modelBuilder);
        ConfigureProductRelationships(modelBuilder);

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");
    }


    private void ConfigureUserRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EmailConfirmation>()
            .HasKey(e => e.Id); // Specify primary key
        // Optional: Configure relationships or constraints
        modelBuilder.Entity<EmailConfirmation>()
            .HasIndex(e => e.Email); // Ensure unique email

        modelBuilder.Entity<EmailConfirmation>()
            .Property(e => e.Type)
            .IsRequired();
        modelBuilder.Entity<ApplicationUser>()
            .HasMany(u => u.EmailConfirmations)  // One ApplicationUser has many EmailConfirmations
            .WithOne(ec => ec.User)              // Each EmailConfirmation belongs to one ApplicationUser
            .HasForeignKey(ec => ec.UserId)     // Foreign key in EmailConfirmation table
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureOrderRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>()
            .HasOne<ApplicationUser>(o => o.User) 
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)      
            .IsRequired();                      

        modelBuilder.Entity<Order>()
            .HasKey(o => o.OrderId);

        modelBuilder.Entity<OrderItem>()
            .HasKey(oi => oi.OrderItemId);
        
        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order) 
            .WithMany(o => o.OrderItems) 
            .HasForeignKey(oi => oi.OrderId)
            .IsRequired() 
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
            .HasMany<OrderItem>(o => o.OrderItems) 
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureProductRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>()
            .HasKey(p => p.ProductId);

        modelBuilder.Entity<ProductSize>()
            .HasKey(ps => ps.ProductSizeId);

        modelBuilder.Entity<Product>()
            .HasMany(p => p.ProductSizes)
            .WithOne(ps => ps.Product)
            .HasForeignKey(ps => ps.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.ProductSize)
            .WithMany()
            .HasForeignKey(oi => oi.ProductSizeId)
            .OnDelete(DeleteBehavior.SetNull); // Check if setting to null on delete is intended

    }

}
