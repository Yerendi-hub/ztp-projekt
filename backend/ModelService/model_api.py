from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from pydantic import RootModel

from model.predict import predict


class PredictionPayload(RootModel[dict[str, dict[str, Any]]]):
    pass


app = FastAPI(title="Dr.Byte model adapter")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict")
def predict_endpoint(payload: PredictionPayload) -> dict[str, dict[str, Any]]:
    # adapter around the Python model module.
    return predict(payload.root)
