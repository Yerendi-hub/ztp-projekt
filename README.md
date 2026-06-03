# ztp-projekt

Projekt trenuje dwa modele sieci neuronowej:

- `diabetes` - predykcja cukrzycy
- `heart_disease` - predykcja choroby serca

Minimalny wymagany input do predykcji to `age` i `sex`. Pozostałe parametry są opcjonalne.

## Instalacja

```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Trening

```powershell
python model/train_models.py
```

Skrypt:

- wczytuje i czyści dane,
- dzieli dane na train/test,
- trenuje `MLPClassifier`,
- zapisuje modele do `model/artifacts/*.joblib`,
- zapisuje metryki do `model/artifacts/metrics.json`.

## Predykcja

Backend mapuje request JSON do płaskiego payloadu modelu i przekazuje go do `model/predict.py`.

Przykładowy payload dla modelu `diabetes`:

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

Wywołanie w backendzie:

```python
from model.predict import predict

result = predict({
    "diabetes": diabetes_payload,
    "heart_disease": heart_disease_payload,
})
```

Wynik zawiera nazwę modelu, `probability` i `prediction`, gdzie `1` oznacza przewidywaną chorobę. Przykładowy JSON zwrotny to:

```json
{
  "model": "diabetes",
  "disease_probability": 0.75,
  "prediction": 1,
}
```