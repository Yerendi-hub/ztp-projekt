using Backend.Contracts;
using Backend.Mapping;
using Backend.ModelClient;
using Backend.Parsing;
using Backend.Validation;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/diagnosis")]
public sealed class DiagnosisController : ControllerBase
{
    private readonly IPatientInputValidator _validator;
    private readonly IMedicalUnitNormalizer _unitNormalizer;
    private readonly IModelFeatureParser _featureParser;
    private readonly IPatientPdfParser _pdfParser;
    private readonly IModelPredictionClient _modelClient;
    private readonly ILogger<DiagnosisController> _logger;

    public DiagnosisController(
        IPatientInputValidator validator,
        IMedicalUnitNormalizer unitNormalizer,
        IModelFeatureParser featureParser,
        IPatientPdfParser pdfParser,
        IModelPredictionClient modelClient,
        ILogger<DiagnosisController> logger)
    {
        _validator = validator;
        _unitNormalizer = unitNormalizer;
        _featureParser = featureParser;
        _pdfParser = pdfParser;
        _modelClient = modelClient;
        _logger = logger;
    }

    [HttpPost("predict")]
    [ProducesResponseType<DiagnosisResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<DiagnosisResponse>> Predict(
        [FromBody] PatientParametersRequest? request,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequest(new ValidationErrorResponse("Request body is required.", ["Request body is required."]));
        }

        return await PredictValidatedAsync(request, cancellationToken);
    }

    [HttpPost("predict/pdf")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType<DiagnosisResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<DiagnosisResponse>> PredictFromPdf(
        [FromForm] IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null)
        {
            return BadRequest(new ValidationErrorResponse("PDF file is required.", ["PDF file is required."]));
        }

        try
        {
            var request = await _pdfParser.ParseAsync(file, cancellationToken);
            return await PredictValidatedAsync(request, cancellationToken);
        }
        catch (PdfParsingException exception)
        {
            _logger.LogWarning(exception, "PDF report parsing failed.");
            return BadRequest(new ValidationErrorResponse("Could not read patient data from uploaded PDF.", [exception.Message]));
        }
    }

    private async Task<ActionResult<DiagnosisResponse>> PredictValidatedAsync(
        PatientParametersRequest request,
        CancellationToken cancellationToken)
    {
        // pipeline orchestration
        var validationResult = _validator.Validate(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ValidationErrorResponse("Invalid patient parameters.", validationResult.Errors));
        }

        var normalizedPatient = _unitNormalizer.Normalize(request);
        var modelRequest = _featureParser.Parse(normalizedPatient);

        try
        {
            var modelResponse = await _modelClient.PredictAsync(modelRequest, cancellationToken);
            return Ok(DiagnosisMapper.ToClientResponse(modelResponse, normalizedPatient));
        }
        catch (ModelPredictionException exception)
        {
            _logger.LogError(exception, "Prediction model request failed.");
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "Prediction model is unavailable or returned an invalid response." });
        }
    }
}
