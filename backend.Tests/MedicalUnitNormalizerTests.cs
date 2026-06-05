using Backend.Contracts;
using Backend.Parsing;

namespace Backend.Tests;

public sealed class MedicalUnitNormalizerTests
{
    private readonly MedicalUnitNormalizer _normalizer = new();

    [Fact]
    public void Normalize_maps_aliases_and_calculates_bmi()
    {
        var request = new PatientParametersRequest
        {
            Age = "60",
            Gender = "F",
            Weight = "70",
            Height = "175",
            SmokingHistory = "not-current",
            ChestPain = "typical",
            RestingEcg = "hypertrophy",
            FastingSugar = "121",
            ExerciseAngina = "yes",
            StSlope = "downsloping",
            Thal = "fixed",
            MajorVessels = "2"
        };

        var normalized = _normalizer.Normalize(request);

        Assert.Equal(60, normalized.Age);
        Assert.Equal("Female", normalized.Sex);
        Assert.Equal("not current", normalized.SmokingHistory);
        Assert.Equal("typical angina", normalized.ChestPain);
        Assert.Equal("lv hypertrophy", normalized.EcgObservationAtRestingCondition);
        Assert.Equal("True", normalized.FastingBloodSugar);
        Assert.Equal("True", normalized.ExerciseInducedAngina);
        Assert.Equal("downsloping", normalized.SlopeOfPeakExerciseStSegment);
        Assert.Equal("fixed defect", normalized.Thal);
        Assert.Equal(2, normalized.NumberOfMajorVesselsColoredByFluoroscopy);
        Assert.Equal(22.857, normalized.Bmi!.Value, precision: 3);
    }

    [Fact]
    public void Normalize_converts_common_units_to_model_units()
    {
        var request = new PatientParametersRequest
        {
            Age = "40",
            Sex = "male",
            Weight = "154.3234",
            Height = "70",
            BloodGlucose = "7.2",
            Cholesterol = "5.5",
            RestingBloodPressure = "16",
            Units = new PatientUnitRequest(
                Weight: "lb",
                Height: "in",
                BloodGlucose: "mmol/l",
                Cholesterol: "mmol/l",
                RestingBloodPressure: "kPa")
        };

        var normalized = _normalizer.Normalize(request);

        Assert.Equal(70, normalized.WeightKg!.Value, precision: 3);
        Assert.Equal(177.8, normalized.HeightCm!.Value, precision: 3);
        Assert.Equal(129.731, normalized.BloodGlucoseMgDl!.Value, precision: 3);
        Assert.Equal(212.684, normalized.CholesterolMgDl!.Value, precision: 3);
        Assert.Equal(120.010, normalized.RestingBloodPressureMmHg!.Value, precision: 3);
    }

    [Theory]
    [InlineData("120", "False")]
    [InlineData("121", "True")]
    [InlineData("no", "False")]
    public void Normalize_derives_fasting_blood_sugar_flag(string input, string expected)
    {
        var request = new PatientParametersRequest
        {
            Age = "50",
            Sex = "Male",
            FastingSugar = input
        };

        var normalized = _normalizer.Normalize(request);

        Assert.Equal(expected, normalized.FastingBloodSugar);
    }
}
