namespace Backend.Contracts;

public sealed record DiagnosisResponse(
    DiagnosisFlag Diabetes,
    HeartDiseaseDiagnosis HeartDisease,
    double DiabetesProbability,
    double HeartDiseaseProbability,
    IReadOnlyList<UsedPatientData> UsedData,
    DateTimeOffset AnalyzedAtUtc);

public sealed record DiagnosisFlag(bool Detected, string Label, double ProbabilityPercent);

public sealed record HeartDiseaseDiagnosis(
    bool Detected,
    string Label,
    double ProbabilityPercent);

public sealed record UsedPatientData(string Label, object? Value, string? Unit);

public sealed record ValidationErrorResponse(string Message, IReadOnlyList<string> Errors);
