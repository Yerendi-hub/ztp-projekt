# Backend API

ASP.NET Core backend for the diagnostic project. It validates patient input from the frontend, normalizes medical units, parses a stable ordered parameter list for the ML model, calls the prediction service, and maps the model response back to a client-friendly JSON response.

## Run locally

```powershell
cd backend
dotnet run
```

Default URL: `http://localhost:5080`

Health check:

```http
GET http://localhost:5080/health
```

## Configuration

The model service is configured in `backend/appsettings.json` or with environment variables:

```text
ModelClient__BaseUrl=http://localhost:8000
ModelClient__PredictPath=/predict
ModelClient__TimeoutSeconds=30
```

Docker:

```powershell
docker compose up --build
```

For Docker, `MODEL_BASE_URL` defaults to `http://host.docker.internal:8000`.

## Frontend request

Endpoint:

```http
POST /api/diagnosis/predict
Content-Type: application/json
```

Example:

```json
{
  "gender": "female",
  "age": 45,
  "weight": 70,
  "height": 168,
  "smokingHistory": "never",
  "hemoglobinA1cLevel": 5.6,
  "bloodGlucoseLevel": 95,
  "chestPain": "atypical angina",
  "restingBloodPressure": 120,
  "cholesterolMeasure": 190,
  "fastingBloodSugar": false,
  "ecgObservationAtRestingCondition": "normal",
  "maximumHeartRateAchieved": 160,
  "exerciseInducedAngina": false,
  "stDepressionInducedByExerciseRelativeToRest": 0.4,
  "slopeOfPeakExerciseStSegment": "upsloping",
  "numberOfMajorVesselsColoredByFluoroscopy": 0,
  "thal": "normal"
}
```

Optional `units` can be included when the frontend does not send model-standard units:

```json
{
  "units": {
    "weight": "lb",
    "height": "in",
    "bloodGlucose": "mmol/L",
    "cholesterol": "mmol/L",
    "restingBloodPressure": "kPa"
  }
}
```

## Model request

The backend sends an ordered list to the model:

```json
{
  "parameters": [
    { "name": "gender", "value": "female" },
    { "name": "age", "value": 45 },
    { "name": "weight_kg", "value": 70 }
  ]
}
```

The real payload contains all 18 fields in the order implemented by `ModelFeatureParser`.

## Expected model response

```json
{
  "diabetes": "Yes",
  "heart_disease": ["Yes", 1]
}
```

## Client response

```json
{
  "diabetes": {
    "detected": true,
    "label": "Yes"
  },
  "heartDisease": {
    "detected": true,
    "label": "Yes",
    "type": 1,
    "typeDescription": "Heart disease model class 1"
  },
  "analyzedAtUtc": "2026-06-03T15:00:00+00:00"
}
```

## Advanced programming techniques marked in code

Comments in backend code point out the main techniques used for the university project:

- pipeline orchestration in `DiagnosisController`,
- Strategy-like unit conversion dispatch in `MedicalUnitNormalizer`,
- immutable parser output with deterministic feature order in `ModelFeatureParser`,
- Adapter pattern in `ModelPredictionClient`.
