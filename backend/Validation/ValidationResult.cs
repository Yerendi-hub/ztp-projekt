namespace Backend.Validation;

public sealed record ValidationResult(bool IsValid, IReadOnlyList<string> Errors)
{
    public static ValidationResult Success { get; } = new(true, []);

    public static ValidationResult Failed(IEnumerable<string> errors) =>
        new(false, errors.ToArray());
}
