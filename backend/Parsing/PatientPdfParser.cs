using System.Text;
using System.Text.RegularExpressions;
using Backend.Contracts;
using UglyToad.PdfPig;

namespace Backend.Parsing;

public sealed partial class PatientPdfParser : IPatientPdfParser
{
    public async Task<PatientParametersRequest> ParseAsync(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            throw new PdfParsingException("Uploaded file is empty.");
        }

        if (!Path.GetExtension(file.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            throw new PdfParsingException("Uploaded file must be a PDF report.");
        }

        await using var input = file.OpenReadStream();
        using var memory = new MemoryStream();
        await input.CopyToAsync(memory, cancellationToken);

        if (!LooksLikePdf(memory))
        {
            throw new PdfParsingException("Uploaded file is not a valid PDF document.");
        }

        var text = ExtractText(memory);
        var values = ExtractReportValues(text);

        var request = new PatientParametersRequest
        {
            Age = values.GetValueOrDefault("Age"),
            Sex = values.GetValueOrDefault("Biological sex"),
            Weight = values.GetValueOrDefault("Weight"),
            Height = values.GetValueOrDefault("Height"),
            SmokingHistory = values.GetValueOrDefault("Tobacco smoking history"),
            HbA1c = values.GetValueOrDefault("HbA1c level (3-month avg)"),
            BloodGlucose = values.GetValueOrDefault("Blood glucose level"),
            FastingSugar = values.GetValueOrDefault("Fasting blood sugar level"),
            Cholesterol = values.GetValueOrDefault("Total cholesterol"),
            ChestPain = values.GetValueOrDefault("Chest pain specification"),
            RestingBloodPressure = values.GetValueOrDefault("Resting blood pressure"),
            RestingEcg = values.GetValueOrDefault("Resting ECG"),
            MaxHeartRate = values.GetValueOrDefault("Maximum heart rate"),
            ExerciseAngina = values.GetValueOrDefault("Exercise induced angina"),
            StDepression = values.GetValueOrDefault("ST Depression (relative to rest)"),
            StSlope = values.GetValueOrDefault("Peak exercise ST segment slope"),
            MajorVessels = values.GetValueOrDefault("Major vessels (Fluoroscopy)"),
            Thal = values.GetValueOrDefault("Thalassemia")
        };

        if (string.IsNullOrWhiteSpace(request.Age) || string.IsNullOrWhiteSpace(request.Sex))
        {
            throw new PdfParsingException("Could not read required patient fields from PDF report.");
        }

        return request;
    }

    private static bool LooksLikePdf(MemoryStream memory)
    {
        if (memory.Length < 5)
        {
            return false;
        }

        memory.Position = 0;
        Span<byte> header = stackalloc byte[5];
        var read = memory.Read(header);
        memory.Position = 0;

        return read == 5 && Encoding.ASCII.GetString(header) == "%PDF-";
    }

    private static string ExtractText(MemoryStream memory)
    {
        try
        {
            memory.Position = 0;
            var builder = new StringBuilder();
            using var document = PdfDocument.Open(memory);

            foreach (var page in document.GetPages())
            {
                builder.AppendLine(page.Text);
            }

            var text = builder.ToString();
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new PdfParsingException("PDF does not contain readable text.");
            }

            return text;
        }
        catch (PdfParsingException)
        {
            throw;
        }
        catch (Exception exception)
        {
            throw new PdfParsingException("PDF could not be read.", exception);
        }
    }

    private static Dictionary<string, string> ExtractReportValues(string text)
    {
        var lines = text
            .Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Select(line => MultiSpaceRegex().Replace(line, " ").Trim())
            .Where(line => line.Length > 0)
            .ToArray();

        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var label in ExpectedLabels)
        {
            var index = Array.FindIndex(lines, line => line.Equals(label, StringComparison.OrdinalIgnoreCase));
            if (index >= 0 && index + 1 < lines.Length)
            {
                values[label] = CleanValue(lines[index + 1]);
            }
        }

        foreach (var (label, pattern) in RegexExtractors)
        {
            if (values.TryGetValue(label, out var existingValue) && !ShouldReplaceExtractedValue(label, existingValue))
            {
                continue;
            }

            var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
            if (match.Success)
            {
                values[label] = CleanValue(match.Groups["value"].Value);
            }
        }

        return values;
    }

    private static bool ShouldReplaceExtractedValue(string label, string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value is "-" or "--")
        {
            return true;
        }

        return NumericLabels.Contains(label) &&
            !double.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out _);
    }

    private static string CleanValue(string value)
    {
        var cleaned = value.Trim();
        return cleaned.EndsWith(" years", StringComparison.OrdinalIgnoreCase)
            ? cleaned[..^6].Trim()
            : cleaned;
    }

    private static readonly string[] ExpectedLabels =
    [
        "Age",
        "Biological sex",
        "Weight",
        "Height",
        "Tobacco smoking history",
        "HbA1c level (3-month avg)",
        "Blood glucose level",
        "Fasting blood sugar level",
        "Total cholesterol",
        "Chest pain specification",
        "Resting blood pressure",
        "Resting ECG",
        "Maximum heart rate",
        "Exercise induced angina",
        "ST Depression (relative to rest)",
        "Peak exercise ST segment slope",
        "Major vessels (Fluoroscopy)",
        "Thalassemia"
    ];

    private static readonly HashSet<string> NumericLabels = new(StringComparer.OrdinalIgnoreCase)
    {
        "Age",
        "Weight",
        "Height",
        "HbA1c level (3-month avg)",
        "Blood glucose level",
        "Fasting blood sugar level",
        "Total cholesterol",
        "Resting blood pressure",
        "Maximum heart rate",
        "ST Depression (relative to rest)",
        "Major vessels (Fluoroscopy)"
    };

    private static readonly (string Label, string Pattern)[] RegexExtractors =
    [
        ("Age", @"\bAge:?\s*(?<value>\d{1,3})(?:\s*years)?\b"),
        ("Biological sex", @"Biological\s+sex:?\s*(?<value>Female|Male|F|M)\b"),
        ("Weight", @"Weight\s*(?<value>\d+(?:\.\d+)?)\s*kg"),
        ("Height", @"Height\s*(?<value>\d+(?:\.\d+)?)\s*cm"),
        ("Tobacco smoking history", @"Tobacco\s+smoking\s+history\s*(?<value>not[_\s-]current|former|no[_\s-]info|current|never|ever)\b"),
        ("HbA1c level (3-month avg)", @"HbA1c\s+level\s+\(3-month\s+avg\)\s*(?<value>\d+(?:\.\d+)?)\s*%"),
        ("Blood glucose level", @"Blood\s+glucose\s+level\s*(?<value>\d+(?:\.\d+)?)\s*mg/dL"),
        ("Fasting blood sugar level", @"Fasting\s+blood\s+sugar\s+level\s*(?<value>\d+(?:\.\d+)?)\s*mg/dL"),
        ("Total cholesterol", @"Total\s+cholesterol\s*(?<value>\d+(?:\.\d+)?)\s*mg/dL"),
        ("Chest pain specification", @"Chest\s+pain\s+specification\s*(?<value>asymptomatic|typical\s+angina|atypical\s+angina|atypical|non-anginal|non\s+anginal)\b"),
        ("Resting blood pressure", @"Resting\s+blood\s+pressure\s*(?<value>\d+(?:\.\d+)?)\s*mmHg"),
        ("Resting ECG", @"Resting\s+ECG\s*(?<value>normal|lv\s+hypertrophy|hypertrophy|st-t\s+abnormality|st-t)\b"),
        ("Maximum heart rate", @"Maximum\s+heart\s+rate\s*(?<value>\d+(?:\.\d+)?)\s*bpm"),
        ("Exercise induced angina", @"Exercise\s+induced\s+angina\s*(?<value>True|False|Yes|No)\b"),
        ("ST Depression (relative to rest)", @"ST\s+Depression\s+\(relative\s+to\s+rest\)\s*(?<value>-?\d+(?:\.\d+)?)\s*mm"),
        ("Peak exercise ST segment slope", @"Peak\s+exercise\s+ST\s+segment\s+slope\s*(?<value>flat|upsloping|downsloping)\b"),
        ("Major vessels (Fluoroscopy)", @"Major\s+vessels\s+\(Fluoroscopy\)\s*(?<value>[0-3])\b"),
        ("Thalassemia", @"Thalassemia\s*(?<value>normal|reversible\s+defect|reversible|fixed\s+defect|fixed)\b")
    ];

    [GeneratedRegex(@"\s+")]
    private static partial Regex MultiSpaceRegex();
}
