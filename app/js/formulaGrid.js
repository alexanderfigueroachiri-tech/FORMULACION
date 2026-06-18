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

  fce_cadena_s6: {
    id: "fce_cadena_s6",
    title: "Flujo de caja económico — periodo 1",
    source: "S6 → hoja FCE, columna D (año 1)",
    legendId: "fce_cadena_s6",
    hint: "Lee la leyenda abajo. UAII = Ingresos + Egresos + Dep. D5=0 en periodo 1. El flujo f suma la dep de vuelta.",
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
    hint: "Vaf = NPV solo flujos futuros. VAN = Vaf + inversion inicial (C6).",
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
        expectedFormula: "=NPV(C5,D16:F16)",
        excelRef: "NPV(k, P1:P3) sin periodo 0",
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
    hint: "Interés = saldo × tasa. Cuota = PMT(tasa, plazo, monto).",
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
        expectedFormula: "=PMT(I4,N6,I6)",
        excelRef: "PMT(tasa, plazo, prestamo)",
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
