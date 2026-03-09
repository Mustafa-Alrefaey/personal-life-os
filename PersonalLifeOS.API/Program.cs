using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PersonalLifeOS.Infrastructure.Identity;
using PersonalLifeOS.Infrastructure.Persistence;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel request body size for file uploads (50 MB)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 50 * 1024 * 1024;
});

// Configure form options for multipart uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 50 * 1024 * 1024;
});

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Configure Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForDevelopment12345678"; // Fallback for development

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "PersonalLifeOSAPI",
        ValidAudience = jwtSettings["Audience"] ?? "PersonalLifeOSClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Register repositories
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Repositories.TaskRepository>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Repositories.JournalRepository>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Repositories.ReceiptRepository>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Repositories.BillRepository>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Repositories.TransactionRepository>();

// Register application services
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Services.TaskService>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Services.JournalService>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Services.ReceiptService>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Services.BillService>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Services.TransactionService>();
builder.Services.AddScoped<PersonalLifeOS.Infrastructure.Services.DashboardService>();

// Register Google Drive storage service
var driveSettings = builder.Configuration.GetSection("GoogleDrive");
builder.Services.AddSingleton(new PersonalLifeOS.Infrastructure.FileStorage.GoogleDriveStorageService(
    driveSettings["ClientId"]!,
    driveSettings["ClientSecret"]!,
    driveSettings["RefreshToken"]!,
    driveSettings["FolderId"]!
));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173",
                  "http://localhost:5174",
                  "http://localhost:5175",
                  "http://localhost:5176",
                  "http://localhost:3000"
              ) // Vite dev ports
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Personal Life OS API",
        Version = "v1",
        Description = "Personal productivity and life management API"
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Personal Life OS API V1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
