# rgen — Medical Lab Report PDF Generator

Generates synthetic Diagnostyka-style lab-report PDFs with parameter values
for the diabetes and heart-disease ML models.

---

## Installation

From the project root:

```bash
pip install -e ".[tools]"
```

Or run directly without installing:

```bash
python -m tools.rgen [OPTIONS]
```

If you want the `rgen` shorthand, add this to your shell profile or install
the package with the provided entry-point:

```bash
# Bash / Zsh alias (quick option)
alias rgen="python -m tools.rgen"
```

---

## Quick reference

| Command | Effect |
|---|---|
| `rgen` | All params random within reference ranges |
| `rgen --output report.pdf` | Save to a specific file |
| `rgen --skip glucose` | Omit glucose from the report |
| `rgen --exceed 20` | All params random, up to 20% outside ref range |
| `rgen --forceexceed 10 20` | All params must be 10–20% outside ref range |
| `rgen --skipall` | Only sex generated; all others omitted |
| `rgen --skipall glucose hba1c` | Only sex + glucose + HbA1c generated randomly |

---

## Global options

### `--exceed N`

All numerical parameters are sampled uniformly from  
`[ref_low × (1 − N/100), ref_high × (1 + N/100)]`.

The value **may** land outside the reference range (up to N%) but is not
required to do so.

```bash
rgen --exceed 20        # up to 20% outside on either side
rgen --exceed 0         # equivalent to default (within range)
```

---

### `--forceexceed N` / `--forceexceed N M`

All numerical parameters **must** land outside the reference range.

```bash
rgen --forceexceed 10         # 0–10% outside ref range
rgen --forceexceed 10 20      # 10–20% outside ref range
```

The direction (above ref_high or below ref_low) is chosen randomly per
parameter.

---

### `--skip param1 [param2 ...]`

Named parameters are omitted from the PDF entirely (as if never measured).
Remaining parameters are random within ref range (unless `--exceed` is also set).

```bash
rgen --skip glucose hba1c
rgen --skip ecg angina st_slope thal
```

---

### `--skipall [param1 ...]`

Skip **all** parameters except:
- `sex` (always generated)
- any parameters listed after `--skipall`
- any parameters explicitly configured with `--PARAM` flags

```bash
rgen --skipall                          # only sex generated
rgen --skipall glucose hba1c           # sex + glucose + HbA1c random
rgen --skipall glucose --glucose -v 75 --sex -v Male
    # Male, glucose=75 mg/dL, all else omitted
```

---

### `--output PATH`

Write the PDF to `PATH` instead of the auto-generated
`result_YYYYMMDD_HHMMSS.pdf`.

```bash
rgen --output /tmp/patient_42.pdf
```

---

## Per-parameter options

Per-parameter flags appear immediately after `--PARAM` and override the
global `--exceed` / `--forceexceed` settings for that parameter.

### `-v VALUE [-u UNIT]`

Set a fixed value. Unit is optional and defaults to the parameter's default
unit. Automatic conversion is applied when a non-default unit is given.

```bash
rgen --glucose -v 3 -u mmol/l          # 3 mmol/l = 54 mg/dL
rgen --glucose -v 90                    # 90 mg/dL (default unit)
rgen --height  -v 180 -u cm
rgen --weight  -v 160 -u lb            # 72.6 kg
rgen --sex     -v Male
rgen --smoking -v never
```

### `-u UNIT`

Force random generation in a specific unit (conversion applied when
comparing to reference range).

```bash
rgen --glucose -u mmol/l               # random, reported in mmol/l
```

### `-e N[%]`

This parameter may be up to N% outside its reference range (random).
Overrides global `--exceed` for this parameter only.

```bash
rgen --hba1c -e 10                     # up to 10% outside ref range
rgen --hba1c -e 10%                    # same (% suffix accepted)
```

### `-fe N` / `-fe N M`

This parameter **must** be outside its reference range (forced exceed).
Overrides global `--forceexceed` for this parameter only.

```bash
rgen --hba1c -fe 10                    # 0–10% outside ref range
rgen --hba1c -fe 5 10                  # 5–10% outside ref range
```

---

## Available parameters & aliases

| CLI name | Aliases | Unit(s) | Ref range | Type |
|---|---|---|---|---|
| `age` | `wiek` | lat | 18–65 | int |
| `sex` | `gender`, `plec` | – | Male / Female | cat |
| `weight` | `waga`, `masa_ciala` | kg / lb | 55–90 kg | float |
| `height` | `wzrost` | cm / m / in | 155–185 cm | float |
| `bmi` | – | kg/m² | 18.5–24.9 | float (auto) |
| `smoking` | `smoking_history`, `palenie` | – | — | cat |
| `hba1c` | `hemoglobin`, `hb`, `hba1c_level` | % / mmol/mol | 4.00–6.00 % | float |
| `glucose` | `blood_glucose`, `glukoza` | mg/dL / mmol/l | 70–99 mg/dL | float |
| `cholesterol` | `chol`, `kolesterol` | mg/dL / mmol/l | 116–190 mg/dL | float |
| `bp` | `blood_pressure`, `trestbps` | mmHg / kpa | 90–120 mmHg | int |
| `max_hr` | `max_heart_rate`, `thalch` | bpm | 100–170 | int |
| `st_depression` | `oldpeak`, `st_dep` | mm | 0.0–1.0 | float |
| `vessels` | `ca`, `major_vessels` | – | 0 | int 0–3 |
| `chest_pain` | `cp`, `bol` | – | — | cat |
| `fasting_sugar` | `fbs`, `fasting_blood_sugar` | – | — | cat |
| `ecg` | `restecg`, `ekg` | – | — | cat |
| `angina` | `exang`, `exercise_angina` | – | — | cat |
| `st_slope` | `slope` | – | — | cat |
| `thal` | `thalassemia`, `tal` | – | — | cat |

**Categorical valid values**

| Parameter | Valid values |
|---|---|
| `sex` | `Male`, `Female` |
| `smoking` | `never`, `former`, `not current`, `current`, `ever` |
| `chest_pain` | `asymptomatic`, `atypical angina`, `non-anginal`, `typical angina` |
| `fasting_sugar` | `True`, `False` |
| `ecg` | `normal`, `lv hypertrophy`, `st-t abnormality` |
| `angina` | `True`, `False` |
| `st_slope` | `upsloping`, `flat`, `downsloping` |
| `thal` | `normal`, `reversible defect`, `fixed defect` |

---

## Combining global and per-parameter options

Per-parameter `-e` / `-fe` always takes precedence over the global
`--exceed` / `--forceexceed` for that parameter.

```bash
# All params up to 20% outside, except glucose which is fixed
rgen --exceed 20 --glucose -v 90

# All params forced 10–20% outside, except hba1c which is within range
rgen --forceexceed 10 20 --hba1c

# Mixed: glucose fixed, hba1c forced outside, rest within range
rgen --glucose -v 3 -u mmol/l --hba1c -fe 5 10
```

---

## PDF output

The generated PDF mimics the layout of a Diagnostyka laboratory report:

- Patient header (date, age, sex)
- Results grouped into sections:
  - **Dane pacjenta** — age, sex, weight, height, BMI, smoking history
  - **Parametry morfologiczne** — HbA1c
  - **Badania biochemiczne** — glucose, cholesterol
  - **Badania kardiologiczne** — BP, max HR, ST depression, vessels
  - **Ocena kliniczna** — chest pain, fasting sugar, ECG, angina, ST slope, thal
- Each row shows: parameter name | value | unit | reference range | H / L flag
- Values outside the reference range are highlighted (H = high, L = low)

---

## Mapping to ML model features

| rgen parameter | Diabetes model feature | Heart disease model feature |
|---|---|---|
| `age` | `age` | `age` |
| `sex` | `sex` | `sex` |
| `weight` + `height` → `bmi` | `bmi` | – |
| `smoking` | `smoking_history` | – |
| `hba1c` | `HbA1c_level` | – |
| `glucose` | `blood_glucose_level` | – |
| `cholesterol` | – | `chol` |
| `bp` | – | `trestbps` |
| `max_hr` | – | `thalch` |
| `st_depression` | – | `oldpeak` |
| `vessels` | – | `ca` |
| `chest_pain` | – | `cp` |
| `fasting_sugar` | – | `fbs` |
| `ecg` | – | `restecg` |
| `angina` | – | `exang` |
| `st_slope` | – | `slope` |
| `thal` | – | `thal` |
