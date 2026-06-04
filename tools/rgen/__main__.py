"""
rgen — Medical Lab Report PDF Generator
========================================

CLI entry point and argument parser.

Usage examples (see README.md for full docs):
  rgen
  rgen --skip glucose
  rgen --glucose -v 5.5 -u mmol/l --hba1c -e 10
  rgen --exceed 20
  rgen --forceexceed 10 20
  rgen --skipall age sex glucose
"""
from __future__ import annotations

import sys
import datetime
from pathlib import Path
from typing import Optional

from .parameters import PARAMS, resolve_param
from .generator import ParamInstruction, generate_all
from .pdf_template import generate_pdf


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pct(s: str) -> float:
    """Parse '10%' or '10' as a float percentage value."""
    return float(s.rstrip("%"))


def _err(msg: str) -> None:
    print(f"[rgen] Error: {msg}", file=sys.stderr)
    sys.exit(1)


def _all_param_names() -> set[str]:
    return set(PARAMS.keys())


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

class Token:
    def __init__(self, value: str):
        self.value = value

    @property
    def is_flag(self) -> bool:
        return self.value.startswith("--") or (
            self.value.startswith("-") and len(self.value) == 2
        )

    @property
    def is_long_flag(self) -> bool:
        return self.value.startswith("--")

    def __repr__(self):
        return f"Token({self.value!r})"


def _tokenise(argv: list[str]) -> list[Token]:
    return [Token(a) for a in argv]


def parse_args(argv: list[str]) -> tuple[dict[str, ParamInstruction], dict]:
    """
    Parse argv and return:
      - instructions  : dict[canonical_name → ParamInstruction]
      - global_opts   : dict with keys 'exceed_max', 'force_lo', 'force_hi', 'output'
    """
    tokens = _tokenise(argv)
    instructions: dict[str, ParamInstruction] = {}
    global_opts: dict = {
        "exceed_max": 0.0,
        "force_lo": None,
        "force_hi": None,
        "output": None,
        "skipall": False,
        "skipall_include": set(),
    }

    i = 0

    def peek(offset=0) -> Optional[Token]:
        idx = i + offset
        return tokens[idx] if idx < len(tokens) else None

    def advance() -> Optional[Token]:
        nonlocal i
        t = peek()
        i += 1
        return t

    # ── First pass: handle global flags and identify param blocks ─────────
    while i < len(tokens):
        tok = advance()
        assert tok is not None

        # ── Global: --exceed N ──────────────────────────────────────────
        if tok.value == "--exceed":
            nxt = peek()
            if nxt is None or nxt.is_flag:
                _err("--exceed requires a numeric argument (e.g. --exceed 20)")
            global_opts["exceed_max"] = _pct(advance().value)  # type: ignore
            continue

        # ── Global: --forceexceed N [M] ────────────────────────────────
        if tok.value == "--forceexceed":
            nxt = peek()
            if nxt is None or nxt.is_flag:
                _err("--forceexceed requires at least one numeric argument")
            lo = _pct(advance().value)  # type: ignore
            nxt2 = peek()
            if nxt2 is not None and not nxt2.is_flag:
                hi = _pct(advance().value)  # type: ignore
                global_opts["force_lo"] = lo
                global_opts["force_hi"] = hi
            else:
                global_opts["force_lo"] = 0.0
                global_opts["force_hi"] = lo
            continue

        # ── Global: --output PATH ──────────────────────────────────────
        if tok.value == "--output":
            nxt = peek()
            if nxt is None or nxt.is_flag:
                _err("--output requires a file path argument")
            global_opts["output"] = advance().value  # type: ignore
            continue

        # ── Global: --skip param1 [param2 ...] ────────────────────────
        if tok.value == "--skip":
            while True:
                nxt = peek()
                if nxt is None or nxt.is_long_flag:
                    break
                name_raw = advance().value  # type: ignore
                canon = resolve_param(name_raw)
                if canon is None:
                    _err(f"Unknown parameter '{name_raw}' in --skip")
                instructions[canon] = ParamInstruction(param_name=canon, skipped=True)
            continue

        # ── Global: --skipall [param1 ...] ────────────────────────────
        if tok.value == "--skipall":
            global_opts["skipall"] = True
            while True:
                nxt = peek()
                if nxt is None or nxt.is_long_flag:
                    break
                name_raw = advance().value  # type: ignore
                canon = resolve_param(name_raw)
                if canon is None:
                    _err(f"Unknown parameter '{name_raw}' in --skipall")
                global_opts["skipall_include"].add(canon)
            continue

        # ── Per-param block: --paramname [-v VALUE] [-u UNIT] [-e PCT] [-fe PCT [PCT]] ──
        if tok.is_long_flag:
            param_raw = tok.value[2:]  # strip "--"
            canon = resolve_param(param_raw)
            if canon is None:
                _err(f"Unknown parameter '--{param_raw}'. Run 'rgen --help' for available parameters.")

            instr = ParamInstruction(param_name=canon)

            # Consume sub-flags until next --flag.
            # Bare value directly after --param (no -v) is treated as implicit -v.
            while True:
                nxt = peek()
                if nxt is None or nxt.is_long_flag:
                    break

                # Implicit -v: next token is not a short flag and no value set yet
                if (not nxt.is_flag
                        and instr.fixed_value is None
                        and instr.fixed_str is None):
                    val_raw = advance().value  # type: ignore
                    # Optional inline unit (e.g. --bp 140 mmHg)
                    unit_nxt = peek()
                    if (unit_nxt is not None
                            and not unit_nxt.is_flag
                            and not unit_nxt.value.lstrip("-").replace(".", "").replace("%", "").isdigit()):
                        instr.unit = advance().value  # type: ignore
                    try:
                        instr.fixed_value = float(val_raw)
                    except ValueError:
                        instr.fixed_str = val_raw
                    continue

                sub = advance()
                assert sub is not None

                # -v VALUE [-u UNIT]
                if sub.value == "-v":
                    val_tok = peek()
                    if val_tok is None or val_tok.is_flag:
                        _err(f"-v requires a value for --{param_raw}")
                    val_raw = advance().value  # type: ignore
                    # Check if followed by a unit without -u flag (e.g. "-v 3 mmol/l")
                    unit_nxt = peek()
                    if unit_nxt is not None and not unit_nxt.is_flag and not unit_nxt.value.lstrip("-").replace(".","").isdigit():
                        instr.unit = advance().value  # type: ignore
                    try:
                        instr.fixed_value = float(val_raw)
                    except ValueError:
                        # Might be a categorical value
                        instr.fixed_str = val_raw

                # -u UNIT
                elif sub.value == "-u":
                    unit_tok = peek()
                    if unit_tok is None or unit_tok.is_flag:
                        _err(f"-u requires a unit string for --{param_raw}")
                    instr.unit = advance().value  # type: ignore

                # -e PCT[%]
                elif sub.value == "-e":
                    pct_tok = peek()
                    if pct_tok is None or pct_tok.is_flag:
                        _err(f"-e requires a percentage for --{param_raw}")
                    instr.exceed_max = _pct(advance().value)  # type: ignore

                # -fe PCT [PCT]   (force exceed)
                elif sub.value == "-fe":
                    pct1_tok = peek()
                    if pct1_tok is None or pct1_tok.is_flag:
                        _err(f"-fe requires at least one percentage for --{param_raw}")
                    p1 = _pct(advance().value)  # type: ignore
                    pct2_tok = peek()
                    if pct2_tok is not None and not pct2_tok.is_flag:
                        try:
                            p2 = _pct(peek().value)  # type: ignore
                            advance()
                            instr.force_exceed_lo = p1
                            instr.force_exceed_hi = p2
                        except ValueError:
                            instr.force_exceed_lo = 0.0
                            instr.force_exceed_hi = p1
                    else:
                        instr.force_exceed_lo = 0.0
                        instr.force_exceed_hi = p1

                else:
                    # Unknown sub-flag — put back (treat as next token group)
                    i -= 1
                    break

            instructions[canon] = instr
            continue

        # Unknown positional token
        if tok.value not in ("--help", "-h"):
            print(f"[rgen] Warning: ignoring unrecognised token '{tok.value}'", file=sys.stderr)

    # ── Apply --skipall: mark everything not in include-set as skipped ─────
    if global_opts["skipall"]:
        include_set = global_opts["skipall_include"]
        # Also keep params already explicitly configured in instructions (non-skip)
        explicit_non_skip = {k for k, v in instructions.items() if not v.skipped}
        for name in _all_param_names():
            if name == "sex":
                # sex is always generated under --skipall (unless explicitly skipped)
                continue
            if name in include_set or name in explicit_non_skip:
                continue
            if name not in instructions:
                instructions[name] = ParamInstruction(param_name=name, skipped=True)

    return instructions, global_opts


# ---------------------------------------------------------------------------
# Help text
# ---------------------------------------------------------------------------

HELP_TEXT = """
rgen — Medical Lab Report PDF Generator
=========================================

Generates a synthetic Diagnostyka-style lab-report PDF for the
diabetes / heart-disease ML models.

USAGE
  rgen [OPTIONS]

GLOBAL OPTIONS
  --exceed N          All params may be up to N% outside reference range.
  --forceexceed N     All params must be 0–N% outside reference range.
  --forceexceed N M   All params must be N–M% outside reference range.
  --skip p1 [p2 ...]  Omit listed parameters from the report entirely.
  --skipall [p1 ...]  Omit all parameters except sex (always generated)
                      and any params listed after --skipall.
  --output PATH       Write PDF to PATH (default: result_YYYYMMDD_HHMMSS.pdf).

PER-PARAMETER OPTIONS  (--PARAM [sub-flags])
  --PARAM                  Generate PARAM randomly within its reference range.
  --PARAM -v VALUE         Set PARAM to a fixed VALUE (in default unit).
  --PARAM -v VALUE -u UNIT Set PARAM to VALUE in UNIT (converted automatically).
  --PARAM -e N[%]          Generate PARAM randomly; may be up to N% outside range.
  --PARAM -fe N            Generate PARAM 0–N% outside reference range (forced).
  --PARAM -fe N M          Generate PARAM N–M% outside reference range (forced).

AVAILABLE PARAMETERS  (section / name / unit / choices)

  Basic biometrics
    age             Age  (years)
    sex             Biological sex  [Male | Female]
    weight          Weight  (kg | lb)
    height          Height  (cm | m | in)
    bmi             BMI  (kg/m2) — auto-computed from weight+height
    smoking         Tobacco smoking history
                    [never | former | current | not current | ever | No Info]

  Metabolic & metric blood work
    hba1c           HbA1c level (3-month avg)  (% | mmol/mol)
    glucose         Blood glucose level  (mg/dL | mmol/l)
    fasting_sugar   Fasting blood sugar level  (mg/dL) — >120 sets fbs=True in model
    cholesterol     Total cholesterol  (mg/dL | mmol/l)

  Cardiovascular baseline
    chest_pain      Chest pain specification
                    [asymptomatic | typical angina | atypical angina | non-anginal]
    bp              Resting blood pressure  (mmHg | kpa)
    ecg             Resting ECG  [normal | st-t abnormality | lv hypertrophy]

  Stress test & advanced clinical imaging
    max_hr          Maximum heart rate  (bpm)
    angina          Exercise induced angina  [True | False]
    st_depression   ST Depression relative to rest  (mm)  — model feature: oldpeak
    st_slope        Peak exercise ST segment slope  [upsloping | flat | downsloping]
    vessels         Major vessels colored by fluoroscopy  (0-3)  — model feature: ca
    thal            Thalassemia  [normal | reversible defect | fixed defect]

  Frontend camelCase aliases are also accepted:
    hbA1c, bloodGlucose, fastingSugar, restingBloodPressure, restingEcg,
    maxHeartRate, exerciseAngina, stDepression, stSlope, majorVessels,
    smokingHistory, chestPain
  Model feature names: trestbps=bp, chol=cholesterol, thalch=max_hr,
    oldpeak=st_depression, ca=vessels, cp=chest_pain, fbs=fasting_sugar,
    restecg=ecg, exang=angina, slope=st_slope

EXAMPLES
  rgen
      Everything random within reference ranges.

  rgen --skip glucose hba1c
      Random report, glucose and HbA1c omitted.

  rgen --glucose -v 3 -u mmol/l --hba1c -e 10
      Glucose fixed at 3 mmol/l; HbA1c random +-10% of reference bounds.

  rgen --glucose -v 3 -u mmol/l --hba1c -fe 10
      Glucose fixed; HbA1c forced 0-10% outside reference range.

  rgen --glucose -v 3 -u mmol/l --hba1c -fe 5 10
      Glucose fixed; HbA1c forced 5-10% outside reference range.

  rgen --exceed 20
      All params random, up to 20% outside reference range.

  rgen --forceexceed 10 20
      All params must be 10-20% outside reference range.

  rgen --skipall glucose hba1c
      Only sex (+ glucose + HbA1c) generated randomly; everything else omitted.

  rgen --skipall glucose hba1c --glucose -v 75 --sex -v Male
      Male patient; glucose fixed at 75 mg/dL; HbA1c random; all else omitted.
"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(argv: Optional[list[str]] = None) -> None:
    if argv is None:
        argv = sys.argv[1:]

    if "--help" in argv or "-h" in argv:
        print(HELP_TEXT)
        return

    instructions, global_opts = parse_args(argv)

    results = generate_all(
        instructions,
        global_exceed_max=global_opts["exceed_max"],
        global_force_lo=global_opts["force_lo"],
        global_force_hi=global_opts["force_hi"],
    )

    # ── Determine output path ─────────────────────────────────────────────
    if global_opts["output"]:
        out_path = Path(global_opts["output"])
    else:
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        out_path = Path(f"result_{ts}.pdf")

    generate_pdf(results, out_path)

    # Print summary to stdout
    print(f"[rgen] PDF written -> {out_path.resolve()}")
    print()
    print(f"{'Parameter':<35} {'Value':<15} {'Unit':<10} {'Ref range':<20} {'Flag'}")
    print("-" * 90)

    from .generator import sorted_results
    for gv in sorted_results(results):
        if gv.skipped:
            print(f"  {'[SKIPPED]':<33} {'-':<15} {'-':<10} {'-':<20}")
            continue
        flag = "H" if gv.is_high else ("L" if gv.is_low else "")
        ref_str = f"{gv.ref_low} - {gv.ref_high}" if (gv.ref_low is not None) else "-"
        print(f"  {gv.display_name:<33} {str(gv.value):<15} {gv.unit:<10} {ref_str:<20} {flag}")


if __name__ == "__main__":
    main()
