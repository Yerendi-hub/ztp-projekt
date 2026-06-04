"""
Value generation logic for rgen.

Handles random generation within reference ranges, optional/forced exceedance,
fixed values, unit conversions, and BMI auto-computation.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Optional, Union

from .parameters import PARAMS, NumericParam, CategoricalParam, SECTION_ORDER


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class GeneratedValue:
    param_name: str
    display_name: str
    value: Optional[Union[float, int, str]]   # None → skipped
    unit: str
    ref_low: Optional[float]   # in display unit; None for categorical / skipped
    ref_high: Optional[float]
    skipped: bool = False
    is_high: bool = False
    is_low: bool = False
    section: str = ""


# ---------------------------------------------------------------------------
# Instruction (parsed per-parameter directive from CLI)
# ---------------------------------------------------------------------------

@dataclass
class ParamInstruction:
    param_name: str              # canonical name
    skipped: bool = False
    fixed_value: Optional[float] = None
    fixed_str: Optional[str] = None     # for categorical fixed values
    unit: Optional[str] = None
    exceed_max: float = 0.0             # -e  : max % above/below ref (0 = within)
    force_exceed_lo: Optional[float] = None   # -fe N or -fe N M
    force_exceed_hi: Optional[float] = None


# ---------------------------------------------------------------------------
# Unit helpers
# ---------------------------------------------------------------------------

def _to_default(value: float, unit: str, param: NumericParam) -> float:
    """Convert *value* expressed in *unit* to the param's default unit."""
    key = unit.lower().strip().replace(" ", "")
    default_key = param.unit.lower().strip().replace(" ", "")
    if key == default_key or not key:
        return value
    factor = param.unit_aliases.get(key) or param.unit_aliases.get(unit.lower().strip())
    if factor is None:
        return value  # unknown unit — pass through
    return value * factor


def _from_default(value: float, unit: str, param: NumericParam) -> float:
    """Convert *value* expressed in the param's default unit to *unit*."""
    key = unit.lower().strip().replace(" ", "")
    default_key = param.unit.lower().strip().replace(" ", "")
    if key == default_key or not key:
        return value
    factor = param.unit_aliases.get(key) or param.unit_aliases.get(unit.lower().strip())
    if factor is None:
        return value
    return value / factor


# ---------------------------------------------------------------------------
# Core generator
# ---------------------------------------------------------------------------

def _clamp_positive(v: float) -> float:
    return max(0.0, v)


def _generate_numeric(
    param: NumericParam,
    instr: ParamInstruction,
    global_exceed_max: float,
    global_force_lo: Optional[float],
    global_force_hi: Optional[float],
) -> GeneratedValue:
    display_unit = instr.unit or param.unit

    # ── Fixed value ────────────────────────────────────────────────────────
    if instr.fixed_value is not None:
        val_display = instr.fixed_value
        val_default = _to_default(val_display, display_unit, param)
        is_high = param.ref_high > param.ref_low and val_default > param.ref_high
        is_low  = param.ref_high > param.ref_low and val_default < param.ref_low
        ref_lo_disp = _from_default(param.ref_low,  display_unit, param)
        ref_hi_disp = _from_default(param.ref_high, display_unit, param)
        result_val: Union[float, int] = int(round(val_display)) if param.integer else round(val_display, param.precision)
        return GeneratedValue(
            param_name=param.cli_name,
            display_name=param.display_name,
            value=result_val,
            unit=display_unit,
            ref_low=round(ref_lo_disp, param.precision) if param.ref_low != param.ref_high else None,
            ref_high=round(ref_hi_disp, param.precision) if param.ref_low != param.ref_high else None,
            is_high=is_high, is_low=is_low,
            section=param.section,
        )

    # ── Determine effective exceedance settings ────────────────────────────
    # Per-param settings override global settings
    force_lo = instr.force_exceed_lo if instr.force_exceed_lo is not None else global_force_lo
    force_hi = instr.force_exceed_hi if instr.force_exceed_hi is not None else global_force_hi
    exc_max  = instr.exceed_max      if instr.exceed_max > 0            else global_exceed_max

    ref_lo = param.ref_low
    ref_hi = param.ref_high
    same_bounds = math.isclose(ref_lo, ref_hi, rel_tol=1e-9)

    # ── Generate value (default unit) ──────────────────────────────────────
    if force_lo is not None:
        # Must be outside range by [force_lo%, force_hi%]
        f_lo = force_lo / 100.0
        f_hi = (force_hi / 100.0) if force_hi is not None else f_lo

        if same_bounds:
            # For params like vessels where ref=[0,0]: treat as integer 0→N
            side = "high"
        else:
            side = random.choice(["low", "high"])

        if side == "high":
            lo = _clamp_positive(ref_hi * (1.0 + f_lo) if not same_bounds else ref_hi + f_lo)
            hi = _clamp_positive(ref_hi * (1.0 + f_hi) if not same_bounds else ref_hi + f_hi)
        else:
            lo = _clamp_positive(ref_lo * (1.0 - f_hi))
            hi = _clamp_positive(ref_lo * (1.0 - f_lo))

        if param.integer:
            lo_int = max(0, int(math.ceil(lo)))
            hi_int = max(lo_int, int(math.floor(hi)))
            # For vessels-style params (same bounds): shift by 1
            if same_bounds:
                hi_int = max(lo_int, int(ref_hi) + int(math.ceil(f_hi * 10)) if f_hi > 0 else int(ref_hi) + 1)
                hi_int = min(hi_int, 3)  # vessels max
            val_default = float(random.randint(lo_int, hi_int))
        else:
            if lo > hi:
                lo, hi = hi, lo
            val_default = random.uniform(lo, hi)

    else:
        # Optional exceedance or no exceedance
        if same_bounds:
            # vessels-style: 0 within range, allow small positive when exc_max>0
            if exc_max > 0:
                max_val = int(exc_max / 25)  # 25% per vessel step
                val_default = float(random.randint(0, max(0, min(3, max_val))))
            else:
                val_default = ref_lo  # always 0
        else:
            lo = _clamp_positive(ref_lo * (1.0 - exc_max / 100.0))
            hi = ref_hi * (1.0 + exc_max / 100.0)
            if param.integer:
                val_default = float(random.randint(int(math.ceil(lo)), int(math.floor(hi))))
            else:
                val_default = random.uniform(lo, hi)

    # ── Convert to display unit, round ────────────────────────────────────
    val_display = _from_default(val_default, display_unit, param)
    if param.integer:
        val_display = int(round(val_display))
    else:
        val_display = round(val_display, param.precision)

    # Re-derive default for comparison (in case of rounding)
    val_default2 = _to_default(float(val_display), display_unit, param)
    is_high = (not same_bounds) and val_default2 > param.ref_high
    is_low  = (not same_bounds) and val_default2 < param.ref_low

    ref_lo_disp = _from_default(param.ref_low,  display_unit, param) if not same_bounds else None
    ref_hi_disp = _from_default(param.ref_high, display_unit, param) if not same_bounds else None

    return GeneratedValue(
        param_name=param.cli_name,
        display_name=param.display_name,
        value=val_display,
        unit=display_unit,
        ref_low=round(ref_lo_disp, param.precision) if ref_lo_disp is not None else None,
        ref_high=round(ref_hi_disp, param.precision) if ref_hi_disp is not None else None,
        is_high=is_high, is_low=is_low,
        section=param.section,
    )


def _generate_categorical(
    param: CategoricalParam,
    instr: ParamInstruction,
) -> GeneratedValue:
    if instr.fixed_str is not None:
        val = instr.fixed_str
    else:
        val = random.choices(param.choices, weights=param.weights, k=1)[0]

    return GeneratedValue(
        param_name=param.cli_name,
        display_name=param.display_name,
        value=val,
        unit=param.unit,
        ref_low=None, ref_high=None,
        section=param.section,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_all(
    instructions: dict[str, ParamInstruction],
    global_exceed_max: float = 0.0,
    global_force_lo: Optional[float] = None,
    global_force_hi: Optional[float] = None,
) -> dict[str, GeneratedValue]:
    """
    Generate values for all parameters.

    *instructions* maps canonical param names to per-param directives.
    Parameters not in *instructions* use default random-within-range.
    """
    results: dict[str, GeneratedValue] = {}

    for name, param in PARAMS.items():
        instr = instructions.get(name, ParamInstruction(param_name=name))

        if instr.skipped:
            results[name] = GeneratedValue(
                param_name=name,
                display_name=param.display_name,
                value=None,
                unit="",
                ref_low=None, ref_high=None,
                skipped=True,
                section=param.section,
            )
            continue

        if isinstance(param, NumericParam):
            results[name] = _generate_numeric(
                param, instr,
                global_exceed_max, global_force_lo, global_force_hi,
            )
        else:
            results[name] = _generate_categorical(param, instr)

    # ── Auto-compute BMI if weight/height are present but bmi is not fixed ──
    bmi_instr = instructions.get("bmi", ParamInstruction(param_name="bmi"))
    if (
        not bmi_instr.skipped
        and bmi_instr.fixed_value is None
        and "weight" in results
        and "height" in results
        and not results["weight"].skipped
        and not results["height"].skipped
    ):
        w = results["weight"].value
        h = results["height"].value
        if w is not None and h is not None:
            h_m = float(h) / 100.0
            if h_m > 0:
                bmi_val = round(float(w) / (h_m ** 2), 1)
                bmi_param = PARAMS["bmi"]
                assert isinstance(bmi_param, NumericParam)
                is_high = bmi_val > bmi_param.ref_high
                is_low  = bmi_val < bmi_param.ref_low
                results["bmi"] = GeneratedValue(
                    param_name="bmi",
                    display_name=bmi_param.display_name,
                    value=bmi_val,
                    unit=bmi_param.unit,
                    ref_low=bmi_param.ref_low,
                    ref_high=bmi_param.ref_high,
                    is_high=is_high, is_low=is_low,
                    section=bmi_param.section,
                )

    return results


def sorted_results(results: dict[str, GeneratedValue]) -> list[GeneratedValue]:
    """Return result values sorted by section order then parameter order."""
    param_order = list(PARAMS.keys())
    section_idx = {s: i for i, s in enumerate(SECTION_ORDER)}

    def sort_key(gv: GeneratedValue):
        si = section_idx.get(gv.section, 99)
        pi = param_order.index(gv.param_name) if gv.param_name in param_order else 99
        return (si, pi)

    return sorted(results.values(), key=sort_key)
