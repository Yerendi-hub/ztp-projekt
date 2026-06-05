using Backend.Mapping;
using Backend.ModelClient;
using Backend.Parsing;

namespace Backend.Tests;

public sealed class DiagnosisMapperTests
{
    [Fact]
    public void ToClientResponse_maps_predictions_probabilities_and_used_data()
    {
        var modelResponse = new ModelPredictionResponse(
            Diabetes: new DiseasePrediction("diabetes-model", 0.87654, 1),
            HeartDisease: new DiseasePrediction("heart-model", 0.12345, 0));
        var patient = CreatePatient();

        var before = DateTimeOffset.UtcNow;
        var response = DiagnosisMapper.ToClientResponse(modelResponse, patient);
        var after = DateTimeOffset.UtcNow;

        Assert.True(response.Diabetes.Detected);
        Assert.Equal("Yes", response.Diabetes.Label);
        Assert.Equal(87.65, response.Diabetes.ProbabilityPercent);
        Assert.Equal(87.65, response.DiabetesProbability);

        Assert.False(response.HeartDisease.Detected);
        Assert.Equal("No", response.HeartDisease.Label);
        Assert.Equal(12.35, response.HeartDisease.ProbabilityPercent);
        Assert.Equal(12.35, response.HeartDiseaseProbability);

        Assert.InRange(response.AnalyzedAtUtc, before, after);
        Assert.Equal(19, response.UsedData.Count);
        Assert.Contains(response.UsedData, item => item.Label == "BMI" && (double)item.Value! == 24.69 && item.Unit == "kg/m2");
        Assert.Contains(response.UsedData, item => item.Label == "Fasting blood sugar" && (string)item.Value! == "False");
        Assert.Contains(response.UsedData, item => item.Label == "Major vessels" && (int)item.Value! == 0);
    }

    [Theory]
    [InlineData(-0.5, 0)]
    [InlineData(1.5, 100)]
    public void ToClientResponse_clamps_model_probabilities_to_percent_range(double probability, double expected)
    {
        var modelResponse = new ModelPredictionResponse(
            Diabetes: new DiseasePrediction("diabetes-model", probability, 0),
            HeartDisease: new DiseasePrediction("heart-model", probability, 0));

        var response = DiagnosisMapper.ToClientResponse(modelResponse, CreatePatient());

        Assert.Equal(expected, response.DiabetesProbability);
        Assert.Equal(expected, response.HeartDiseaseProbability);
    }

    private static NormalizedPatientParameters CreatePatient() =>
        new(
            Age: 46,
            Sex: "Female",
            WeightKg: 72.345,
            HeightCm: 171.155,
            Bmi: 24.685,
            SmokingHistory: "never",
            HemoglobinA1cLevel: 5.432,
            BloodGlucoseMgDl: 98.765,
            ChestPain: "atypical angina",
            RestingBloodPressureMmHg: 118.555,
            CholesterolMgDl: 190.444,
            FastingBloodSugar: "False",
            EcgObservationAtRestingCondition: "normal",
            MaximumHeartRateAchieved: 162.222,
            ExerciseInducedAngina: "False",
            StDepressionInducedByExerciseRelativeToRest: 0.345,
            SlopeOfPeakExerciseStSegment: "upsloping",
            NumberOfMajorVesselsColoredByFluoroscopy: 0,
            Thal: "normal");
}
