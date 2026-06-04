namespace Backend.Contracts;

public sealed record PatientParametersRequest
{
    public string? Age { get; init; }

    public string? Sex { get; init; }

    public string? Gender { get; init; }

    public string? Weight { get; init; }

    public string? Height { get; init; }

    public string? SmokingHistory { get; init; }

    public string? HbA1c { get; init; }

    public string? HemoglobinA1cLevel { get; init; }

    public string? BloodGlucose { get; init; }

    public string? BloodGlucoseLevel { get; init; }

    public string? FastingSugar { get; init; }

    public bool? FastingBloodSugar { get; init; }

    public string? Cholesterol { get; init; }

    public string? CholesterolMeasure { get; init; }

    public string? ChestPain { get; init; }

    public string? RestingBloodPressure { get; init; }

    public string? RestingEcg { get; init; }

    public string? EcgObservationAtRestingCondition { get; init; }

    public string? MaxHeartRate { get; init; }

    public string? MaximumHeartRateAchieved { get; init; }

    public string? ExerciseAngina { get; init; }

    public bool? ExerciseInducedAngina { get; init; }

    public string? StDepression { get; init; }

    public string? StDepressionInducedByExerciseRelativeToRest { get; init; }

    public string? StSlope { get; init; }

    public string? SlopeOfPeakExerciseStSegment { get; init; }

    public string? MajorVessels { get; init; }

    public string? NumberOfMajorVesselsColoredByFluoroscopy { get; init; }

    public string? Thal { get; init; }

    public PatientUnitRequest? Units { get; init; }
}

public sealed record PatientUnitRequest(
    string? Weight = null,
    string? Height = null,
    string? BloodGlucose = null,
    string? Cholesterol = null,
    string? RestingBloodPressure = null);
