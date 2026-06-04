using System.Text.Json.Serialization;

namespace Backend.ModelClient;

public sealed record ModelPredictionResponse(
    [property: JsonPropertyName("diabetes")] DiseasePrediction Diabetes,
    [property: JsonPropertyName("heart_disease")] DiseasePrediction HeartDisease);

public sealed record DiseasePrediction(
    [property: JsonPropertyName("model")] string Model,
    [property: JsonPropertyName("disease_probability")] double DiseaseProbability,
    [property: JsonPropertyName("prediction")] int Prediction);
