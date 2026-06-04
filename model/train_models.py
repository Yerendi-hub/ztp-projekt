from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
ARTIFACTS_DIR = ROOT / "artifacts"
RANDOM_STATE = 137

DIABETES_NUMERIC = ["age", "bmi", "HbA1c_level", "blood_glucose_level"]
DIABETES_CATEGORICAL = ["sex", "smoking_history"]
DIABETES_FEATURES = DIABETES_NUMERIC + DIABETES_CATEGORICAL

HEART_NUMERIC = ["age", "trestbps", "chol", "thalch", "oldpeak", "ca"]
HEART_CATEGORICAL = ["sex", "cp", "fbs", "restecg", "exang", "slope", "thal"]
HEART_FEATURES = HEART_NUMERIC + HEART_CATEGORICAL

def load_diabetes_data() -> pd.DataFrame:
    diabetes_df = pd.read_csv(ROOT / "diabetes_prediction_dataset.csv")
    diabetes_df = diabetes_df.rename(columns = {"gender": "sex"})
    diabetes_df["sex"] = diabetes_df["sex"].replace({"Other": np.nan})
    diabetes_df["smoking_history"] = diabetes_df["smoking_history"].replace({"No Info": np.nan})

    for column in DIABETES_NUMERIC + ["diabetes"]:
        diabetes_df[column] = pd.to_numeric(diabetes_df[column])

    diabetes_df = diabetes_df.dropna(subset = ["sex"])
    diabetes_df["diabetes"] = diabetes_df["diabetes"].astype(int)
    return diabetes_df[DIABETES_FEATURES + ["diabetes"]]

def load_heart_data() -> pd.DataFrame:
    heart_disease_df = pd.read_csv(ROOT / "heart_disease_uci.csv")
    heart_disease_df["heart_disease"] = (pd.to_numeric(heart_disease_df["num"]) > 0).astype(int)

    for column in HEART_NUMERIC:
        heart_disease_df[column] = pd.to_numeric(heart_disease_df[column])
    heart_disease_df[["fbs", "exang"]] = heart_disease_df[["fbs", "exang"]].astype(str)

    return heart_disease_df[HEART_FEATURES + ["heart_disease"]]

def make_pipeline(numeric_features: list[str], categorical_features: list[str]) -> Pipeline:
    preprocessor = ColumnTransformer(transformers = [
            (
                "numeric",
                Pipeline([("imputer", SimpleImputer(strategy = "median")), ("scaler", StandardScaler())]),
                numeric_features,
            ),
            (
                "categorical",
                Pipeline([("imputer", SimpleImputer(strategy = "constant", fill_value = "missing")), ("onehot", OneHotEncoder(handle_unknown = "ignore"))]),
                categorical_features,
            )
        ]
    )

    return Pipeline([("preprocessor", preprocessor), ("model", MLPClassifier(hidden_layer_sizes = (64, 32), max_iter = 120, early_stopping = True,
                                                                             random_state = RANDOM_STATE))])

def train_model(model_name: str, data: pd.DataFrame, target: str, features: list[str], numeric_features: list[str], 
                categorical_features: list[str]) -> dict[str, float]:
    features_train, features_test, target_train, target_test = train_test_split(data[features], data[target], test_size = 0.2, 
                                                                                stratify = data[target], random_state = RANDOM_STATE)

    pipeline = make_pipeline(numeric_features, categorical_features)
    pipeline.fit(features_train, target_train)

    predictions = pipeline.predict(features_test)
    probabilities = pipeline.predict_proba(features_test)[:, 1]

    joblib.dump({
        "name": model_name, 
        "required_features": ["age", "sex"], 
        "optional_features": [feature for feature in features if feature not in ["age", "sex"]], 
        "numeric_features": numeric_features,
        "categorical_features": categorical_features, "pipeline": pipeline
        },
        ARTIFACTS_DIR / f"{model_name}_model.joblib"
    )

    return {
        "accuracy": float(accuracy_score(target_test, predictions)),
        "precision": float(precision_score(target_test, predictions, zero_division = 0)),
        "recall": float(recall_score(target_test, predictions, zero_division = 0)),
        "f1": float(f1_score(target_test, predictions, zero_division = 0)),
        "roc_auc": float(roc_auc_score(target_test, probabilities)),
    }

def main() -> None:
    ARTIFACTS_DIR.mkdir(exist_ok = True)

    results = {
        "diabetes": train_model(
            "diabetes", 
            load_diabetes_data(), 
            "diabetes", 
            DIABETES_FEATURES, 
            DIABETES_NUMERIC, 
            DIABETES_CATEGORICAL
        ),
        "heart_disease": train_model(
            "heart_disease",
            load_heart_data(),
            "heart_disease",
            HEART_FEATURES,
            HEART_NUMERIC,
            HEART_CATEGORICAL,
        ),
    }

    (ARTIFACTS_DIR / "metrics.json").write_text(json.dumps(results, indent = 2), encoding = "utf-8")

if __name__ == "__main__":
    main()
