/**
 * Adaptador del curso BEG06 (Formulación y Evaluación de Proyectos).
 * Envuelve los módulos existentes (worksheets, formulaGrid, cellLegend, skills)
 * SIN modificarlos, exponiéndolos a través del contrato de curso genérico.
 */
import { WORKSHEETS, validateWorksheet } from "../worksheets.js";
import { mountFormulaGrid, GRID_SHEETS } from "../formulaGrid.js";
import { renderCellLegendHtml } from "../cellLegend.js";
import { unlockSkillsForSheet, renderSkillsPanelHtml } from "../skills.js";

function renderExcelPractice(wsId) {
  const ws = WORKSHEETS[wsId];
  if (!ws) return `<p>Hoja ${wsId} no encontrada.</p>`;

  const expected = ws.getExpected?.();

  const inputsTable =
    ws.inputs?.length &&
    `<table class="excel-table wide inputs-table">
      <thead><tr><th>Dato del enunciado</th><th>Celda</th><th>Valor (S6/S7/S8)</th></tr></thead>
      <tbody>${ws.inputs
        .map(
          (inp) =>
            `<tr><td>${inp.label.replace(/\s*\([^)]+\)/, "")}</td><td><code>${inp.label.match(/\(([^)]+)\)/)?.[1] || "—"}</code></td><td>${inp.value}</td></tr>`
        )
        .join("")}</tbody></table>`;

  const refTable =
    expected?.cols &&
    `<details class="ref-table"><summary>Ver flujos calculados (referencia Excel)</summary>
    <table class="excel-table wide"><thead><tr><th>P</th><th>UAII</th><th>UAI</th><th>Neto</th><th>Flujo f</th></tr></thead>
    <tbody>${expected.cols.map((c) => `<tr><td>${c.periodo}</td><td>${c.uaii ?? ""}</td><td>${c.uai ?? ""}</td><td>${c.neto ?? c.un ?? ""}</td><td>${c.flujoFondos ?? c.f ?? ""}</td></tr>`).join("")}</tbody></table></details>`;

  const amortTable =
    expected?.rows &&
    `<table class="excel-table wide"><thead><tr><th>P</th><th>Capital</th><th>Interes</th><th>Amort</th><th>Cuota</th></tr></thead>
    <tbody>${expected.rows.map((r) => `<tr><td>${r.periodo}</td><td>${r.capital}</td><td>${r.interes}</td><td>${r.amortizac}</td><td>${r.cuota}</td></tr>`).join("")}</tbody></table>`;

  return `
    <div class="sheet" data-ws="${wsId}">
      <p class="source-tag">📎 ${ws.source}</p>
      <p class="sheet-desc">${ws.description || ""}</p>
      ${inputsTable || ""}
      ${refTable || ""}
      ${amortTable || ""}
      <table class="excel-table practice-table">
        <thead><tr><th>Celda / concepto</th><th>Fórmula Excel (igual al curso)</th><th>Tu resultado</th></tr></thead>
        <tbody>
          ${ws.practiceCells
            .map(
              (c) => `
            <tr>
              <td>${c.label}</td>
              <td><code class="formula-cell">${c.formula}</code></td>
              <td><input type="number" step="any" data-answer="${c.id}" class="cell-input answer" placeholder="?"/></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="validation-msg" id="validation"></div>
    </div>`;
}

function gridMount(gridId) {
  return (container, { progress }) => {
    const inst = mountFormulaGrid(container, gridId, progress);
    return {
      validate: () => (inst ? inst.validate() : false),
      afterValidate: (prog) => {
        const added = unlockSkillsForSheet(gridId, prog);
        if (!added.length) return null;
        return {
          addedHtml: `<p class="skill-unlock-msg">🎉 Desbloqueaste ${added.length} fórmula(s) nueva(s). Míralas en «Tus fórmulas» del inicio del curso.</p>`,
          boxId: "grid-validation",
        };
      },
    };
  };
}

function worksheetMount(wsId) {
  return (container) => {
    container.innerHTML = renderExcelPractice(wsId);
    return {
      validate: () => {
        const answers = {};
        container.querySelectorAll("[data-answer]").forEach((el) => {
          answers[el.dataset.answer] = el.value;
        });
        const { ok, msg, results } = validateWorksheet(wsId, answers);
        const box = container.querySelector("#validation");
        if (box) {
          box.className = "validation-msg " + (ok ? "ok" : "err");
          box.innerHTML = ok
            ? msg
            : `${msg}<ul class="err-list">${results
                .filter((r) => !r.ok)
                .map(
                  (r) =>
                    `<li>${r.label}: tu ${r.answer} → Excel ${r.expected} <code>${r.formula}</code></li>`
                )
                .join("")}</ul>`;
        }
        return ok;
      },
    };
  };
}

export default {
  id: "beg06",
  storageKey: "beg06_progress_v2",
  curriculumUrl: "./data/curriculum.json",
  hero: {
    title: "Practica como en Excel",
    subtitle: "Formulas identicas a S6, S7, S8 — validacion contra celdas reales",
  },

  renderLegend(legendId) {
    return legendId ? renderCellLegendHtml(legendId) : "";
  },

  getInteractive(step) {
    if (step.type === "grid") return gridMount(step.gridId);
    if (step.type === "practice") {
      return GRID_SHEETS[step.worksheet]
        ? gridMount(step.worksheet)
        : worksheetMount(step.worksheet);
    }
    return null;
  },

  renderHomeExtras(progress) {
    return `
      <section class="tips-panel">
        <h3>Hoja interactiva (como Excel en el móvil)</h3>
        <p class="grid-hint">Toca celda fórmula → escribe o <strong>toca otras celdas</strong> para insertar I5, D6…</p>
        <div class="grid-quick-links">
          ${Object.values(GRID_SHEETS)
            .map(
              (g) =>
                `<button type="button" class="btn-secondary grid-quick" data-grid="${g.id}">${g.title}</button>`
            )
            .join("")}
        </div>
      </section>
      <details class="tips-panel convention-later">
        <summary>Convenciones Excel (M4 en adelante)</summary>
        <ul>
          <li><strong>Vaf</strong> = <code>=VNA(k, P1:Pn)</code> en Excel español (sin periodo 0)</li>
          <li><strong>VAN / VANE / VANF</strong> = Vaf + Flujo_P0 (no uses VNA aquí)</li>
          <li class="conv-note"><em>VNA</em> es la <strong>función</strong> de Excel. <em>VAN</em> es el <strong>resultado</strong> (Vaf + inversión).</li>
          <li><strong>S6 FCE</strong>: impuesto <code>=-0.3*UAI</code>, flujo <code>=UN-D8+D5</code></li>
          <li><strong>S8</strong>: impuesto solo si UAI&gt;0, cuota <code>=-PMT(i,n,P)</code></li>
        </ul>
      </details>
      ${renderSkillsPanelHtml(progress)}`;
  },

  wireHomeExtras(root, helpers) {
    root.querySelectorAll(".grid-quick").forEach((b) => {
      b.onclick = () =>
        helpers.showStandalone(
          GRID_SHEETS[b.dataset.grid]?.title || "Hoja",
          (container, ctx) => mountFormulaGrid(container, b.dataset.grid, ctx.progress)
        );
    });
  },
};
