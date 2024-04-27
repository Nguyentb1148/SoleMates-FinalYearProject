using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BackEnd.Context;
using BackEnd.Helper;
using Backend.MiddleWare;
using Backend.Models;
using BackEnd.Repo;
using BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using PayPalHttp;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Identity services
builder.Services.AddIdentity<ApplicationUser, IdentityRole>() 
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders(); 
// Map controllers here
builder.Services.AddControllers();
// Add RoleSeederM
builder.Services.AddScoped<IRoleSeeder, RoleSeeder>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailServices>();

builder.Services.AddScoped<UserRepository>(); 
builder.Services.AddScoped<TokenService>();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<PayPalHttpClient>(serviceProvider => {
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var clientId = config["PayPalSettings:ClientId"];
    var clientSecret = config["PayPalSettings:ClientSecret"];
    var environment = new SandboxEnvironment(clientId, clientSecret);
    return new PayPalHttpClient(environment);
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]))
        };
    });

builder.Services.AddAuthorization(options => {
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
builder.Services.AddHttpContextAccessor(); 

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(a => a.Run(async context => {
    var exception = context.Features.Get<IExceptionHandlerPathFeature>()?.Error;
    var logger = context.RequestServices.GetService<ILogger<Program>>();
    if (logger != null) logger.LogError(exception, "Unhandled exception.");
    context.Response.StatusCode = 500;
    await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred." });
}));

app.UseCors("AllowSpecificOrigin");
app.UseHttpsRedirection();
app.UseRouting();
app.UseMiddleware<JwtMiddleware>();
app.UseAuthentication(); 
app.UseAuthorization();

app.UseStaticFiles();
// Add this block before app.Run() to seed roles
using (var scope = app.Services.CreateScope()) {
    var services = scope.ServiceProvider;
    try {
        var roleSeeder = services.GetRequiredService<IRoleSeeder>();
        await roleSeeder.SeedRolesAsync(); // Seed roles
    }
    catch (Exception ex) {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.MapControllers();

app.Run();
