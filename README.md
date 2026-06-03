# ztp-projekt

## Predykcja

Backend mapuje request JSON do płaskiego payloadu modelu i przekazuje go do `model/predict.py`. Przykładowy payload dla modelu `diabetes`:

```json
{
  "age": 52,
  "sex": "Male",
  "bmi": 31.2,
  "HbA1c_level": 6.4,
  "blood_glucose_level": 180,
  "smoking_history": "former"
}
```

Wywołanie modelu w backendzie:

```python
from model.predict import predict

result = predict({
    "diabetes": diabetes_payload,
    "heart_disease": heart_disease_payload,
})
```

Wynik zawiera nazwę modelu, `probability` i `prediction`, gdzie `1` oznacza chorobę. Przykładowy JSON zwrotny to:

```json
{
  "model": "diabetes",
  "disease_probability": 0.75,
  "prediction": 1,
}
```