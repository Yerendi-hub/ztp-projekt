using Backend.ModelClient;

namespace Backend.Parsing;

public sealed class ModelFeatureParser : IModelFeatureParser
{
    public ModelPredictionRequest Parse(NormalizedPatientParameters patient)
    {
        // anti-corruption layer
        var diabetesPayload = new Dictionary<string, object?>
        {
            ["age"] = patient.Age,
            ["bmi"] = Round(patient.Bmi),
            ["HbA1c_level"] = Round(patient.HemoglobinA1cLevel),
            ["blood_glucose_level"] = Round(patient.BloodGlucoseMgDl),
            ["sex"] = patient.Sex,
            ["smoking_history"] = patient.SmokingHistory
        };

        var heartDiseasePayload = new Dictionary<string, object?>
        {
            ["age"] = patient.Age,
            ["trestbps"] = Round(patient.RestingBloodPressureMmHg),
            ["chol"] = Round(patient.CholesterolMgDl),
            ["thalch"] = Round(patient.MaximumHeartRateAchieved),
            ["oldpeak"] = Round(patient.StDepressionInducedByExerciseRelativeToRest),
            ["ca"] = patient.NumberOfMajorVesselsColoredByFluoroscopy,
            ["sex"] = patient.Sex,
            ["cp"] = patient.ChestPain,
            ["fbs"] = patient.FastingBloodSugar,
            ["restecg"] = patient.EcgObservationAtRestingCondition,
            ["exang"] = patient.ExerciseInducedAngina,
            ["slope"] = patient.SlopeOfPeakExerciseStSegment,
            ["thal"] = patient.Thal
        };

        return new ModelPredictionRequest(new Dictionary<string, IReadOnlyDictionary<string, object?>>
        {
            ["diabetes"] = diabetesPayload,
            ["heart_disease"] = heartDiseasePayload
        });
    }

    private static double? Round(double? value) =>
        value is null ? null : Math.Round(value.Value, 4, MidpointRounding.AwayFromZero);
}
