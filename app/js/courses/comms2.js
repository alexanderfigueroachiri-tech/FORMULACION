/**
 * Adaptador del curso "Sistemas de Comunicaciones 2".
 * Naturaleza distinta a BEG06: no usa hojas de cálculo sino widgets de bits
 * (paridad, Hamming). Ejercicios canónicos estándar hasta subir material real.
 */
import { COMMS_WIDGETS } from "./commsWidgets.js";

export default {
  id: "comms2",
  storageKey: "comms2_progress_v1",
  curriculumUrl: "./data/comms2.curriculum.json",
  hero: {
    title: "Del bit al mensaje sin errores",
    subtitle: "Señales digitales, bits/bytes, códigos y detección/corrección de errores.",
  },

  // Los conceptos de comms muestran tablas/diagramas embebidos en el body,
  // así que no hay leyenda de celdas tipo Excel.
  renderLegend() {
    return "";
  },

  getInteractive(step) {
    if (step.type === "widget" && COMMS_WIDGETS[step.widget]) {
      return (container, ctx) => COMMS_WIDGETS[step.widget](step).mount(container, ctx);
    }
    return null;
  },
};
