using Backend.Contracts;
using System.Globalization;

namespace Backend.Parsing;

public interface IMedicalUnitNormalizer
{
    NormalizedPatientParameters Normalize(PatientParametersRequest request);
}

public sealed class MedicalUnitNormalizer : IMedicalUnitNormalizer
{
    public NormalizedPatientParameters Normalize(PatientParametersRequest request)
    {
        var units = request.Units;
        var weightKg = ConvertWeightToKg(ParseDouble(request.Weight), units?.Weight);
        var heightCm = ConvertHeightToCm(ParseDouble(request.Height), units?.Height);

        // strategy conversion dispatch.
        return new NormalizedPatientParameters(
            Age: ParseRequiredInt(request.Age),
            Sex: Map(FirstText(request.Sex, request.Gender), FeatureVocabulary.Sex)!,
            WeightKg: weightKg,
            HeightCm: heightCm,
            Bmi: CalculateBmi(weightKg, heightCm),
            SmokingHistory: Map(request.SmokingHistory, FeatureVocabulary.SmokingHistory),
            HemoglobinA1cLevel: ParseDouble(FirstText(request.HbA1c, request.HemoglobinA1cLevel)),
            BloodGlucoseMgDl: ConvertGlucoseToMgDl(ParseDouble(FirstText(request.BloodGlucose, request.BloodGlucoseLevel)), units?.BloodGlucose),
            ChestPain: Map(request.ChestPain, FeatureVocabulary.ChestPain),
            RestingBloodPressureMmHg: ConvertBloodPressureToMmHg(ParseDouble(request.RestingBloodPressure), units?.RestingBloodPressure),
            CholesterolMgDl: ConvertCholesterolToMgDl(ParseDouble(FirstText(request.Cholesterol, request.CholesterolMeasure)), units?.Cholesterol),
            FastingBloodSugar: MapFastingBloodSugar(FirstText(request.FastingSugar, request.FastingBloodSugar?.ToString())),
            EcgObservationAtRestingCondition: Map(FirstText(request.RestingEcg, request.EcgObservationAtRestingCondition), FeatureVocabulary.RestingEcg),
            MaximumHeartRateAchieved: ParseDouble(FirstText(request.MaxHeartRate, request.MaximumHeartRateAchieved)),
            ExerciseInducedAngina: MapBoolean(FirstText(request.ExerciseAngina, request.ExerciseInducedAngina?.ToString())),
            StDepressionInducedByExerciseRelativeToRest: ParseDouble(FirstText(request.StDepression, request.StDepressionInducedByExerciseRelativeToRest)),
            SlopeOfPeakExerciseStSegment: Map(FirstText(request.StSlope, request.SlopeOfPeakExerciseStSegment), FeatureVocabulary.StSlope),
            NumberOfMajorVesselsColoredByFluoroscopy: ParseInt(FirstText(request.MajorVessels, request.NumberOfMajorVesselsColoredByFluoroscopy)),
            Thal: Map(request.Thal, FeatureVocabulary.Thal));
    }

    private static string? Map(string? value, IReadOnlyDictionary<string, string> dictionary) =>
        string.IsNullOrWhiteSpace(value) ? null : dictionary[FeatureVocabulary.Normalize(value)];

    private static string? MapBoolean(string? value) => Map(value, FeatureVocabulary.BooleanText);

    private static string? MapFastingBloodSugar(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalized = FeatureVocabulary.Normalize(value);
        if (FeatureVocabulary.BooleanText.TryGetValue(normalized, out var booleanValue))
        {
            return booleanValue;
        }

        var parsed = ParseDouble(value);
        return parsed is null ? null : parsed > 120 ? "True" : "False";
    }

    private static double? ConvertWeightToKg(double? value, string? unit) =>
        value is null
            ? null
            :
        NormalizeUnit(unit) switch
        {
            null or "kg" => value,
            "lb" or "lbs" => value * 0.45359237,
            _ => value
        };

    private static double? ConvertHeightToCm(double? value, string? unit) =>
        value is null
            ? null
            :
        NormalizeUnit(unit) switch
        {
            null or "cm" => value,
            "m" => value * 100,
            "in" or "inch" or "inches" => value * 2.54,
            _ => value
        };

    private static double? ConvertGlucoseToMgDl(double? value, string? unit) =>
        value is null
            ? null
            :
        NormalizeUnit(unit) switch
        {
            null or "mgdl" or "mg/dl" => value,
            "mmoll" or "mmol/l" => value * 18.0182,
            _ => value
        };

    private static double? ConvertCholesterolToMgDl(double? value, string? unit) =>
        value is null
            ? null
            :
        NormalizeUnit(unit) switch
        {
            null or "mgdl" or "mg/dl" => value,
            "mmoll" or "mmol/l" => value * 38.66976,
            _ => value
        };

    private static double? ConvertBloodPressureToMmHg(double? value, string? unit) =>
        value is null
            ? null
            :
        NormalizeUnit(unit) switch
        {
            null or "mmhg" => value,
            "kpa" => value * 7.50062,
            _ => value
        };

    private static string? NormalizeUnit(string? unit) =>
        string.IsNullOrWhiteSpace(unit)
            ? null
            : unit.Trim().ToLowerInvariant().Replace(" ", string.Empty);

    private static double? ParseDouble(string? value) =>
        double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed) ? parsed : null;

    private static int? ParseInt(string? value) =>
        int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed) ? parsed : null;

    private static int ParseRequiredInt(string? value) =>
        int.Parse(value!, NumberStyles.Integer, CultureInfo.InvariantCulture);

    private static double? CalculateBmi(double? weightKg, double? heightCm)
    {
        if (weightKg is null || heightCm is null || heightCm <= 0)
        {
            return null;
        }

        var heightM = heightCm.Value / 100;
        return weightKg.Value / (heightM * heightM);
    }

    private static string? FirstText(params string?[] values) =>
        values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
}
