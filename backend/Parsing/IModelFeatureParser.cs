using Backend.ModelClient;

namespace Backend.Parsing;

public interface IModelFeatureParser
{
    ModelPredictionRequest Parse(NormalizedPatientParameters patient);
}
