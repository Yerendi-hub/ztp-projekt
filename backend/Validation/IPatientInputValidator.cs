using Backend.Contracts;

namespace Backend.Validation;

public interface IPatientInputValidator
{
    ValidationResult Validate(PatientParametersRequest request);
}
