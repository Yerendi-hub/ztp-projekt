namespace Backend.Parsing;

public sealed record NormalizedPatientParameters(
    int Age,
    string Sex,
    double? WeightKg,
    double? HeightCm,
    double? Bmi,
    string? SmokingHistory,
    double? HemoglobinA1cLevel,
    double? BloodGlucoseMgDl,
    string? ChestPain,
    double? RestingBloodPressureMmHg,
    double? CholesterolMgDl,
    string? FastingBloodSugar,
    string? EcgObservationAtRestingCondition,
    double? MaximumHeartRateAchieved,
    string? ExerciseInducedAngina,
    double? StDepressionInducedByExerciseRelativeToRest,
    string? SlopeOfPeakExerciseStSegment,
    int? NumberOfMajorVesselsColoredByFluoroscopy,
    string? Thal);
