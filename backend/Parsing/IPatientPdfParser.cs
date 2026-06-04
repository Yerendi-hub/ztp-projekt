using Backend.Contracts;

namespace Backend.Parsing;

public interface IPatientPdfParser
{
    Task<PatientParametersRequest> ParseAsync(IFormFile file, CancellationToken cancellationToken);
}
