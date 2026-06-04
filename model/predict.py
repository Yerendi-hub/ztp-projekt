from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
ARTIFACTS_DIR = ROOT / "artifacts"
MODELS = ["diabetes", "heart_disease"]

def predict_one_model(model_name: str, payload: dict[str, Any]) -> dict[str, Any]:
    model_artifact = joblib.load(ARTIFACTS_DIR / f"{model_name}_model.joblib")

    model_input = {}
    for feature in model_artifact["required_features"] + model_artifact["optional_features"]:
        feature_value = payload.get(feature, np.nan)
        model_input[feature] = feature_value

    disease_probability = float(model_artifact["pipeline"].predict_proba(pd.DataFrame([model_input]))[0, 1])

    return {"model": model_name, "disease_probability": disease_probability, "prediction": int(disease_probability >= 0.5)}

def predict(payloads: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {
        model_name: predict_one_model(model_name, payloads[model_name])
        for model_name in MODELS
    }
