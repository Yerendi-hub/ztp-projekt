namespace Backend.ModelClient;

public sealed class ModelPredictionException : Exception
{
    public ModelPredictionException(string message)
        : base(message)
    {
    }

    public ModelPredictionException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
