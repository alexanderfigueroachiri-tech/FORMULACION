/**
 * Mapas legibles: primero el CONCEPTO, luego la celda Excel entre paréntesis.
 */
export const CELL_LEGENDS = {
  depreciacion_s6: {
    title: "Datos que necesitas (ejemplo del curso)",
    file: "Referencia Excel opcional — S6, hoja FCE",
    rows: [
      { cell: "I5", concept: "Capital invertido en el activo", example: "1240" },
      { cell: "L6", concept: "Valor residual (VR) al terminar la vida útil", example: "40" },
      { cell: "B8", concept: "Vida útil en años", example: "3" },
      { cell: "J6", concept: "Depreciación anual", formula: "(Capital − VR) ÷ Vida" },
      { cell: "D8", concept: "Dep en el flujo económico (negativa: no es desembolso)", formula: "− Dep anual" },
    ],
  },
  s6_tasas: {
    title: "Hoja Tasas — CAPM (S6)",
    file: "S6 → hoja Tasas; FCE usa C2 = Tasas!D8",
    rows: [
      { cell: "D3", concept: "Rf — tasa libre de riesgo", example: "0,0315" },
      { cell: "D4", concept: "Prima de mercado (Rm − Rf)", example: "0,0307" },
      { cell: "D5", concept: "Beta (β) del proyecto", example: "1,4" },
      { cell: "D6", concept: "Riesgo país (rp)", example: "0,0255" },
      { cell: "D8", concept: "Ke — costo del capital propio", formula: "Rf + β × (Rm−Rf) + rp" },
    ],
  },
  fce_cadena_s6: {
    title: "Un periodo del flujo económico (año 1, ejemplo)",
    file: "Referencia Excel opcional — S6, hoja FCE",
    rows: [
      { cell: "D6", concept: "Ingresos", example: "500" },
      { cell: "D7", concept: "Egresos operativos (con signo −)", example: "−100" },
      { cell: "D8", concept: "Depreciación (negativa: reduce utilidad, no es caja)", example: "−400" },
      { cell: "D9", concept: "UAII — utilidad antes de intereses e impuestos", formula: "Ing + Egr + Dep" },
      { cell: "D10", concept: "Intereses (0 si no hay deuda)", example: "0" },
      { cell: "D11", concept: "UAI — utilidad antes de impuestos", formula: "UAII + Intereses" },
      { cell: "D12", concept: "Impuesto 30% sobre UAI", formula: "−0,3 × UAI" },
      { cell: "D13", concept: "UN — utilidad neta", formula: "UAI + Impuesto" },
      { cell: "D5", concept: "Inversión en este periodo (0 en año 1)", example: "0" },
      { cell: "D14", concept: "f — flujo de fondos del periodo", formula: "UN − Dep + Inv período" },
    ],
  },
  van_s7: {
    title: "Vaf y VAN — patrón S7",
    file: "S7 → hoja Nuevo o usado",
    rows: [
      { cell: "C5", concept: "Tasa de descuento (k / COK)", example: "12%" },
      { cell: "C6", concept: "Flujo periodo 0 (inversión inicial, negativo)", example: "−1240" },
      { cell: "D16", concept: "Flujo periodo 1", example: "435" },
      { cell: "E16", concept: "Flujo periodo 2", example: "575" },
      { cell: "F16", concept: "Flujo periodo 3", example: "580" },
      { cell: "C17", concept: "Vaf — valor actual de flujos futuros", formula: "VNA(k, P1:P3) en Excel español" },
      { cell: "C18", concept: "VAN — valor actual neto", formula: "Vaf + Flujo P0" },
    ],
  },
  s8_amort_pmt: {
    title: "Préstamo y cuota — S8",
    file: "S8 Ejerc icios financiamiento.xls",
    rows: [
      { cell: "I4", concept: "Tasa de interés del crédito", example: "10%" },
      { cell: "N6", concept: "Plazo en periodos", example: "3" },
      { cell: "I6", concept: "Monto del préstamo", example: "500" },
      { cell: "L7", concept: "Cuota constante", formula: "PAGO(tasa, plazo, préstamo)" },
      { cell: "J7", concept: "Interés periodo 1", formula: "Saldo × tasa" },
    ],
  },
  s8_cadena_flujo: {
    title: "Cadena S8 — un periodo (fila a fila)",
    file: "S8 → hoja Financ (igual con o sin préstamo)",
    rows: [
      { cell: "Ing", concept: "Ingresos del periodo", example: "600" },
      { cell: "Gas", concept: "Gastos operativos", example: "150" },
      { cell: "Dep", concept: "Depreciación (positiva en S8)", example: "400" },
      { cell: "UAII", concept: "Utilidad antes de intereses e impuestos", formula: "Ing − Gastos − Dep" },
      { cell: "Int", concept: "Intereses del préstamo", example: "0 sin deuda · 50 con deuda P1" },
      { cell: "UAI", concept: "Utilidad antes de impuestos", formula: "UAII − Intereses" },
      { cell: "Imp", concept: "Impuesto 30%", formula: "Si UAI≤0 → 0; si no → 30%×UAI" },
      { cell: "Neto", concept: "Utilidad neta", formula: "UAI − Impuesto" },
      { cell: "Inv", concept: "Inversión del periodo", example: "0 en P1 · −1240 en P0 · +40 VR en P3" },
      { cell: "Prest", concept: "Fila préstamo", example: "+500 en P0 · −amort en P1…" },
      { cell: "FF", concept: "Flujo de fondos", formula: "Neto + Dep + Inv + Préstamo" },
    ],
  },
  s8_flujos_tabla: {
    title: "Flujos por periodo — caso S8 completo",
    file: "S8 Ejerc icios financiamiento.xls",
    rows: [
      { cell: "P0", concept: "Sin deuda: solo inversión", example: "−1240" },
      { cell: "P0", concept: "Con préstamo 500", example: "−740 (= −1240 + 500)" },
      { cell: "P1", concept: "Sin deuda (del paso periodo 1)", example: "435" },
      { cell: "P1", concept: "Con préstamo", example: "248,94" },
      { cell: "P2", concept: "Con préstamo", example: "384,41" },
      { cell: "P3", concept: "Con préstamo (+ VR 40)", example: "384,43" },
      { cell: "Vaf", concept: "Valor actual flujos futuros", formula: "VNA(k, P1:P3)" },
      { cell: "VAN", concept: "VANE o VANF", formula: "Vaf + P0" },
    ],
  },
};

export function renderCellLegendHtml(legendId) {
  const leg = CELL_LEGENDS[legendId];
  if (!leg) return "";
  return `
    <div class="cell-legend">
      <h4>${leg.title}</h4>
      <p class="legend-file">📂 ${leg.file}</p>
      <table class="legend-table">
        <thead><tr><th>Qué es</th><th>Celda Excel</th><th>Valor / fórmula</th></tr></thead>
        <tbody>
          ${leg.rows
            .map(
              (r) => `<tr>
                <td><strong>${r.concept}</strong></td>
                <td><code>${r.cell}</code></td>
                <td>${r.formula ? `<em>${r.formula}</em>` : r.example ?? ""}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

export function renderHumanTips(tips) {
  if (!tips?.length) return "";
  return `<aside class="coach-tips human-tips">${tips
    .map((t) => {
      const tip = typeof t === "string" ? { human: t } : t;
      const ref = tip.formula || tip.excel;
      const formula = ref
        ? `<span class="tip-formula">${tip.formula ? "Fórmula" : "Excel"}: <em>${ref}</em></span>`
        : "";
      return `<p>💡 ${tip.human}${formula ? `<br/>${formula}` : ""}</p>`;
    })
    .join("")}</aside>`;
}
