import { WORKSHEETS, validateWorksheet } from "./worksheets.js";
import { mountFormulaGrid, GRID_SHEETS } from "./formulaGrid.js";
import { renderHumanTips, renderCellLegendHtml } from "./cellLegend.js";
import {
  unlockSkillsForSheet,
  renderSkillsPanelHtml,
} from "./skills.js";

const STORAGE_KEY = "beg06_progress_v2";

let curriculum = null;
let state = { moduleIndex: 0, stepIndex: 0, progress: loadProgress(), gridInstance: null };

async function init() {
  curriculum = await (await fetch("./data/curriculum.json")).json();
  renderHome();
  document.getElementById("btn-home").onclick = () => renderHome();
}

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { completedSteps: p.completedSteps || [], unlockedSkills: p.unlockedSkills || [] };
  } catch {
    return { completedSteps: [], unlockedSkills: [] };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function stepKey(mIdx, sIdx) {
  return `${curriculum.modules[mIdx].id}:${sIdx}`;
}

function isStepDone(mIdx, sIdx) {
  return state.progress.completedSteps.includes(stepKey(mIdx, sIdx));
}

function markStepDone(mIdx, sIdx) {
  const k = stepKey(mIdx, sIdx);
  if (!state.progress.completedSteps.includes(k)) {
    state.progress.completedSteps.push(k);
    saveProgress();
  }
}

function totalProgress() {
  const t = curriculum.modules.reduce((a, m) => a + m.steps.length, 0);
  return t ? Math.round((state.progress.completedSteps.length / t) * 100) : 0;
}

function renderHome() {
  const main = document.getElementById("main");
  const pct = totalProgress();
  main.innerHTML = `
    <header class="hero">
      <p class="eyebrow">${curriculum.course}</p>
      <h1>Practica como en Excel</h1>
      <p class="subtitle">Formulas identicas a S6, S7, S8 — validacion contra celdas reales</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <p class="progress-text">${pct}% · ~${curriculum.estimated_hours}h</p>
    </header>
    <section class="module-list">
      ${curriculum.modules
        .map((mod, i) => {
          const done = mod.steps.filter((_, si) => isStepDone(i, si)).length;
          return `
        <article class="module-card">
          <div class="module-num">M${mod.order}</div>
          <div class="module-body">
            <h2>${mod.title}</h2>
            ${
              mod.objectives?.length
                ? `<ul class="objectives-preview">${mod.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>`
                : ""
            }
            <p class="meta">${mod.duration_min} min · ${done}/${mod.steps.length}</p>
          </div>
          <button class="btn-start" data-start="${i}">Continuar →</button>
        </article>`;
        })
        .join("")}
    </section>
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
    ${renderSkillsPanelHtml(state.progress)}`;
  main.querySelectorAll("[data-start]").forEach((b) => {
    b.onclick = () => {
      const mi = +b.dataset.start;
      const mod = curriculum.modules[mi];
      state.moduleIndex = mi;
      const first = mod.steps.findIndex((_, si) => !isStepDone(mi, si));
      state.stepIndex = first >= 0 ? first : 0;
      renderStep();
    };
  });
  main.querySelectorAll(".grid-quick").forEach((b) => {
    b.onclick = () => renderStandaloneGrid(b.dataset.grid);
  });
}

function renderStep() {
  const mod = curriculum.modules[state.moduleIndex];
  const step = mod.steps[state.stepIndex];
  const main = document.getElementById("main");

  let body = "";
  if (step.type === "concept") {
    body = `<div class="concept-card"><h3>${step.title}</h3><p>${step.body}</p></div>`;
    if (step.legendId) body += renderCellLegendHtml(step.legendId);
  } else if (step.type === "formula") {
    body = `<div class="formula-card"><h3>${step.title}</h3>
      <div class="formula-math">${step.formula}</div>
      ${step.excel_note ? `<p class="formula-note">${step.excel_note}</p>` : ""}
      ${
        step.excel_equiv
          ? `<details class="excel-ref-optional"><summary>Si practicas en el Excel del curso</summary><code>${step.excel_equiv}</code></details>`
          : ""
      }</div>`;
    if (step.legendId) body += renderCellLegendHtml(step.legendId);
  } else if (step.type === "grid") {
    body = `<div id="grid-mount"></div>`;
  } else if (step.type === "practice") {
    body = GRID_SHEETS[step.worksheet]
      ? `<div id="grid-mount"></div>`
      : renderExcelPractice(step.worksheet);
  }

  main.innerHTML = `
    <nav class="breadcrumb">
      <button id="back-modules" class="link">← Modulos</button>
      <span>M${mod.order} · ${state.stepIndex + 1}/${mod.steps.length}</span>
    </nav>
    <article class="lesson">
      <h1>${mod.title}</h1>
      ${
        mod.objectives?.length
          ? `<ul class="objectives-list">${mod.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>`
          : ""
      }
      <p class="step-title">${step.title}</p>
      ${renderHumanTips(mod.tips)}
      ${body}
      <footer class="lesson-footer">
        <button id="prev-step" class="btn-secondary" ${state.stepIndex === 0 ? "disabled" : ""}>Anterior</button>
        <button id="next-step" class="btn-primary">Validar y continuar</button>
      </footer>
    </article>`;

  document.getElementById("back-modules").onclick = renderHome;
  document.getElementById("prev-step").onclick = () => {
    if (state.stepIndex > 0) {
      state.stepIndex--;
      renderStep();
    }
  };
  document.getElementById("next-step").onclick = () => onNext(step, mod);

  state.gridInstance = null;
  const gridId = step.type === "grid" ? step.gridId : step.worksheet;
  if ((step.type === "grid" || GRID_SHEETS[step.worksheet]) && document.getElementById("grid-mount")) {
    state.gridInstance = mountFormulaGrid(document.getElementById("grid-mount"), gridId, state.progress);
  }
}

function renderStandaloneGrid(gridId) {
  const g = GRID_SHEETS[gridId];
  const main = document.getElementById("main");
  main.innerHTML = `
    <nav class="breadcrumb"><button id="back-home" class="link">← Inicio</button></nav>
    <h1>${g?.title || "Hoja"}</h1>
    <div id="grid-mount"></div>
    <footer class="lesson-footer"><button id="grid-validate" class="btn-primary">Validar fórmulas</button></footer>`;
  document.getElementById("back-home").onclick = renderHome;
  state.gridInstance = mountFormulaGrid(document.getElementById("grid-mount"), gridId, state.progress);
  document.getElementById("grid-validate").onclick = () => state.gridInstance?.validate();
}

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

function onNext(step, mod) {
  if (step.type === "grid" || (step.type === "practice" && GRID_SHEETS[step.worksheet])) {
    if (!state.gridInstance?.validate()) return;
    const gid = step.type === "grid" ? step.gridId : step.worksheet;
    const added = unlockSkillsForSheet(gid, state.progress);
    if (added.length) {
      saveProgress();
      const box = document.getElementById("grid-validation");
      if (box) {
        box.innerHTML += `<p class="skill-unlock-msg">🎉 Desbloqueaste: ${added.length} fórmula(s) nueva(s). Mira «Tus fórmulas» en inicio.</p>`;
      }
    }
  } else if (step.type === "practice") {
    const answers = {};
    document.querySelectorAll("[data-answer]").forEach((el) => {
      answers[el.dataset.answer] = el.value;
    });
    const { ok, msg, results } = validateWorksheet(step.worksheet, answers);
    const box = document.getElementById("validation");
    box.className = "validation-msg " + (ok ? "ok" : "err");
    box.innerHTML = ok
      ? msg
      : `${msg}<ul class="err-list">${results.filter((r) => !r.ok).map((r) => `<li>${r.label}: tu ${r.answer} → Excel ${r.expected} <code>${r.formula}</code></li>`).join("")}</ul>`;
    if (!ok) return;
  }
  markStepDone(state.moduleIndex, state.stepIndex);
  if (state.stepIndex < mod.steps.length - 1) {
    state.stepIndex++;
    renderStep();
  } else if (state.moduleIndex < curriculum.modules.length - 1) {
    state.moduleIndex++;
    state.stepIndex = 0;
    renderStep();
  } else {
    document.getElementById("main").innerHTML = `<div class="complete-card"><h1>Listo</h1><p>Practica con los Excel en BASE/ para el examen del Word.</p><button class="btn-primary" onclick="location.reload()">Inicio</button></div>`;
  }
}

init();
