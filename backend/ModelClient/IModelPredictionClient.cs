namespace Backend.ModelClient;

public interface IModelPredictionClient
{
    Task<ModelPredictionResponse> PredictAsync(ModelPredictionRequest request, CancellationToken cancellationToken);
}
