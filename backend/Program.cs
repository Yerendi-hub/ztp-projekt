using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.ModelClient;
using Backend.Parsing;
using Backend.Validation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000", "http://localhost:5173"];
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddSingleton<IPatientInputValidator, PatientInputValidator>();
builder.Services.AddSingleton<IMedicalUnitNormalizer, MedicalUnitNormalizer>();
builder.Services.AddSingleton<IModelFeatureParser, ModelFeatureParser>();
builder.Services.AddSingleton<IPatientPdfParser, PatientPdfParser>();

builder.Services.Configure<ModelClientOptions>(builder.Configuration.GetSection(ModelClientOptions.SectionName));
builder.Services.AddHttpClient<IModelPredictionClient, ModelPredictionClient>();

var app = builder.Build();

app.UseCors("Frontend");

app.MapControllers();
app.MapGet("/", () => Results.Ok(new
{
    service = "diagnostic-backend",
    status = "ok",
    endpoints = new
    {
        health = "GET /health",
        prediction = "POST /api/diagnosis/predict"
    }
}));
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
