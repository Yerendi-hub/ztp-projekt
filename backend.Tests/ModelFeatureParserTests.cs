using Backend.Parsing;

namespace Backend.Tests;

public sealed class ModelFeatureParserTests
{
    [Fact]
    public void Parse_builds_expected_payloads_for_diabetes_and_heart_disease_models()
    {
        var patient = new NormalizedPatientParameters(
            Age: 58,
            Sex: "Male",
            WeightKg: 83.4,
            HeightCm: 181.2,
            Bmi: 25.39876,
            SmokingHistory: "former",
            HemoglobinA1cLevel: 6.45678,
            BloodGlucoseMgDl: 143.33333,
            ChestPain: "asymptomatic",
            RestingBloodPressureMmHg: 132.22222,
            CholesterolMgDl: 241.98765,
            FastingBloodSugar: "True",
            EcgObservationAtRestingCondition: "normal",
            MaximumHeartRateAchieved: 151.55555,
            ExerciseInducedAngina: "False",
            StDepressionInducedByExerciseRelativeToRest: 1.23456,
            SlopeOfPeakExerciseStSegment: "flat",
            NumberOfMajorVesselsColoredByFluoroscopy: 1,
            Thal: "normal");
        var parser = new ModelFeatureParser();

        var request = parser.Parse(patient);

        Assert.True(request.Payloads.ContainsKey("diabetes"));
        Assert.True(request.Payloads.ContainsKey("heart_disease"));

        var diabetes = request.Payloads["diabetes"];
        Assert.Equal(58, diabetes["age"]);
        Assert.Equal(25.3988, Assert.IsType<double>(diabetes["bmi"]));
        Assert.Equal(6.4568, Assert.IsType<double>(diabetes["HbA1c_level"]));
        Assert.Equal(143.3333, Assert.IsType<double>(diabetes["blood_glucose_level"]));
        Assert.Equal("Male", diabetes["sex"]);
        Assert.Equal("former", diabetes["smoking_history"]);

        var heartDisease = request.Payloads["heart_disease"];
        Assert.Equal(58, heartDisease["age"]);
        Assert.Equal(132.2222, Assert.IsType<double>(heartDisease["trestbps"]));
        Assert.Equal(241.9877, Assert.IsType<double>(heartDisease["chol"]));
        Assert.Equal(151.5556, Assert.IsType<double>(heartDisease["thalch"]));
        Assert.Equal(1.2346, Assert.IsType<double>(heartDisease["oldpeak"]));
        Assert.Equal(1, heartDisease["ca"]);
        Assert.Equal("Male", heartDisease["sex"]);
        Assert.Equal("asymptomatic", heartDisease["cp"]);
        Assert.Equal("True", heartDisease["fbs"]);
        Assert.Equal("normal", heartDisease["restecg"]);
        Assert.Equal("False", heartDisease["exang"]);
        Assert.Equal("flat", heartDisease["slope"]);
        Assert.Equal("normal", heartDisease["thal"]);
    }

    [Fact]
    public void Parse_preserves_null_optional_values_in_payload()
    {
        var patient = new NormalizedPatientParameters(
            Age: 30,
            Sex: "Female",
            WeightKg: null,
            HeightCm: null,
            Bmi: null,
            SmokingHistory: null,
            HemoglobinA1cLevel: null,
            BloodGlucoseMgDl: null,
            ChestPain: null,
            RestingBloodPressureMmHg: null,
            CholesterolMgDl: null,
            FastingBloodSugar: null,
            EcgObservationAtRestingCondition: null,
            MaximumHeartRateAchieved: null,
            ExerciseInducedAngina: null,
            StDepressionInducedByExerciseRelativeToRest: null,
            SlopeOfPeakExerciseStSegment: null,
            NumberOfMajorVesselsColoredByFluoroscopy: null,
            Thal: null);

        var request = new ModelFeatureParser().Parse(patient);

        Assert.Null(request.Payloads["diabetes"]["bmi"]);
        Assert.Null(request.Payloads["diabetes"]["smoking_history"]);
        Assert.Null(request.Payloads["heart_disease"]["trestbps"]);
        Assert.Null(request.Payloads["heart_disease"]["thal"]);
    }
}
