"""
PDF generation -- produces a Diagnostyka-style lab report in English.
Section names and field labels match the frontend (PatientForm.jsx).
"""
from __future__ import annotations

import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .generator import GeneratedValue, sorted_results
from .parameters import SECTION_ORDER

GREEN      = colors.HexColor("#007A5E")
LIGHT_GRAY = colors.HexColor("#F5F5F5")
MID_GRAY   = colors.HexColor("#CCCCCC")
RED        = colors.HexColor("#C0392B")
BLUE       = colors.HexColor("#2980B9")
BLACK      = colors.black
WHITE      = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm


def _styles():
    base = getSampleStyleSheet()
    n = base["Normal"]
    def s(name, parent=n, **kw):
        return ParagraphStyle(name, parent=parent, **kw)
    return {
        "logo_main":   s("logo_main",   fontSize=18, textColor=GREEN, fontName="Helvetica-Bold"),
        "logo_sub":    s("logo_sub",    fontSize=8,  textColor=GREEN),
        "lab_name":    s("lab_name",    fontSize=11, fontName="Helvetica-Bold", alignment=TA_CENTER),
        "lab_addr":    s("lab_addr",    fontSize=8,  alignment=TA_CENTER),
        "doc_title":   s("doc_title",   fontSize=10, fontName="Helvetica-Bold", alignment=TA_CENTER),
        "label":       s("label",       fontSize=8,  textColor=colors.HexColor("#555555")),
        "value":       s("value",       fontSize=8,  fontName="Helvetica-Bold"),
        "section":     s("section",     fontSize=9,  fontName="Helvetica-Bold", textColor=BLACK),
        "cell":        s("cell",        fontSize=8),
        "cell_bold":   s("cell_bold",   fontSize=8,  fontName="Helvetica-Bold"),
        "cell_flag":   s("cell_flag",   fontSize=8,  fontName="Helvetica-Bold"),
        "footer":      s("footer",      fontSize=7,  textColor=colors.HexColor("#888888")),
        "footer_link": s("footer_link", fontSize=7,  textColor=GREEN),
    }


def _header(styles, sex, age, date_str):
    elements = []

    logo_tbl = Table(
        [[Paragraph("Diagnostyka<font color='#007A5E'>+</font>", styles["logo_main"]), ""]],
        colWidths=[PAGE_W - 2 * MARGIN - 4 * cm, 4 * cm],
    )
    logo_tbl.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    elements.append(logo_tbl)
    elements.append(Paragraph("Diagnostyka S.A.", styles["logo_sub"]))
    elements.append(Paragraph("ul. prof. Michala Zyczkowskiego 16, 31-864 Krakow", styles["logo_sub"]))
    elements.append(Spacer(1, 6 * mm))

    elements.append(Paragraph("MEDICAL LABORATORY - DIAGNOSTYKA", styles["lab_name"]))
    elements.append(Paragraph(
        "Zyczkowskiego 16, 31-864 Krakow  |  Laboratory of Clinical Diagnostics (533)",
        styles["lab_addr"],
    ))
    elements.append(Paragraph("LABORATORY TEST REPORT", styles["doc_title"]))
    elements.append(Spacer(1, 4 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=MID_GRAY))
    elements.append(Spacer(1, 3 * mm))

    sex_disp = sex or "-"
    age_disp = (str(age) + " years") if age is not None else "-"
    info_data = [
        [Paragraph("Patient:", styles["label"]),          Paragraph("-", styles["value"]),
         Paragraph("ID / PESEL:", styles["label"]),       Paragraph("-", styles["value"])],
        [Paragraph("Registration date:", styles["label"]),Paragraph(date_str, styles["value"]),
         Paragraph("Date of birth:", styles["label"]),    Paragraph("-", styles["value"])],
        [Paragraph("Department:", styles["label"]),       Paragraph("-", styles["value"]),
         Paragraph("Biological sex:", styles["label"]),   Paragraph(sex_disp, styles["value"])],
        [Paragraph("Referring physician:", styles["label"]), Paragraph("-", styles["value"]),
         Paragraph("Age:", styles["label"]),              Paragraph(age_disp, styles["value"])],
    ]
    col_w = (PAGE_W - 2 * MARGIN) / 4
    info_tbl = Table(info_data, colWidths=[col_w * 0.65, col_w * 1.35, col_w * 0.65, col_w * 1.35])
    info_tbl.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING",    (0, 0), (-1, -1), 1),
    ]))
    elements.append(info_tbl)
    elements.append(Spacer(1, 3 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.8, color=MID_GRAY))
    elements.append(Spacer(1, 3 * mm))
    return elements


_COL_WIDTHS = [7.0 * cm, 2.5 * cm, 2.0 * cm, 4.0 * cm, 1.0 * cm]


def _table_header_row(styles):
    return [
        Paragraph("<b>Test</b>",            styles["cell_bold"]),
        Paragraph("<b>Result</b>",          styles["cell_bold"]),
        Paragraph("<b>Unit</b>",            styles["cell_bold"]),
        Paragraph("<b>Reference range</b>", styles["cell_bold"]),
        Paragraph("<b>Flag</b>",            styles["cell_bold"]),
    ]


def _results_section(section_name, rows, styles):
    elements = []
    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(section_name, styles["section"]))
    elements.append(Spacer(1, 1 * mm))

    table_data = [_table_header_row(styles)]
    for gv in rows:
        if gv.skipped:
            continue
        flag = "H" if gv.is_high else ("L" if gv.is_low else "")
        flag_color = RED if gv.is_high else (BLUE if gv.is_low else BLACK)
        flag_para = Paragraph(
            '<font color="{}">{}</font>'.format(flag_color.hexval(), flag),
            styles["cell_flag"],
        )
        val_style = styles["cell_bold"] if flag else styles["cell"]
        val_text = "-" if (gv.skipped or gv.value is None) else str(gv.value)
        ref_text = ("{} - {}".format(gv.ref_low, gv.ref_high)
                    if (gv.ref_low is not None and gv.ref_high is not None) else "-")
        table_data.append([
            Paragraph(gv.display_name, styles["cell"]),
            Paragraph(val_text, val_style),
            Paragraph(gv.unit or "-", styles["cell"]),
            Paragraph(ref_text, styles["cell"]),
            flag_para,
        ])

    if len(table_data) == 1:
        return []

    tbl = Table(table_data, colWidths=_COL_WIDTHS, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  LIGHT_GRAY),
        ("LINEBELOW",     (0, 0), (-1, 0),  0.5, MID_GRAY),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("LINEBELOW",     (0, 1), (-1, -1), 0.3, MID_GRAY),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN",         (1, 0), (1, -1),  "RIGHT"),
        ("ALIGN",         (4, 0), (4, -1),  "CENTER"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 4),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(tbl)
    return elements


def _footer(styles):
    elements = []
    elements.append(Spacer(1, 5 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=MID_GRAY))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        "* Reference ranges are sex- and age-dependent where indicated.",
        styles["footer"],
    ))
    elements.append(Paragraph(
        "** Flag: H = above reference range; L = below reference range.",
        styles["footer"],
    ))
    elements.append(Paragraph(
        "This report was generated synthetically for ML model testing purposes only. "
        "Not for clinical use.",
        styles["footer"],
    ))
    elements.append(Paragraph(
        '<font color="#007A5E">Learn more at www.diag.pl</font>',
        styles["footer_link"],
    ))
    return elements


def generate_pdf(results, output_path):
    """Render a Diagnostyka-style PDF from results to output_path."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN,  bottomMargin=MARGIN,
        title="Laboratory Test Report",
        author="rgen - Medical Lab Report Generator",
    )

    styles   = _styles()
    date_str = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")

    sex_gv = results.get("sex")
    age_gv = results.get("age")
    sex_val = str(sex_gv.value) if (sex_gv and not sex_gv.skipped) else None
    age_val = int(age_gv.value) if (age_gv and not age_gv.skipped and age_gv.value is not None) else None

    elements = []
    elements.extend(_header(styles, sex_val, age_val, date_str))

    all_sorted = sorted_results(results)
    section_groups = {s: [] for s in SECTION_ORDER}
    for gv in all_sorted:
        if gv.section in section_groups:
            section_groups[gv.section].append(gv)

    for section_name in SECTION_ORDER:
        rows = section_groups.get(section_name, [])
        if any(not r.skipped for r in rows):
            elements.extend(_results_section(section_name, rows, styles))

    elements.extend(_footer(styles))
    doc.build(elements)
    return output_path
