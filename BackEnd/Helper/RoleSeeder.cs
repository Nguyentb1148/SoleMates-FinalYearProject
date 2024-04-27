using Microsoft.AspNetCore.Identity;
using BackEnd.Models; 

namespace BackEnd.Helper;
    public interface IRoleSeeder
    {
        Task SeedRolesAsync();
    }

    public class RoleSeeder : IRoleSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        public RoleSeeder(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }
        public async Task SeedRolesAsync()
        {
            if (!await _roleManager.RoleExistsAsync(Roles.User)) {
                await _roleManager.CreateAsync(new IdentityRole(Roles.User));
            }
            if (!await _roleManager.RoleExistsAsync(Roles.StoreOwner)) {
                await _roleManager.CreateAsync(new IdentityRole(Roles.StoreOwner));
            }
            if (!await _roleManager.RoleExistsAsync(Roles.Admin)) {
                await _roleManager.CreateAsync(new IdentityRole(Roles.Admin));
            }
        }
    }
