/**
 * Adaptador del curso "Exámenes EE530 · paso a paso".
 * Modo TARJETAS: se avanza con clic; cada tarjeta ofrece pistas bajo demanda
 * que escalan hasta la solución. Reusa el motor genérico y el widget "solver".
 */
import { EXAM_WIDGETS } from "./examWidgets.js";
import { fmtMath, renderSymbolLegend } from "./mathFormat.js";

export default {
  id: "examEE530",
  storageKey: "examEE530_progress_v1",
  curriculumUrl: "./data/examEE530.curriculum.json",
  nextLabel: "Continuar →",
  hero: {
    title: "Resuelve el examen, paso a paso",
    subtitle: "Lee el enunciado, pide pistas cuando las necesites y avanza entendiendo cada concepto.",
  },

  formatText: fmtMath,

  renderLegend() {
    return "";
  },

  renderHomeExtras() {
    return `<section class="tips-panel">
      <h3>Referencia rápida</h3>
      ${renderSymbolLegend(true)}
    </section>`;
  },

  getInteractive(step) {
    if (step.type === "widget" && EXAM_WIDGETS[step.widget]) {
      return (container, ctx) => EXAM_WIDGETS[step.widget](step).mount(container, ctx);
    }
    return null;
  },
};
