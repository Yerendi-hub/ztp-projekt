using Backend.Contracts;
using Backend.Parsing;
using System.Globalization;

namespace Backend.Validation;

public sealed class PatientInputValidator : IPatientInputValidator
{
    public ValidationResult Validate(PatientParametersRequest request)
    {
        var errors = new List<string>();

        ValidateRequiredRange(request.Age, 0, 130, nameof(request.Age), errors);
        ValidateAllowed(FirstText(request.Sex, request.Gender), FeatureVocabulary.Sex, nameof(request.Sex), errors, required: true);

        ValidateOptionalRange(request.Weight, 20, 800, nameof(request.Weight), errors);
        ValidateOptionalRange(request.Height, 0.5, 300, nameof(request.Height), errors);
        ValidateOptionalRange(FirstText(request.HbA1c, request.HemoglobinA1cLevel), 0, 20, nameof(request.HbA1c), errors);
        ValidateOptionalRange(FirstText(request.BloodGlucose, request.BloodGlucoseLevel), 0, 1000, nameof(request.BloodGlucose), errors);
        ValidateOptionalBooleanOrRange(FirstText(request.FastingSugar, request.FastingBloodSugar?.ToString()), 0, 1000, nameof(request.FastingSugar), errors);
        ValidateOptionalRange(request.RestingBloodPressure, 30, 350, nameof(request.RestingBloodPressure), errors);
        ValidateOptionalRange(FirstText(request.Cholesterol, request.CholesterolMeasure), 0, 1000, nameof(request.Cholesterol), errors);
        ValidateOptionalRange(FirstText(request.MaxHeartRate, request.MaximumHeartRateAchieved), 20, 260, nameof(request.MaxHeartRate), errors);
        ValidateOptionalRange(FirstText(request.StDepression, request.StDepressionInducedByExerciseRelativeToRest), -10, 20, nameof(request.StDepression), errors);
        ValidateOptionalRange(FirstText(request.MajorVessels, request.NumberOfMajorVesselsColoredByFluoroscopy), 0, 3, nameof(request.MajorVessels), errors);

        ValidateAllowed(request.SmokingHistory, FeatureVocabulary.SmokingHistory, nameof(request.SmokingHistory), errors);
        ValidateAllowed(request.ChestPain, FeatureVocabulary.ChestPain, nameof(request.ChestPain), errors);
        ValidateAllowed(FirstText(request.RestingEcg, request.EcgObservationAtRestingCondition), FeatureVocabulary.RestingEcg, nameof(request.RestingEcg), errors);
        ValidateAllowed(FirstText(request.StSlope, request.SlopeOfPeakExerciseStSegment), FeatureVocabulary.StSlope, nameof(request.StSlope), errors);
        ValidateAllowed(request.Thal, FeatureVocabulary.Thal, nameof(request.Thal), errors);
        ValidateAllowed(FirstText(request.ExerciseAngina, request.ExerciseInducedAngina?.ToString()), FeatureVocabulary.BooleanText, nameof(request.ExerciseAngina), errors);

        return errors.Count == 0 ? ValidationResult.Success : ValidationResult.Failed(errors);
    }

    private static void ValidateRequiredRange(string? value, double min, double max, string fieldName, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add($"{fieldName} is required.");
            return;
        }

        ValidateRange(value, min, max, fieldName, errors);
    }

    private static void ValidateOptionalRange(string? value, double min, double max, string fieldName, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        ValidateRange(value, min, max, fieldName, errors);
    }

    private static void ValidateRange(string value, double min, double max, string fieldName, List<string> errors)
    {
        if (!double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed) ||
            double.IsNaN(parsed) ||
            double.IsInfinity(parsed) ||
            parsed < min ||
            parsed > max)
        {
            errors.Add($"{fieldName} must be between {min} and {max}.");
        }
    }

    private static void ValidateOptionalBooleanOrRange(string? value, double min, double max, string fieldName, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value) || FeatureVocabulary.BooleanText.ContainsKey(FeatureVocabulary.Normalize(value)))
        {
            return;
        }

        ValidateRange(value, min, max, fieldName, errors);
    }

    private static void ValidateAllowed(string? value, IReadOnlyDictionary<string, string> allowed, string fieldName, List<string> errors, bool required = false)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            if (required)
            {
                errors.Add($"{fieldName} is required.");
            }

            return;
        }

        if (!allowed.ContainsKey(FeatureVocabulary.Normalize(value)))
        {
            errors.Add($"{fieldName} has unsupported value '{value}'.");
        }
    }

    private static string? FirstText(params string?[] values) =>
        values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
}
