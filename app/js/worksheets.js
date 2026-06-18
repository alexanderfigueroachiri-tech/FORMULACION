/**
 * Hojas de práctica — fórmulas idénticas a S6, S7, S8.
 * Fuente: data/excel_formulas_exact.json (generado desde BASE/)
 */
import {
  computeSheetS6FCE,
  computeSheetS8Case,
  computeSheetS6Tasas,
  computeSheetS7Indicators,
  buildAmortizationTable,
  excelVAN,
  excelIRR,
  round,
  closeEnough,
} from "./excelModel.js";

/** Valores esperados extraídos de los Excel reales */
export const EXCEL_REFERENCE = {
  S8_base: { vaf: 1259.61, vane: 19.61, tire: 0.1287, flows: [-1240, 435, 575, 580] },
  S8_loan500: { vaf: 802.35, vanf: 62.35, tirf: 0.165, flows: [-740, 248.94, 384.41, 384.43] },
  S8_amort500: { cuota: 201.06, intP1: 50, amortP1: 151.06 },
};

export const WORKSHEETS = {
  s6_fce: {
    id: "s6_fce",
    title: "S6 — Hoja FCE (flujo económico)",
    source: "S6 Flujo basico FCE y FCF.xlsx → FCE",
    description: "Réplica exacta: UAII, UAI, impuesto =-0.3*UAI, f = UN-D8+D5, Vaf-I",
    getExpected() {
      return computeSheetS6FCE({
        k: 0.12,
        ingresos: [0, 0, 0],
        egresos: [-100, -200, -200],
      });
    },
    practiceCells: [
      { id: "uaii_p1", label: "UAII P1 (D9)", formula: "=+D6+D7+D8", period: 1, field: "uaii" },
      { id: "imp_p1", label: "I 30% UAI P1 (D12)", formula: "=-0.3*D11", period: 1, field: "impuesto" },
      { id: "f_p1", label: "f P1 (D14)", formula: "=+D13-D8+D5", period: 1, field: "f" },
      { id: "vaf", label: "Vaf total (C16)", formula: "=+D16+E16+F16", field: "vafTotal" },
      { id: "van", label: "Vaf-I / VAN (C17)", formula: "=+C16+C14", field: "van" },
    ],
  },

  s8_fce: {
    id: "s8_fce",
    title: "S8 — Caso base sin préstamo",
    source: "S8 Ejerc icios financiamiento.xls → Financ (cols A-E)",
    description: "Inversión 1240, COK 12%, ingresos 600/900/800, gastos 150/250/200, dep 400",
    getExpected() {
      return computeSheetS8Case({ cok: 0.12, prestamo: 0 });
    },
    inputs: [
      { id: "inv", label: "Inversión P0", value: -1240 },
      { id: "cok", label: "COK", value: "12%" },
      { id: "ing", label: "Ingresos P1-P3", value: "600 / 900 / 800" },
      { id: "gas", label: "Gastos P1-P3", value: "150 / 250 / 200" },
      { id: "dep", label: "Depreciación anual", value: 400 },
    ],
    practiceCells: [
      { id: "uaii1", label: "UAII P1", formula: "= Ing - Gastos - Dep", period: 1, field: "uaii", col: "cols" },
      { id: "neto1", label: "Neto P1", formula: "= UAI - Impuestos", period: 1, field: "neto", col: "cols" },
      { id: "ff1", label: "Flujo fondos P1", formula: "= Neto + Dep", period: 1, field: "flujoFondos", col: "cols" },
      { id: "vaf", label: "Vaf (B19)", formula: "=NPV(COK, P1:Pn)", field: "vaf" },
      { id: "vane", label: "VANE (B20)", formula: "= Vaf + Flujo_P0", field: "van" },
    ],
  },

  s8_fcf: {
    id: "s8_fcf",
    title: "S8 — Con préstamo 500 al 10%",
    source: "S8 Ejerc icios financiamiento.xls → Financ (cols H-L)",
    description: "Misma operación + financiamiento. VANF y TIRF.",
    getExpected() {
      return computeSheetS8Case({ cok: 0.12, prestamo: 500, iLoan: 0.1 });
    },
    inputs: [
      { id: "inv", label: "Inversión P0", value: -1240 },
      { id: "prest", label: "Préstamo P0", value: 500 },
      { id: "iloan", label: "Tasa préstamo", value: "10%" },
      { id: "cok", label: "COK", value: "12%" },
    ],
    practiceCells: [
      { id: "ff0", label: "Flujo fondos P0", formula: "= Inversion + Prestamo", period: 0, field: "flujoFondos", col: "cols" },
      { id: "int1", label: "Intereses P1", formula: "= Saldo × i", period: 1, field: "intereses", col: "cols" },
      { id: "cuota", label: "Cuota (PMT)", formula: "=-PMT(10%,3,500)", field: "cuota" },
      { id: "vanf", label: "VANF (I20)", formula: "= Vaf + Flujo_P0", field: "van" },
      { id: "tirf", label: "TIRF (K19)", formula: "=IRR(flujos)", field: "tir", tolerance: 0.02 },
    ],
  },

  s8_amort: {
    id: "s8_amort",
    title: "S8 — Tabla amortización (filas 48-52)",
    source: "S8 Ejerc icios financiamiento.xls",
    description: "Préstamo 500, i=10%, 3 periodos",
    getExpected() {
      return buildAmortizationTable(500, 0.1, 3);
    },
    practiceCells: [
      { id: "cuota", label: "Cuota (L7)", formula: "=-PMT(i,n,500)", path: "cuota" },
      { id: "int1", label: "Interes P1 (J7)", formula: "= I6*I4", path: "rows.0.interes" },
      { id: "amort1", label: "Amort P1 (K7)", formula: "= Cuota - Interes", path: "rows.0.amortizac" },
    ],
  },

  s6_tasas: {
    id: "s6_tasas",
    title: "S6 — Hoja Tasas (CAPM)",
    source: "S6 → Tasas; FCE C2 = Tasas!D8",
    description: "Rf, prima de mercado, beta y riesgo país → Ke en D8",
    getExpected() {
      return computeSheetS6Tasas(0.0315, 0.0307, 1.4, 0.0255);
    },
    practiceCells: [
      { id: "ke", label: "Ke (D8)", formula: "=D3+D5*D4+D6", field: "ke" },
    ],
    inputs: [
      { id: "rf", label: "Rf (D3)", value: 0.0315 },
      { id: "rmrf", label: "(Rm-Rf) (D4)", value: 0.0307 },
      { id: "beta", label: "Beta (D5)", value: 1.4 },
      { id: "rp", label: "Riesgo país (D6)", value: 0.0255 },
    ],
  },

  s7_van: {
    id: "s7_van",
    title: "S7 — Vaf y VAN (Nuevo o usado)",
    source: "S7 → Nuevo o usado: C17=NPV, C18=C17+C16",
    description: "Patrón usado en Eólico, Telecom, etc.",
    rate: 0.12,
    flowP0: -1240,
    flowsP1: [435, 575, 580],
    getExpected() {
      return computeSheetS7Indicators(0.12, [435, 575, 580], -1240, null);
    },
    practiceCells: [
      { id: "vaf", label: "Vaf", formula: "=NPV(12%, D16:G16)", field: "vaf" },
      { id: "van", label: "VAN", formula: "=+C17+C16", field: "van" },
    ],
  },

  s7_van_tir: {
    id: "s7_van_tir",
    title: "S7 — VAN + TIR (patrón Eólico)",
    source: "S7 → Eolico: B26=NPV, B27=+B26+B24, B28=IRR",
    description: "Flujos S8 de referencia con COK 12%",
    rate: 0.12,
    flows: [-1240, 435, 575, 580],
    inputs: [
      { id: "cok", label: "COK (C10)", value: "12%" },
      { id: "p0", label: "Flujo P0 (B24)", value: -1240 },
      { id: "flows", label: "Flujos P1-P3", value: "435 / 575 / 580" },
    ],
    practiceCells: [
      { id: "vaf", label: "Vaf (B26)", formula: "=NPV(C10,C24:V24)", get: () => round(excelVAN(0.12, [-1240, 435, 575, 580]) - (-1240 + 435 / 1.12 + 575 / 1.12 ** 2 + 580 / 1.12 ** 3) + (435 / 1.12 + 575 / 1.12 ** 2 + 580 / 1.12 ** 3)) },
      { id: "van", label: "VAN (B27)", formula: "=+B26+B24", get: () => excelVAN(0.12, [-1240, 435, 575, 580]) },
      { id: "tir", label: "TIR (B28)", formula: "=IRR(B24:V24)", get: () => round(excelIRR([-1240, 435, 575, 580]), 4), tolerance: 0.02 },
    ],
  },
};

// Fix s7_van_tir vaf getter - use excelVafFromFlows
import { excelVafFromFlows } from "./excelModel.js";
WORKSHEETS.s7_van_tir.practiceCells[0].get = () =>
  excelVafFromFlows(0.12, [-1240, 435, 575, 580]);

export function getWorksheet(id) {
  return WORKSHEETS[id] || null;
}

export function resolveExpected(ws, expected, cell) {
  if (cell.get) return cell.get();
  if (cell.path) {
    return cell.path.split(".").reduce((o, k) => o?.[k], expected);
  }
  if (cell.field && cell.period != null && expected.cols) {
    return expected.cols[cell.period][cell.field];
  }
  if (cell.field) return expected[cell.field];
  return undefined;
}

export function validateWorksheet(wsId, answers) {
  const ws = WORKSHEETS[wsId];
  if (!ws) return { ok: false, msg: "Hoja no encontrada" };
  const expected = ws.getExpected ? ws.getExpected() : null;
  const results = [];

  for (const cell of ws.practiceCells) {
    const exp = cell.get
      ? cell.get()
      : expected
        ? resolveExpected(ws, expected, cell)
        : undefined;
    const ans = parseFloat(answers[cell.id]);
    const tol = cell.tolerance ?? 2;
    const ok = closeEnough(ans, exp, tol);
    results.push({ ...cell, expected: exp, ok, answer: ans });
  }

  const allOk = results.every((r) => r.ok);
  return {
    ok: allOk,
    results,
    msg: allOk
      ? "✓ Idéntico a los valores del Excel del curso."
      : results
          .filter((r) => !r.ok)
          .map((r) => `${r.label}: esperado ${r.expected} (${r.formula})`)
          .join(" · "),
  };
}

export function getPracticeIdsForModule(moduleId) {
  const map = {
    "m1-depreciacion": ["s6_fce"],
    "m2-fce": ["s6_fce", "s8_fce"],
    "m3-tasas": ["s6_tasas"],
    "m4-van-tir": ["s7_van", "s7_van_tir"],
    "m5-financiamiento": ["s8_amort", "s8_fcf"],
    "m6-escenarios": ["s8_fce", "s8_fcf"],
    "m7-integrador": ["s8_fcf", "s7_van_tir"],
  };
  return map[moduleId] || ["s8_fce"];
}
