using System.Text.RegularExpressions;

namespace Backend.Parsing;

public static partial class FeatureVocabulary
{
    public static readonly IReadOnlyDictionary<string, string> Sex = new Dictionary<string, string>
    {
        ["m"] = "Male",
        ["male"] = "Male",
        ["f"] = "Female",
        ["female"] = "Female"
    };

    public static readonly IReadOnlyDictionary<string, string> SmokingHistory = new Dictionary<string, string>
    {
        ["not_current"] = "not current",
        ["former"] = "former",
        ["no_info"] = "No Info",
        ["current"] = "current",
        ["never"] = "never",
        ["ever"] = "ever"
    };

    public static readonly IReadOnlyDictionary<string, string> ChestPain = new Dictionary<string, string>
    {
        ["asymptomatic"] = "asymptomatic",
        ["non_anginal"] = "non-anginal",
        ["non_anginal_pain"] = "non-anginal",
        ["atypical_angina"] = "atypical angina",
        ["atypical"] = "atypical angina",
        ["typical_angina"] = "typical angina",
        ["typical"] = "typical angina"
    };

    public static readonly IReadOnlyDictionary<string, string> RestingEcg = new Dictionary<string, string>
    {
        ["normal"] = "normal",
        ["lv_hypertrophy"] = "lv hypertrophy",
        ["hypertrophy"] = "lv hypertrophy",
        ["st_t_abnormality"] = "st-t abnormality",
        ["st_t"] = "st-t abnormality"
    };

    public static readonly IReadOnlyDictionary<string, string> StSlope = new Dictionary<string, string>
    {
        ["flat"] = "flat",
        ["upsloping"] = "upsloping",
        ["downsloping"] = "downsloping"
    };

    public static readonly IReadOnlyDictionary<string, string> Thal = new Dictionary<string, string>
    {
        ["normal"] = "normal",
        ["reversible_defect"] = "reversible defect",
        ["reversible"] = "reversible defect",
        ["fixed_defect"] = "fixed defect",
        ["fixed"] = "fixed defect"
    };

    public static readonly IReadOnlyDictionary<string, string> BooleanText = new Dictionary<string, string>
    {
        ["true"] = "True",
        ["false"] = "False",
        ["yes"] = "True",
        ["no"] = "False"
    };

    public static string Normalize(string value)
    {
        var normalized = SeparatorRegex().Replace(value.Trim().ToLowerInvariant(), "_");
        return normalized.Trim('_');
    }

    [GeneratedRegex(@"[\s\-]+")]
    private static partial Regex SeparatorRegex();
}
