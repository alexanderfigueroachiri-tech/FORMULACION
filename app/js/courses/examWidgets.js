/**
 * Widget "solver" — modo tarjetas para resolver exámenes paso a paso.
 * - Sin teclear: respondes ELIGIENDO una opción con clic (feedback inmediato).
 * - Pistas BAJO DEMANDA que escalan: concepto genérico → cada vez más específico
 *   → "casi la solución"; el último nivel es la SOLUCIÓN + explicación.
 * - Se avanza con el botón del pie (modo tarjeta, sin bloquear).
 *
 * Forma esperada del step:
 *   {
 *     widget:"solver",
 *     goal:"…",
 *     choices:[ {text:"…", correct:true, feedback:"…"}, {text:"…", feedback:"…"} ],
 *     hints:["…","…","…"],
 *     solution:"… (HTML)"
 *   }
 */
import { fmtMath, renderSymbolLegend } from "./mathFormat.js";

function solverWidget(step) {
  const goal = fmtMath(step.goal || "");
  const choices = Array.isArray(step.choices) ? step.choices : [];
  const hints = (Array.isArray(step.hints) ? step.hints : []).map(fmtMath);
  const solution = fmtMath(step.solution || "");
  const total = hints.length;

  return {
    mount(container) {
      let level = 0; // pistas reveladas (0..total); total+1 = solución mostrada
      let solved = false;

      const answerBlock = choices.length
        ? `<div class="solver-answer">
             <span class="answer-label">👉 Tu respuesta — elige una:</span>
             <div class="choice-list">
               ${choices
                 .map(
                   (c, i) =>
                     `<button type="button" class="choice-btn" data-i="${i}">${fmtMath(c.text)}</button>`
                 )
                 .join("")}
             </div>
             <div class="choice-feedback" id="choice-feedback"></div>
           </div>`
        : "";

      container.innerHTML = `
        <div class="solver-widget">
          ${goal ? `<div class="solver-goal"><span>🎯 Objetivo</span><p>${goal}</p></div>` : ""}
          ${answerBlock}
          <div class="solver-help">
            <div class="solver-hints" id="solver-hints"></div>
            <div class="solver-actions">
              <button type="button" class="btn-secondary solver-hint-btn" id="hint-btn"></button>
            </div>
          </div>
          ${renderSymbolLegend(false)}
        </div>`;

      // --- Respuesta por opciones (clic) ---
      const fb = container.querySelector("#choice-feedback");
      container.querySelectorAll(".choice-btn").forEach((btn) => {
        btn.onclick = () => {
          if (solved) return;
          const c = choices[+btn.dataset.i];
          if (c.correct) {
            solved = true;
            btn.classList.add("correct");
            container.querySelectorAll(".choice-btn").forEach((b) => (b.disabled = true));
            fb.className = "choice-feedback ok";
            fb.innerHTML = "✓ ¡Correcto! " + (c.feedback ? fmtMath(c.feedback) : "");
          } else {
            btn.classList.add("incorrect");
            btn.disabled = true;
            fb.className = "choice-feedback err";
            fb.innerHTML =
              "✗ " + (c.feedback ? fmtMath(c.feedback) : "No es esa. Prueba otra o pide una pista.");
          }
        };
      });

      // --- Pistas escalonadas + solución ---
      const hintsEl = container.querySelector("#solver-hints");
      const btn = container.querySelector("#hint-btn");

      function updateBtn() {
        if (level < total) {
          btn.style.display = "";
          btn.textContent = total ? `Pedir pista (${level}/${total})` : "Ver solución";
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
