using Backend.Contracts;
using Backend.Validation;

namespace Backend.Tests;

public sealed class PatientInputValidatorTests
{
    private readonly PatientInputValidator _validator = new();

    [Fact]
    public void Validate_accepts_required_fields_and_supported_optional_values()
    {
        var request = new PatientParametersRequest
        {
            Age = "54",
            Sex = "female",
            FastingSugar = "yes",
            ChestPain = "non-anginal pain",
            RestingEcg = "st-t abnormality",
            ExerciseAngina = "no",
            StSlope = "flat",
            Thal = "reversible defect",
            MajorVessels = "3"
        };

        var result = _validator.Validate(request);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void Validate_reports_missing_required_fields()
    {
        var result = _validator.Validate(new PatientParametersRequest());

        Assert.False(result.IsValid);
        Assert.Contains("Age is required.", result.Errors);
        Assert.Contains("Sex is required.", result.Errors);
    }

    [Fact]
    public void Validate_reports_out_of_range_and_unsupported_values()
    {
        var request = new PatientParametersRequest
        {
            Age = "131",
            Sex = "unknown",
            HbA1c = "21",
            RestingBloodPressure = "20",
            ChestPain = "sharp",
            ExerciseAngina = "sometimes",
            MajorVessels = "4"
        };

        var result = _validator.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains("Age must be between 0 and 130.", result.Errors);
        Assert.Contains("Sex has unsupported value 'unknown'.", result.Errors);
        Assert.Contains("HbA1c must be between 0 and 20.", result.Errors);
        Assert.Contains("RestingBloodPressure must be between 30 and 350.", result.Errors);
        Assert.Contains("ChestPain has unsupported value 'sharp'.", result.Errors);
        Assert.Contains("ExerciseAngina has unsupported value 'sometimes'.", result.Errors);
        Assert.Contains("MajorVessels must be between 0 and 3.", result.Errors);
    }

    [Theory]
    [InlineData("true")]
    [InlineData("False")]
    [InlineData("119")]
    public void Validate_accepts_fasting_sugar_as_boolean_or_numeric_measurement(string fastingSugar)
    {
        var request = new PatientParametersRequest
        {
            Age = "45",
            Sex = "M",
            FastingSugar = fastingSugar
        };

        var result = _validator.Validate(request);

        Assert.True(result.IsValid);
    }
}
