using lol_twitch_vods_api.Configuration;
using lol_twitch_vods_api.Services;
using lol_twitch_vods_api.Endpoints;
using lol_twitch_vods_api.Data;
using lol_twitch_vods_api.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options => 
	{ options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()); });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection") ?? 
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SupportNonNullableReferenceTypes();
    options.SchemaFilter<RequireNonNullablePropertiesSchemaFilter>();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowSpecificOrigins",
        policy =>
        {
            // TODO: Add url from env var
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.Configure<TwitchApiConfiguration>(
      builder.Configuration.GetSection("TwitchApi"));

builder.Services.Configure<RiotGamesApiConfiguration>(
      builder.Configuration.GetSection("RiotGamesApi"));

builder.Services.AddScoped<TwitchService>();
builder.Services.AddScoped<RiotGamesService>();
builder.Services.AddHttpClient();

var app = builder.Build();

app.MapTwitchEndpoints();
app.MapRiotGamesEndpoints();
app.MapStreamerEndpoints();
app.MapMatchEndpoints();
app.UseCors("AllowSpecificOrigins");

if (app.Environment.IsDevelopment())
  {
    app.UseSwagger();
    app.UseSwaggerUI();
  }

app.Run();
//TODO: prevent complete internal error response