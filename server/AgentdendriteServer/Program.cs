// c:\D\01-Projects\Agentdendrite\server\AgentdendriteServer\Program.cs
global using AgentdendriteServer.Utils;

using AgentdendriteServer.Controllers.ChatFeature;

var builder = WebApplication.CreateBuilder(args);


// ===================== 注册处 =========================
builder.Services.AddHttpClient<LlmService>();
builder.Services.AddControllers();
builder.Services.AddScoped<JsonlStore>();



string[] allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
  options.AddPolicy("Cors", policy =>
  {
    policy.AllowAnyMethod().AllowAnyHeader();
    if (allowedOrigins.Length == 0)
    {
      // 未配置来源时默认开放（开发场景）
      policy.SetIsOriginAllowed(_ => true);
    }
    else
    {
      // 配置了来源则只允许这些来源（生产场景）
      policy.WithOrigins(allowedOrigins);
    }
  });
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

app.UseCors("Cors");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
