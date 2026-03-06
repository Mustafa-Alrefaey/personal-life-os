using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Validation failed", errors));
        }

        // Check if user already exists
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse(
                "User already exists",
                new List<string> { "An account with this email already exists" }
            ));
        }

        // Create new user
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            EmailConfirmed = true // Auto-confirm for development
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Registration failed", errors));
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            Email = user.Email!,
            FullName = user.FullName,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetJwtExpiryMinutes())
        };

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(response, "Registration successful"));
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Validation failed", errors));
        }

        // Find user by email
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse(
                "Invalid credentials",
                new List<string> { "Email or password is incorrect" }
            ));
        }

        // Check password
        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse(
                "Invalid credentials",
                new List<string> { "Email or password is incorrect" }
            ));
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            Email = user.Email!,
            FullName = user.FullName,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetJwtExpiryMinutes())
        };

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(response, "Login successful"));
    }

    #region Private Helper Methods

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForDevelopment12345678";
        var issuer = jwtSettings["Issuer"] ?? "PersonalLifeOSAPI";
        var audience = jwtSettings["Audience"] ?? "PersonalLifeOSClient";

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.Id),  // explicitly set for GetCurrentUserId()
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("FullName", user.FullName ?? string.Empty)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetJwtExpiryMinutes()),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private int GetJwtExpiryMinutes()
    {
        var expiryMinutes = _configuration.GetSection("JwtSettings")["ExpiryInMinutes"];
        return int.TryParse(expiryMinutes, out var minutes) ? minutes : 60;
    }

    #endregion
}
