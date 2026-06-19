/**
 * Hojas interactivas con direcciones de celda y fórmulas arrastrables (tap-to-ref).
 */
import {
  recalcAll,
  getCellValue,
  round2,
  formulasMatch,
  closeEnough,
} from "./formulaParser.js";
import { renderCellLegendHtml } from "./cellLegend.js";
import { renderUnlockedChipsHtml } from "./skills.js";

/** Definiciones de mini-hojas alineadas a S6/S8 */
export const GRID_SHEETS = {
  depreciacion_s6: {
    id: "depreciacion_s6",
    title: "Depreciación lineal",
    source: "S6 Flujo basico FCE y FCF.xlsx → hoja FCE",
    legendId: "depreciacion_s6",
    hint: "Arma la dep anual con capital, VR y vida útil. Luego pon su negativo en el flujo (no es plata que sale).",
    tableRows: ["I5", "L6", "B8", "J6", "D8"],
    cells: {
      B5: { type: "label", concept: "Etiqueta", value: "Capital / inversión" },
      I5: {
        type: "input",
        concept: "Capital / inversión del activo",
        value: "1240",
        editable: true,
      },
      B6: { type: "label", concept: "Etiqueta", value: "Valor residual (VR)" },
      L6: {
        type: "input",
        concept: "Valor residual (VR)",
        value: "40",
        editable: true,
      },
      B7: { type: "label", concept: "Etiqueta", value: "Vida útil (años)" },
      B8: {
        type: "input",
        concept: "Vida útil en años",
        value: "3",
        editable: true,
      },
      B9: { type: "label", concept: "Etiqueta", value: "Depreciación anual" },
      J6: {
        type: "formula",
        concept: "Depreciación anual",
        formulaRaw: "",
        expectedFormula: "=(I5-L6)/B8",
        excelRef: "Concepto: (Capital − VR) ÷ Vida",
        editable: true,
        expectedValue: 400,
      },
      B10: { type: "label", concept: "Etiqueta", value: "Dep. en flujo FCE" },
      D8: {
        type: "formula",
        concept: "Depreciación en flujo (negativa)",
        formulaRaw: "",
        expectedFormula: "=-J6",
        excelRef: "Negativo porque no es desembolso de caja",
        editable: true,
        expectedValue: -400,
      },
    },
    validate: (cells) => {
      recalcAll(cells);
      return {
        ok:
          closeEnough(getCellValue(cells, "J6"), 400) &&
          closeEnough(getCellValue(cells, "D8"), -400),
      };
    },
  },

  s6_tasas: {
    id: "s6_tasas",
    title: "CAPM — costo del capital (Ke)",
    source: "S6 Flujo basico FCE y FCF.xlsx → hoja Tasas (FCE C2 = Tasas!D8)",
    legendId: "s6_tasas",
    hint: "Ingresa Rf, prima de mercado, beta y riesgo país. Luego arma Ke en D8 tocando las celdas.",
    tableRows: ["D3", "D4", "D5", "D6", "D8"],
    cells: {
      B3: { type: "label", concept: "Etiqueta", value: "Tasa libre de riesgo (Rf)" },
      D3: {
        type: "input",
        concept: "Rf — tasa libre de riesgo",
        value: "0.0315",
        editable: true,
        excelRef: "Ej. 3,15% en S6",
      },
      B4: { type: "label", concept: "Etiqueta", value: "Prima de mercado (Rm − Rf)" },
      D4: {
        type: "input",
        concept: "Prima de mercado (Rm − Rf)",
        value: "0.0307",
        editable: true,
        excelRef: "Ej. 3,07% en S6",
      },
      B5: { type: "label", concept: "Etiqueta", value: "Beta (β)" },
      D5: {
        type: "input",
        concept: "Beta del proyecto",
        value: "1.4",
        editable: true,
        excelRef: "Sensibilidad al mercado",
      },
      B6: { type: "label", concept: "Etiqueta", value: "Riesgo país (rp)" },
      D6: {
        type: "input",
        concept: "Riesgo país",
        value: "0.0255",
        editable: true,
        excelRef: "Prima adicional por país",
      },
      B8: { type: "label", concept: "Etiqueta", value: "Ke — costo capital propio" },
      D8: {
        type: "formula",
        concept: "Ke — costo del capital (CAPM)",
        formulaRaw: "",
        expectedFormula: "=D3+D5*D4+D6",
        excelRef: "Rf + β × (Rm−Rf) + rp — igual a Tasas!D8",
        editable: true,
        expectedValue: 0.09998,
      },
    },
    validate: (cells) => ({
      ok: closeEnough(getCellValue(cells, "D8"), 0.09998, 0.01),
    }),
  },

  fce_cadena_s6: {
    id: "fce_cadena_s6",
    title: "Flujo de caja económico — periodo 1",
    source: "S6 → hoja FCE, columna D (año 1)",
    legendId: "fce_cadena_s6",
    hint: "UAII puede dar 0 y aun asi el flujo no: la dep (-400) baja utilidad pero vuelve al calcular flujo (no es caja). Flujo f = UN − Dep + Inv.",
    tableRows: ["D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "D5", "D14"],
    cells: {
      B6: { type: "label", concept: "Fila ingresos", value: "Ingresos" },
      D6: { type: "input", concept: "Ingresos", value: "500", editable: true },
      B7: { type: "label", concept: "Fila egresos", value: "Egresos" },
      D7: { type: "input", concept: "Egresos (negativos)", value: "-100", editable: true },
      B8: { type: "label", concept: "Fila depreciación", value: "Depreciación" },
      D8: { type: "input", concept: "Depreciación (negativa)", value: "-400", editable: true },
      B9: { type: "label", concept: "Fila UAII", value: "UAII" },
      D9: {
        type: "formula",
        concept: "UAII — utilidad antes de intereses e impuestos",
        formulaRaw: "",
        expectedFormula: "=D6+D7+D8",
        excelRef: "Ingresos + Egresos + Dep",
        editable: true,
        expectedValue: 0,
      },
      B10: { type: "label", concept: "Fila intereses", value: "Intereses" },
      D10: { type: "input", concept: "Intereses (0 sin deuda)", value: "0", editable: true },
      B11: { type: "label", concept: "Fila UAI", value: "UAI" },
      D11: {
        type: "formula",
        concept: "UAI — utilidad antes de impuestos",
        formulaRaw: "",
        expectedFormula: "=D9+D10",
        excelRef: "UAII + Intereses",
        editable: true,
        expectedValue: 0,
      },
      B12: { type: "label", concept: "Fila impuesto", value: "Impuesto 30%" },
      D12: {
        type: "formula",
        concept: "Impuesto sobre UAI",
        formulaRaw: "",
        expectedFormula: "=-0.3*D11",
        excelRef: "−30% × UAI",
        editable: true,
        expectedValue: 0,
      },
      B13: { type: "label", concept: "Fila UN", value: "Utilidad neta" },
      D13: {
        type: "formula",
        concept: "UN — utilidad neta",
        formulaRaw: "",
        expectedFormula: "=D11+D12",
        excelRef: "UAI + Impuesto",
        editable: true,
        expectedValue: 0,
      },
      D5: {
        type: "input",
        concept: "Inversión del periodo (0 en año 1)",
        value: "0",
        editable: true,
        excelRef: "D5 = 0 en esta cadena; suma si hay capex",
      },
      B14: { type: "label", concept: "Fila flujo", value: "Flujo de fondos" },
      D14: {
        type: "formula",
        concept: "Flujo de fondos del periodo",
        formulaRaw: "",
        expectedFormula: "=D13-D8+D5",
        excelRef: "UN − Dep + Inv (dep negativa → suma)",
        editable: true,
        expectedValue: 400,
      },
    },
    validate: (cells) => ({
      ok:
        closeEnough(getCellValue(cells, "D9"), 0) &&
        closeEnough(getCellValue(cells, "D14"), 400),
    }),
  },

  van_s7: {
    id: "van_s7",
    title: "Vaf y VAN",
    source: "S7 → hoja Nuevo o usado",
    legendId: "van_s7",
    hint: "Vaf = VNA (función Excel en español) solo flujos P1…Pn. VAN = Vaf + inversión inicial (C6).",
    cells: {
      B5: { type: "label", concept: "Tasa", value: "k" },
      C5: { type: "input", concept: "Tasa de descuento (COK)", value: "0.12", editable: true },
      B6: { type: "label", concept: "P0", value: "Inversión" },
      C6: { type: "input", concept: "Flujo periodo 0 (inversión)", value: "-1240", editable: true },
      B7: { type: "label", concept: "P1", value: "Flujo 1" },
      D16: { type: "input", concept: "Flujo periodo 1", value: "435", editable: true },
      B8: { type: "label", concept: "P2", value: "Flujo 2" },
      E16: { type: "input", concept: "Flujo periodo 2", value: "575", editable: true },
      B9: { type: "label", concept: "P3", value: "Flujo 3" },
      F16: { type: "input", concept: "Flujo periodo 3", value: "580", editable: true },
      B11: { type: "label", concept: "Vaf", value: "Valor actual flujos" },
      C17: {
        type: "formula",
        concept: "Vaf — valor actual de flujos futuros",
        formulaRaw: "",
        expectedFormula: "=VNA(C5,D16:F16)",
        excelRef: "VNA en Excel español (=NPV en inglés). Sin periodo 0.",
        editable: true,
        expectedValue: 1259.61,
      },
      B12: { type: "label", concept: "VAN", value: "Valor actual neto" },
      C18: {
        type: "formula",
        concept: "VAN — incluye inversión inicial",
        formulaRaw: "",
        expectedFormula: "=C17+C6",
        excelRef: "Vaf + Flujo P0",
        editable: true,
        expectedValue: 19.61,
      },
    },
    validate: (cells) => ({
      ok:
        closeEnough(getCellValue(cells, "C17"), 1259.61, 2) &&
        closeEnough(getCellValue(cells, "C18"), 19.61, 2),
    }),
  },

  s8_amort_pmt: {
    id: "s8_amort_pmt",
    title: "Cuota e interés del préstamo",
    source: "S8 Ejerc icios financiamiento.xls",
    legendId: "s8_amort_pmt",
    hint: "Interés = saldo × tasa. Cuota = PAGO en Excel español (=PMT en inglés).",
    cells: {
      B4: { type: "label", concept: "Tasa", value: "i" },
      I4: { type: "input", concept: "Tasa de interés", value: "0.1", editable: true },
      B6: { type: "label", concept: "Plazo", value: "n" },
      N6: { type: "input", concept: "Plazo en periodos", value: "3", editable: true },
      B8: { type: "label", concept: "Préstamo", value: "P" },
      I6: { type: "input", concept: "Monto del préstamo", value: "500", editable: true },
      B10: { type: "label", concept: "Cuota", value: "PMT" },
      L7: {
        type: "formula",
        concept: "Cuota constante",
        formulaRaw: "",
        expectedFormula: "=PAGO(I4,N6,I6)",
        excelRef: "PAGO(tasa, plazo, préstamo) en Excel español",
        editable: true,
        expectedValue: -201.06,
      },
      B11: { type: "label", concept: "Interés P1", value: "Int" },
      J7: {
        type: "formula",
        concept: "Interés periodo 1",
        formulaRaw: "",
        expectedFormula: "=I6*I4",
        excelRef: "Saldo × tasa = 500 × 10%",
        editable: true,
        expectedValue: 50,
      },
    },
    validate: (cells) => ({
      ok:
        closeEnough(Math.abs(getCellValue(cells, "L7")), 201.06, 1) &&
        closeEnough(getCellValue(cells, "J7"), 50),
    }),
  },

  /** S8 periodo 1 sin préstamo — números reales (Ing 600, flujo 435) */
  s8_fce_p1: {
    id: "s8_fce_p1",
    title: "S8 — Armar flujo periodo 1 (sin deuda)",
    source: "S8 Ejerc icios financiamiento.xls → Financ, cols A–E",
    legendId: "s8_cadena_flujo",
    hint: "En S8 la dep va positiva (+400). Impuesto solo si UAI>0. Flujo = Neto + Dep + Inv + fila Préstamo.",
    tableRows: ["H10", "H11", "H12", "H13", "H14", "H15", "H16", "H17", "H8", "H9", "H18"],
    cells: {
      B10: { type: "label", concept: "Etiqueta", value: "Ingresos" },
      H10: { type: "input", concept: "Ingresos", value: "600", editable: true },
      B11: { type: "label", concept: "Etiqueta", value: "Gastos" },
      H11: { type: "input", concept: "Gastos operativos", value: "150", editable: true },
      B12: { type: "label", concept: "Etiqueta", value: "Depreciación" },
      H12: { type: "input", concept: "Depreciación (positiva en S8)", value: "400", editable: true },
      B13: { type: "label", concept: "Etiqueta", value: "UAII" },
      H13: {
        type: "formula",
        concept: "UAII",
        formulaRaw: "",
        expectedFormula: "=H10-H11-H12",
        excelRef: "Ing − Gastos − Dep",
        editable: true,
        expectedValue: 50,
      },
      B14: { type: "label", concept: "Etiqueta", value: "Intereses" },
      H14: { type: "input", concept: "Intereses (0 sin deuda)", value: "0", editable: true },
      B15: { type: "label", concept: "Etiqueta", value: "UAI" },
      H15: {
        type: "formula",
        concept: "UAI",
        formulaRaw: "",
        expectedFormula: "=H13-H14",
        excelRef: "UAII − Intereses",
        editable: true,
        expectedValue: 50,
      },
      B16: { type: "label", concept: "Etiqueta", value: "Impuesto 30%" },
      H16: {
        type: "formula",
        concept: "Impuesto (solo si UAI>0)",
        formulaRaw: "",
        expectedFormula: "=IF(H15<=0,0,H15*0.3)",
        excelRef: "S8: 30% de UAI si es positiva",
        editable: true,
        expectedValue: 15,
      },
      B17: { type: "label", concept: "Etiqueta", value: "Utilidad neta" },
      H17: {
        type: "formula",
        concept: "Neto",
        formulaRaw: "",
        expectedFormula: "=H15-H16",
        excelRef: "UAI − Impuesto",
        editable: true,
        expectedValue: 35,
      },
      B8: { type: "label", concept: "Etiqueta", value: "Inversión del periodo" },
      H8: { type: "input", concept: "Inversión (0 en año 1)", value: "0", editable: true },
      B9: { type: "label", concept: "Etiqueta", value: "Fila préstamo" },
      H9: { type: "input", concept: "Préstamo (0 sin deuda)", value: "0", editable: true },
      B18: { type: "label", concept: "Etiqueta", value: "Flujo de fondos" },
      H18: {
        type: "formula",
        concept: "Flujo de fondos del periodo",
        formulaRaw: "",
        expectedFormula: "=H17+H12+H8+H9",
        excelRef: "Neto + Dep + Inv + Préstamo",
        editable: true,
        expectedValue: 435,
      },
    },
    validate: (cells) => ({
      ok:
        closeEnough(getCellValue(cells, "H13"), 50) &&
        closeEnough(getCellValue(cells, "H18"), 435),
    }),
  },

  /** S8 periodo 1 con préstamo 500 — flujo 248.94 */
  s8_fcf_p1: {
    id: "s8_fcf_p1",
    title: "S8 — Flujo periodo 1 (con préstamo)",
    source: "S8 → Financ cols H–L, préstamo 500 al 10%",
    legendId: "s8_cadena_flujo",
    hint: "Con deuda: intereses bajan UAI. En fila Préstamo va la amortización (−151,06), no la cuota completa.",
    tableRows: ["H10", "H11", "H12", "H13", "H14", "H15", "H16", "H17", "H8", "H9", "H18"],
    cells: {
      B10: { type: "label", concept: "Etiqueta", value: "Ingresos" },
      H10: { type: "input", concept: "Ingresos", value: "600", editable: true },
      B11: { type: "label", concept: "Etiqueta", value: "Gastos" },
      H11: { type: "input", concept: "Gastos", value: "150", editable: true },
      B12: { type: "label", concept: "Etiqueta", value: "Depreciación" },
      H12: { type: "input", concept: "Depreciación", value: "400", editable: true },
      B13: { type: "label", concept: "Etiqueta", value: "UAII" },
      H13: {
        type: "formula",
        concept: "UAII",
        formulaRaw: "",
        expectedFormula: "=H10-H11-H12",
        editable: true,
        expectedValue: 50,
      },
      B14: { type: "label", concept: "Etiqueta", value: "Intereses P1" },
      H14: { type: "input", concept: "Intereses = 500 × 10%", value: "50", editable: true, excelRef: "De la tabla amortización" },
      B15: { type: "label", concept: "Etiqueta", value: "UAI" },
      H15: {
        type: "formula",
        concept: "UAI",
        formulaRaw: "",
        expectedFormula: "=H13-H14",
        editable: true,
        expectedValue: 0,
      },
      B16: { type: "label", concept: "Etiqueta", value: "Impuesto" },
      H16: {
        type: "formula",
        concept: "Impuesto",
        formulaRaw: "",
        expectedFormula: "=IF(H15<=0,0,H15*0.3)",
        editable: true,
        expectedValue: 0,
      },
      B17: { type: "label", concept: "Etiqueta", value: "Neto" },
      H17: {
        type: "formula",
        concept: "Neto",
        formulaRaw: "",
        expectedFormula: "=H15-H16",
        editable: true,
        expectedValue: 0,
      },
      B8: { type: "label", concept: "Etiqueta", value: "Inversión" },
      H8: { type: "input", concept: "Inversión periodo", value: "0", editable: true },
      B9: { type: "label", concept: "Etiqueta", value: "Préstamo (amort. P1)" },
      H9: { type: "input", concept: "Amortización periodo 1 (negativa)", value: "-151.06", editable: true, excelRef: "Fila Préstamo en S8" },
      B18: { type: "label", concept: "Etiqueta", value: "Flujo de fondos" },
      H18: {
        type: "formula",
        concept: "Flujo de fondos",
        formulaRaw: "",
        expectedFormula: "=H17+H12+H8+H9",
        excelRef: "0 + 400 + 0 − 151,06 = 248,94",
        editable: true,
        expectedValue: 248.94,
      },
    },
    validate: (cells) => ({
      ok:
        closeEnough(getCellValue(cells, "H15"), 0) &&
        closeEnough(getCellValue(cells, "H18"), 248.94, 1),
    }),
  },

  /** Tabla flujos P0–P3 + VANF (con préstamo) */
  s8_flujos_vanf: {
    id: "s8_flujos_vanf",
    title: "S8 — Todos los periodos y VANF",
    source: "S8 → Financ con préstamo 500",
    legendId: "s8_flujos_tabla",
    hint: "Primero arma cada flujo por periodo (pasos anteriores). Aquí: Vaf=VNA(P1..P3), VANF=Vaf+P0.",
    cells: {
      B5: { type: "label", concept: "COK", value: "k" },
      C5: { type: "input", concept: "Tasa de descuento", value: "0.12", editable: true },
      B6: { type: "label", concept: "P0", value: "Flujo periodo 0" },
      C6: { type: "input", concept: "P0 = Inv + Préstamo recibido", value: "-740", editable: true, excelRef: "−1240 + 500" },
      B7: { type: "label", concept: "P1", value: "Flujo 1" },
      D16: { type: "input", concept: "Flujo periodo 1", value: "248.94", editable: true },
      B8: { type: "label", concept: "P2", value: "Flujo 2" },
      E16: { type: "input", concept: "Flujo periodo 2", value: "384.41", editable: true },
      B9: { type: "label", concept: "P3", value: "Flujo 3" },
      F16: { type: "input", concept: "Flujo periodo 3 (+ VR 40)", value: "384.43", editable: true },
      B11: { type: "label", concept: "Vaf", value: "Vaf" },
      C17: {
        type: "formula",
        concept: "Vaf",
        formulaRaw: "",
        expectedFormula: "=VNA(C5,D16:F16)",
        editable: true,
        expectedValue: 802.35,
      },
      B12: { type: "label", concept: "VANF", value: "VANF" },
      C18: {
        type: "formula",
        concept: "VANF",
        formulaRaw: "",
        expectedFormula: "=C17+C6",
        editable: true,
        expectedValue: 62.35,
      },
    },
    validate: (cells) => ({
      ok:
        closeEnough(getCellValue(cells, "C17"), 802.35, 2) &&
        closeEnough(getCellValue(cells, "C18"), 62.35, 2),
    }),
  },

  /** Caso base sin préstamo — VANE */
  s8_vane_resumen: {
    id: "s8_vane_resumen",
    title: "S8 — Flujos y VANE (sin deuda)",
    source: "S8 → Financ cols A–E",
    legendId: "s8_flujos_tabla",
    hint: "Mismos pasos por periodo pero sin intereses ni fila préstamo. P0 = −1240.",
    cells: {
      B5: { type: "label", concept: "COK", value: "k" },
      C5: { type: "input", concept: "Tasa", value: "0.12", editable: true },
      B6: { type: "label", concept: "P0", value: "Inversión" },
      C6: { type: "input", concept: "Flujo periodo 0", value: "-1240", editable: true },
      B7: { type: "label", concept: "P1", value: "Flujo 1" },
      D16: { type: "input", concept: "Flujo 1 (del paso periodo 1)", value: "435", editable: true },
      B8: { type: "label", concept: "P2", value: "Flujo 2" },
      E16: { type: "input", concept: "Flujo 2", value: "575", editable: true },
      B9: { type: "label", concept: "P3", value: "Flujo 3" },
      F16: { type: "input", concept: "Flujo 3 (+ VR)", value: "580", editable: true },
      B11: { type: "label", concept: "Vaf", value: "Vaf" },
      C17: {
        type: "formula",
        concept: "Vaf",
        formulaRaw: "",
        expectedFormula: "=VNA(C5,D16:F16)",
        editable: true,
        expectedValue: 1259.61,
      },
      B12: { type: "label", concept: "VANE", value: "VANE" },
      C18: {
        type: "formula",
        concept: "VANE",
        formulaRaw: "",
        expectedFormula: "=C17+C6",
        editable: true,
        expectedValue: 19.61,
      },
    },
    validate: (cells) => ({
      ok:
        closeEnough(getCellValue(cells, "C17"), 1259.61, 2) &&
        closeEnough(getCellValue(cells, "C18"), 19.61, 2),
    }),
  },
};

export function getGridSheet(id) {
  return GRID_SHEETS[id] || null;
}

export function cloneSheetCells(sheet) {
  const cells = {};
  for (const [id, c] of Object.entries(sheet.cells)) {
    cells[id.toUpperCase()] = { ...c, id: id.toUpperCase() };
  }
  return cells;
}

let insertRefCallback = null;

const GRID_ONBOARD_KEY = "beg06_grid_onboarded";

function maybeShowGridOnboarding(container) {
  if (localStorage.getItem(GRID_ONBOARD_KEY)) return;
  const sheet = container.querySelector(".grid-sheet");
  if (!sheet) return;

  const overlay = document.createElement("div");
  overlay.className = "grid-onboard";
  overlay.innerHTML = `
    <div class="grid-onboard-card">
      <h3>Como usar la hoja</h3>
      <ol>
        <li>Toca una fila <strong>morada</strong> (celda de formula).</li>
        <li>Aparece la barra abajo: escribe <code>=</code> o dejala.</li>
        <li>Toca otras celdas (D6, I5…) para insertar referencias.</li>
        <li>Pulsa ✓ y luego <strong>Validar y continuar</strong>.</li>
      </ol>
      <button type="button" class="btn-primary grid-onboard-dismiss">Entendido</button>
    </div>`;
  sheet.appendChild(overlay);
  overlay.querySelector(".grid-onboard-dismiss").onclick = () => {
    localStorage.setItem(GRID_ONBOARD_KEY, "1");
    overlay.remove();
  };
}

export function mountFormulaGrid(container, sheetId, progress = null) {
  const sheet = GRID_SHEETS[sheetId];
  if (!sheet) {
    container.innerHTML = "<p>Hoja no encontrada</p>";
    return null;
  }

  const state = { cells: cloneSheetCells(sheet), sheetId, activeCell: null };

  container.innerHTML = `
    <div class="grid-sheet">
      <p class="source-tag">📎 ${sheet.source}</p>
      ${sheet.legendId ? renderCellLegendHtml(sheet.legendId) : ""}
      <p class="grid-hint">💡 ${sheet.hint || ""}</p>
      ${progress ? renderUnlockedChipsHtml(progress) : ""}
      <div class="grid-wrap"></div>
      <div class="formula-bar" id="formula-bar">
        <span class="fb-addr" id="fb-addr">—</span>
        <input type="text" id="fb-input" class="fb-input" placeholder="=I5-L6…" autocomplete="off" autocapitalize="off" spellcheck="false"/>
        <button type="button" id="fb-ok" class="fb-btn">✓</button>
      </div>
      <div class="validation-msg" id="grid-validation"></div>
    </div>`;

  const wrap = container.querySelector(".grid-wrap");
  const fb = container.querySelector("#formula-bar");
  const fbAddr = container.querySelector("#fb-addr");
  const fbInput = container.querySelector("#fb-input");

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function renderGrid() {
    recalcAll(state.cells);
    const ordered = sheet.tableRows
      ? sheet.tableRows
          .map((id) => [id.toUpperCase(), state.cells[id.toUpperCase()]])
          .filter(([, c]) => c && !c.hidden)
      : Object.entries(state.cells)
          .filter(([, c]) => !c.hidden && c.type !== "label")
          .sort(([a], [b]) => {
            const pa = /^([A-Z]+)(\d+)$/i.exec(a);
            const pb = /^([A-Z]+)(\d+)$/i.exec(b);
            if (!pa || !pb) return a.localeCompare(b);
            const ra = parseInt(pa[2], 10);
            const rb = parseInt(pb[2], 10);
            return ra - rb || pa[1].localeCompare(pb[1]);
          });

    const twoCol = !!sheet.tableRows;
    const head = twoCol
      ? `<thead><tr><th>Concepto</th><th>Valor</th></tr></thead>`
      : `<thead><tr><th>Qué es</th><th>Celda</th><th>Valor / Fórmula</th></tr></thead>`;

    wrap.innerHTML = `<table class="grid-table ${twoCol ? "sheet-table" : ""}">${head}<tbody>
      ${ordered
        .map(([id, cell]) => {
          const active = state.activeCell === id;
          const isF = cell.type === "formula";
          const isIn = cell.type === "input";
          const concept = cell.concept || cell.label || cell.value || "";
          const result =
            isF && cell.formulaRaw ? round2(cell.computed) : cell.value ?? "";

          const valueCell = `<td class="grid-cell ${cell.type} ${active ? "active" : ""}" data-id="${id}" data-ed="${cell.editable ? "1" : "0"}">
              ${
                isIn
                  ? `<input class="grid-input" data-id="${id}" value="${esc(cell.value)}"/>`
                  : isF
                    ? `<div class="grid-formula-box">
                        ${cell.formulaRaw ? `<code>${esc(cell.formulaRaw)}</code>` : "<em class='tap-hint'>Toca para fórmula</em>"}
                        <strong class="grid-result">${result !== "" ? result : "—"}</strong>
                       </div>`
                    : `<span>${esc(cell.value ?? "")}</span>`
              }
              ${cell.excelRef ? `<small class="excel-ref-hint">${esc(cell.excelRef)}</small>` : ""}
            </td>`;

          if (twoCol) {
            return `<tr class="${active ? "active-row" : ""}">
            <td class="grid-label"><strong>${esc(concept)}</strong></td>
            ${valueCell}
          </tr>`;
          }

          return `<tr class="${active ? "active-row" : ""}">
            <td class="grid-label"><strong>${esc(concept)}</strong></td>
            <td class="grid-addr"><button type="button" class="addr-btn" data-ref="${id}">${id}</button></td>
            ${valueCell}
          </tr>`;
        })
        .join("")}
    </tbody></table>`;

    bindEvents();
    bindSkillChips();
  }

  function bindSkillChips() {
    container.querySelectorAll(".skill-chip").forEach((btn) => {
      btn.onclick = () => {
        if (!state.activeCell) {
          const first = sheet.tableRows?.find((id) => state.cells[id.toUpperCase()]?.type === "formula");
          if (first) startEdit(first.toUpperCase());
        }
        if (!state.activeCell) return;
        fbInput.value = btn.dataset.formula;
        fbInput.focus();
      };
    });
  }

  function startEdit(id) {
    const cell = state.cells[id];
    if (!cell?.editable) return;
    state.activeCell = id;
    insertRefCallback = (ref) => {
      if (ref === id) return;
      const pos = fbInput.selectionStart ?? fbInput.value.length;
      const v = fbInput.value;
      fbInput.value = v.slice(0, pos) + ref + v.slice(pos);
      fbInput.focus();
    };
    fb.classList.add("visible");
    fbAddr.textContent = id;
    fbInput.value =
      cell.formulaRaw || (cell.type === "input" ? String(cell.value) : "=");
    fbInput.focus();
    renderGrid();
  }

  function commitEdit() {
    if (!state.activeCell) return;
    const id = state.activeCell;
    const cell = state.cells[id];
    let raw = fbInput.value.trim();
    if (cell.type === "formula" && raw && !raw.startsWith("=")) raw = "=" + raw;
    if (cell.type === "formula") cell.formulaRaw = raw;
    else cell.value = raw;
    state.activeCell = null;
    insertRefCallback = null;
    fb.classList.remove("visible");
    recalcAll(state.cells);
    renderGrid();
  }

  function bindEvents() {
    wrap.querySelectorAll(".grid-cell[data-ed='1']").forEach((el) => {
      el.onclick = () => {
        const id = el.dataset.id;
        if (state.activeCell && state.activeCell !== id && insertRefCallback) {
          insertRefCallback(id);
          return;
        }
        startEdit(id);
      };
    });
    wrap.querySelectorAll(".grid-input").forEach((inp) => {
      inp.onchange = () => {
        state.cells[inp.dataset.id].value = inp.value;
        recalcAll(state.cells);
        renderGrid();
      };
      inp.onclick = (e) => {
        if (insertRefCallback) {
          e.stopPropagation();
          insertRefCallback(inp.dataset.id);
        }
      };
    });
    wrap.querySelectorAll(".addr-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (insertRefCallback) insertRefCallback(btn.dataset.ref);
      };
    });
  }

  container.querySelector("#fb-ok").onclick = commitEdit;
  container.querySelector("#fb-input").onkeydown = (e) => {
    if (e.key === "Enter") commitEdit();
  };

  renderGrid();
  maybeShowGridOnboarding(container);

  return {
    validate() {
      recalcAll(state.cells);
      const base = sheet.validate(state.cells);
      const checks = Object.entries(state.cells)
        .filter(([, c]) => c.type === "formula" && c.expectedFormula)
        .map(([id, c]) => ({
          id,
          ok:
            formulasMatch(c.formulaRaw, c.expectedFormula) ||
            closeEnough(c.computed, c.expectedValue, 2),
          got: c.formulaRaw,
          want: c.expectedFormula,
          exp: c.expectedValue,
          val: c.computed,
        }));
      const ok = base.ok && checks.every((x) => x.ok);
      const box = container.querySelector("#grid-validation");
      box.className = "validation-msg " + (ok ? "ok" : "err");
      box.innerHTML = ok
        ? "✓ Fórmulas con referencias correctas — igual que Excel."
        : `<ul class="err-list">${checks
            .filter((x) => !x.ok)
            .map(
              (x) =>
                `<li><strong>${x.id}</strong>: tienes <code>${esc(x.got || "vacío")}</code> → usa <code>${esc(x.want)}</code> (≈${x.exp}, obtuviste ${round2(x.val)})</li>`
            )
            .join("")}</ul>`;
      return ok;
    },
  };
}
