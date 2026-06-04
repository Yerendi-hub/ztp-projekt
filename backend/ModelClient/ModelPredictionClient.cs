using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace Backend.ModelClient;

public sealed class ModelPredictionClient : IModelPredictionClient
{
    private readonly HttpClient _httpClient;
    private readonly ModelClientOptions _options;

    public ModelPredictionClient(HttpClient httpClient, IOptions<ModelClientOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;

        _httpClient.BaseAddress = new Uri(_options.BaseUrl, UriKind.Absolute);
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    public async Task<ModelPredictionResponse> PredictAsync(ModelPredictionRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // adapter pattern
            using var response = await _httpClient.PostAsJsonAsync(_options.PredictPath, request.Payloads, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new ModelPredictionException($"Model service returned {(int)response.StatusCode}: {body}");
            }

            var prediction = await response.Content.ReadFromJsonAsync<ModelPredictionResponse>(cancellationToken);
            return prediction ?? throw new ModelPredictionException("Model service returned an empty response.");
        }
        catch (ModelPredictionException)
        {
            throw;
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException or NotSupportedException)
        {
            throw new ModelPredictionException("Model service call failed.", exception);
        }
    }
}
