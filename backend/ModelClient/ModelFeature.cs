namespace Backend.ModelClient;

public sealed record ModelPredictionRequest(
    IReadOnlyDictionary<string, IReadOnlyDictionary<string, object?>> Payloads);
