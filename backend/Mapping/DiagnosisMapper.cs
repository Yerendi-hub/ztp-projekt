using Backend.Contracts;
using Backend.ModelClient;
using Backend.Parsing;

namespace Backend.Mapping;

public static class DiagnosisMapper
{
    public static DiagnosisResponse ToClientResponse(ModelPredictionResponse modelResponse, NormalizedPatientParameters patient)
    {
        var diabetesDetected = modelResponse.Diabetes.Prediction == 1;
        var heartDiseaseDetected = modelResponse.HeartDisease.Prediction == 1;
        var diabetesProbability = ToPercent(modelResponse.Diabetes.DiseaseProbability);
        var heartDiseaseProbability = ToPercent(modelResponse.HeartDisease.DiseaseProbability);

        return new DiagnosisResponse(
            Diabetes: new DiagnosisFlag(
                Detected: diabetesDetected,
                Label: ToLabel(diabetesDetected),
                ProbabilityPercent: diabetesProbability),
            HeartDisease: new HeartDiseaseDiagnosis(
                Detected: heartDiseaseDetected,
                Label: ToLabel(heartDiseaseDetected),
                ProbabilityPercent: heartDiseaseProbability),
            DiabetesProbability: diabetesProbability,
            HeartDiseaseProbability: heartDiseaseProbability,
            UsedData: ToUsedData(patient),
            AnalyzedAtUtc: DateTimeOffset.UtcNow);
    }

    private static IReadOnlyList<UsedPatientData> ToUsedData(NormalizedPatientParameters patient) =>
    [
        new("Age", patient.Age, "years"),
        new("Biological sex", patient.Sex, null),
        new("Weight", Round(patient.WeightKg), "kg"),
        new("Height", Round(patient.HeightCm), "cm"),
        new("BMI", Round(patient.Bmi), "kg/m2"),
        new("Tobacco smoking history", patient.SmokingHistory, null),
        new("HbA1c level", Round(patient.HemoglobinA1cLevel), "%"),
        new("Blood glucose level", Round(patient.BloodGlucoseMgDl), "mg/dL"),
        new("Fasting blood sugar", patient.FastingBloodSugar, null),
        new("Total cholesterol", Round(patient.CholesterolMgDl), "mg/dL"),
        new("Chest pain specification", patient.ChestPain, null),
        new("Resting blood pressure", Round(patient.RestingBloodPressureMmHg), "mmHg"),
        new("Resting ECG", patient.EcgObservationAtRestingCondition, null),
        new("Maximum heart rate", Round(patient.MaximumHeartRateAchieved), "bpm"),
        new("Exercise induced angina", patient.ExerciseInducedAngina, null),
        new("ST Depression", Round(patient.StDepressionInducedByExerciseRelativeToRest), "mm"),
        new("Peak exercise ST segment slope", patient.SlopeOfPeakExerciseStSegment, null),
        new("Major vessels", patient.NumberOfMajorVesselsColoredByFluoroscopy, null),
        new("Thalassemia", patient.Thal, null)
    ];

    private static string ToLabel(bool detected) => detected ? "Yes" : "No";

    private static double ToPercent(double probability) =>
        Math.Round(Math.Clamp(probability, 0, 1) * 100, 2, MidpointRounding.AwayFromZero);

    private static double? Round(double? value) =>
        value is null ? null : Math.Round(value.Value, 2, MidpointRounding.AwayFromZero);
}
