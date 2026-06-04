namespace Backend.ModelClient;

public sealed class ModelClientOptions
{
    public const string SectionName = "ModelClient";

    public string BaseUrl { get; init; } = "http://localhost:8000";

    public string PredictPath { get; init; } = "/predict";

    public int TimeoutSeconds { get; init; } = 30;
}
