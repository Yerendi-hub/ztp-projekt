namespace Backend.Parsing;

public sealed class PdfParsingException : Exception
{
    public PdfParsingException(string message)
        : base(message)
    {
    }

    public PdfParsingException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
