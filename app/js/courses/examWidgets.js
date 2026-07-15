/**
 * Widget "solver" — modo tarjetas para resolver exámenes paso a paso.
 * - Sin escritura: se avanza con clic (el botón del pie del curso).
 * - Pistas BAJO DEMANDA que escalan: concepto genérico → cada vez más específico
 *   → "casi la solución"; el último nivel es la SOLUCIÓN + explicación.
 *
 * Fábrica: (step) => { mount(container) -> { validate() } }
 * validate() siempre devuelve true (modo tarjeta: avanzar con clic).
 *
 * Forma esperada del step:
 *   { widget:"solver", goal:"…", hints:["…","…","…"], solution:"… (HTML)" }
 */
import { fmtMath, renderSymbolLegend } from "./mathFormat.js";

function solverWidget(step) {
  const goal = fmtMath(step.goal || "");
  const hints = (Array.isArray(step.hints) ? step.hints : []).map(fmtMath);
  const solution = fmtMath(step.solution || "");
  const total = hints.length;

  return {
    mount(container) {
      let level = 0; // nº de pistas ya reveladas (0..total); total+1 = solución mostrada

      container.innerHTML = `
        <div class="solver-widget">
          ${goal ? `<div class="solver-goal"><span>🎯 Objetivo</span><p>${goal}</p></div>` : ""}
          <div class="solver-hints" id="solver-hints"></div>
          <div class="solver-actions">
            <button type="button" class="btn-secondary solver-hint-btn" id="hint-btn"></button>
          </div>
          ${renderSymbolLegend(false)}
        </div>`;

      const hintsEl = container.querySelector("#solver-hints");
      const btn = container.querySelector("#hint-btn");

      function updateBtn() {
        if (level < total) {
          btn.style.display = "";
          btn.textContent = total
            ? `Pedir pista (${level}/${total})`
            : "Ver solución";
          if (!total) btn.textContent = "Ver solución";
        } else if (level === total) {
          btn.style.display = "";
          btn.textContent = "Ver solución ✓";
          btn.classList.add("reveal-solution");
        } else {
          btn.style.display = "none";
        }
      }

      function revealHint() {
        const card = document.createElement("div");
        card.className = "hint-card";
        card.innerHTML = `<span class="hint-label">Pista ${level + 1} de ${total}</span><p>${hints[level]}</p>`;
        hintsEl.appendChild(card);
        level++;
      }

      function revealSolution() {
        const card = document.createElement("div");
        card.className = "hint-card solution-card";
        card.innerHTML = `<span class="hint-label sol">✅ Solución y explicación</span><div class="solution-body">${solution}</div>`;
        hintsEl.appendChild(card);
        level = total + 1;
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      btn.onclick = () => {
        if (level < total) revealHint();
        else if (level === total) revealSolution();
        updateBtn();
      };

      updateBtn();

      return {
        validate: () => true, // modo tarjeta: siempre se puede avanzar
      };
    },
  };
}

export const EXAM_WIDGETS = {
  solver: solverWidget,
};
