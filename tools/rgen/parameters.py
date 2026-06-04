"""
Parameter definitions for the rgen medical lab report generator.

Names, labels, units and categorical values match exactly what the frontend
(PatientForm.jsx), backend (NormalizedPatientParameters / FeatureVocabulary)
and the trained Python models (train_models.py) use.

Model feature mapping
─────────────────────
Diabetes model:   age, sex, bmi, HbA1c_level, blood_glucose_level, smoking_history
Heart disease:    age, sex, trestbps, chol, thalch, oldpeak, ca,
                  cp, fbs, restecg, exang, slope, thal
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class NumericParam:
    cli_name: str
    display_name: str          # English label shown in the PDF (matches frontend)
    unit: str                  # default (canonical) unit
    ref_low: float             # reference-range lower bound  (in default unit)
    ref_high: float            # reference-range upper bound  (in default unit)
    section: str               # PDF section heading
    precision: int = 2         # decimal places for display
    integer: bool = False      # output as integer
    # Alternative units: key = lowercase unit string,
    # value = factor to multiply alt-unit value by to get the default unit.
    # e.g. for glucose (default mg/dL): {"mmol/l": 18.0182}
    unit_aliases: dict[str, float] = field(default_factory=dict)


@dataclass
class CategoricalParam:
    cli_name: str
    display_name: str
    choices: list[str]   # values as normalised by FeatureVocabulary / used by the models
    weights: list[float] # sampling probabilities (must sum to 1)
    section: str
    unit: str = ""


# ---------------------------------------------------------------------------
# Parameter catalogue
# Section names mirror the frontend (PatientForm.jsx section headings).
# Display names mirror the frontend field labels.
# Categorical values match what FeatureVocabulary.cs maps to model features.
# ---------------------------------------------------------------------------

PARAMS: dict[str, NumericParam | CategoricalParam] = {

    # ── Basic biometrics (frontend section) ──────────────────────────────────
    "age": NumericParam(
        cli_name="age",
        display_name="Age",
        unit="years",
        ref_low=18, ref_high=65,
        section="Basic biometrics",
        precision=0, integer=True,
    ),
    "sex": CategoricalParam(
        cli_name="sex",
        display_name="Biological sex",
        # Backend FeatureVocabulary maps m/f → Male/Female; model uses Male/Female
        choices=["Male", "Female"],
        weights=[0.50, 0.50],
        section="Basic biometrics",
    ),
    "weight": NumericParam(
        cli_name="weight",
        display_name="Weight",
        unit="kg",
        ref_low=55.0, ref_high=90.0,
        section="Basic biometrics",
        precision=1,
        unit_aliases={"lb": 0.453592, "lbs": 0.453592},
    ),
    "height": NumericParam(
        cli_name="height",
        display_name="Height",
        unit="cm",
        ref_low=155.0, ref_high=185.0,
        section="Basic biometrics",
        precision=1,
        unit_aliases={"m": 100.0, "in": 2.54, "inch": 2.54, "inches": 2.54},
    ),
    "bmi": NumericParam(
        cli_name="bmi",
        display_name="BMI",
        unit="kg/m²",
        ref_low=18.5, ref_high=24.9,
        section="Basic biometrics",
        precision=1,
    ),
    "smoking": CategoricalParam(
        cli_name="smoking",
        display_name="Tobacco smoking history",
        # Values match frontend <select> options; backend maps these → model feature smoking_history
        # "No Info" is also valid (backend vocabulary: no_info → "No Info")
        choices=["never", "former", "current", "not current", "ever", "No Info"],
        weights=[0.40, 0.25, 0.12, 0.12, 0.06, 0.05],
        section="Basic biometrics",
    ),

    # ── Metabolic & metric blood work (frontend section) ────────────────────
    "hba1c": NumericParam(
        cli_name="hba1c",
        display_name="HbA1c level (3-month avg)",
        unit="%",
        ref_low=4.0, ref_high=6.0,
        section="Metabolic & metric blood work",
        precision=2,
        # IFCC mmol/mol ↔ NGSP %:  mmol/mol / 10.929 ≈ %
        unit_aliases={"mmol/mol": 1.0 / 10.929},
    ),
    "glucose": NumericParam(
        cli_name="glucose",
        display_name="Blood glucose level",
        unit="mg/dL",
        ref_low=70.0, ref_high=99.0,
        section="Metabolic & metric blood work",
        precision=1,
        unit_aliases={"mmol/l": 18.0182},
    ),
    # fasting_sugar: shown as a numeric mg/dL value in the PDF (matching the frontend
    # numeric input).  Values >120 mg/dL are flagged True by the backend for the fbs
    # heart-disease feature.  The reference threshold for "normal fasting" is ≤120 mg/dL.
    "fasting_sugar": NumericParam(
        cli_name="fasting_sugar",
        display_name="Fasting blood sugar level",
        unit="mg/dL",
        ref_low=70.0, ref_high=100.0,
        section="Metabolic & metric blood work",
        precision=1,
        unit_aliases={"mmol/l": 18.0182},
    ),
    "cholesterol": NumericParam(
        cli_name="cholesterol",
        display_name="Total cholesterol",
        unit="mg/dL",
        ref_low=116.0, ref_high=190.0,
        section="Metabolic & metric blood work",
        precision=1,
        unit_aliases={"mmol/l": 38.66976},
    ),

    # ── Cardiovascular baseline (frontend section) ───────────────────────────
    "chest_pain": CategoricalParam(
        cli_name="chest_pain",
        display_name="Chest pain specification",
        # Frontend values (asymptomatic/typical/atypical/non-anginal) are normalised
        # by FeatureVocabulary.cs → model features: asymptomatic / typical angina /
        # atypical angina / non-anginal
        choices=["asymptomatic", "typical angina", "atypical angina", "non-anginal"],
        weights=[0.50, 0.10, 0.25, 0.15],
        section="Cardiovascular baseline",
    ),
    "bp": NumericParam(
        cli_name="bp",
        display_name="Resting blood pressure",
        unit="mmHg",
        ref_low=90.0, ref_high=120.0,
        section="Cardiovascular baseline",
        precision=0, integer=True,
        unit_aliases={"kpa": 7.50062},
    ),
    "ecg": CategoricalParam(
        cli_name="ecg",
        display_name="Resting ECG",
        # Backend maps: normal → "normal", st-t / st_t → "st-t abnormality",
        # hypertrophy / lv_hypertrophy → "lv hypertrophy"
        choices=["normal", "st-t abnormality", "lv hypertrophy"],
        weights=[0.60, 0.15, 0.25],
        section="Cardiovascular baseline",
    ),

    # ── Stress test & advanced clinical imaging (frontend section) ───────────
    "max_hr": NumericParam(
        cli_name="max_hr",
        display_name="Maximum heart rate",
        unit="bpm",
        ref_low=100.0, ref_high=170.0,
        section="Stress test & advanced clinical imaging",
        precision=0, integer=True,
    ),
    "angina": CategoricalParam(
        cli_name="angina",
        display_name="Exercise induced angina",
        # Backend maps true/yes → "True", false/no → "False"
        choices=["True", "False"],
        weights=[0.30, 0.70],
        section="Stress test & advanced clinical imaging",
    ),
    "st_depression": NumericParam(
        cli_name="st_depression",
        display_name="ST Depression (relative to rest)",
        unit="mm",
        ref_low=0.0, ref_high=1.0,
        section="Stress test & advanced clinical imaging",
        precision=1,
    ),
    "st_slope": CategoricalParam(
        cli_name="st_slope",
        display_name="Peak exercise ST segment slope",
        choices=["upsloping", "flat", "downsloping"],
        weights=[0.50, 0.35, 0.15],
        section="Stress test & advanced clinical imaging",
    ),
    "vessels": NumericParam(
        cli_name="vessels",
        display_name="Major vessels (Fluoroscopy)",
        unit="",
        ref_low=0.0, ref_high=0.0,
        section="Stress test & advanced clinical imaging",
        precision=0, integer=True,
    ),
    "thal": CategoricalParam(
        cli_name="thal",
        display_name="Thalassemia",
        # Backend maps: normal → "normal", reversible/reversible_defect → "reversible defect",
        # fixed/fixed_defect → "fixed defect"
        choices=["normal", "reversible defect", "fixed defect"],
        weights=[0.60, 0.30, 0.10],
        section="Stress test & advanced clinical imaging",
    ),
}

# Section display order — matches frontend section order
SECTION_ORDER = [
    "Basic biometrics",
    "Metabolic & metric blood work",
    "Cardiovascular baseline",
    "Stress test & advanced clinical imaging",
]

# ---------------------------------------------------------------------------
# CLI alias table  (alias → canonical cli_name in PARAMS)
# Includes camelCase frontend field names, snake_case backend names, and
# raw model feature names for maximum convenience.


# ---------------------------------------------------------------------------
# CLI alias table  (alias -> canonical cli_name in PARAMS)
# ---------------------------------------------------------------------------

CLI_ALIASES = {
    # hba1c
    "hba1c_level":        "hba1c",
    "hemoglobin_a1c":     "hba1c",
    "hemoglobin":         "hba1c",
    "hb":                 "hba1c",
    # glucose
    "bloodglucose":       "glucose",
    "blood_glucose":      "glucose",
    "blood_glucose_level":"glucose",
    "bloodglucoselevel":  "glucose",
    # fasting sugar
    "fastingsugar":       "fasting_sugar",
    "fasting_blood_sugar":"fasting_sugar",
    "fastingbloodsugar":  "fasting_sugar",
    "fbs":                "fasting_sugar",
    # cholesterol
    "chol":               "cholesterol",
    "total_cholesterol":  "cholesterol",
    "totalcholesterol":   "cholesterol",
    # blood pressure
    "blood_pressure":          "bp",
    "restingbloodpressure":    "bp",
    "resting_blood_pressure":  "bp",
    "trestbps":                "bp",
    "resting_bp":              "bp",
    # max heart rate
    "maxheartrate":            "max_hr",
    "max_heart_rate":          "max_hr",
    "maximumheartrate":        "max_hr",
    "maximum_heart_rate":      "max_hr",
    "thalch":                  "max_hr",
    # st depression
    "stdepression":            "st_depression",
    "oldpeak":                 "st_depression",
    "st_dep":                  "st_depression",
    # vessels
    "ca":                      "vessels",
    "major_vessels":           "vessels",
    "majorvessels":            "vessels",
    # chest pain
    "cp":                      "chest_pain",
    "chestpain":               "chest_pain",
    "chest_pain_type":         "chest_pain",
    # ecg
    "restecg":                 "ecg",
    "resting_ecg":             "ecg",
    "restingecg":              "ecg",
    # exercise angina
    "exang":                   "angina",
    "exercise_angina":         "angina",
    "exerciseangina":          "angina",
    "exerciseinducedangina":   "angina",
    "exercise_induced_angina": "angina",
    # st slope
    "slope":                   "st_slope",
    "stslope":                 "st_slope",
    "st_slope_type":           "st_slope",
    # thal
    "thalassemia":             "thal",
    # demographics
    "smoking_history":         "smoking",
    "smokinghistory":          "smoking",
    "gender":                  "sex",
    "biological_sex":          "sex",
    "biologicalsex":           "sex",
}


def resolve_param(name):
    """Return canonical parameter name or None if not found."""
    key = name.lower().replace("-", "_").replace(" ", "_")
    if key in PARAMS:
        return key
    flat = key.replace("_", "")
    if flat in CLI_ALIASES:
        return CLI_ALIASES[flat]
    return CLI_ALIASES.get(key)
