/**
 * Formateo ligero de notación matemática en texto/HTML (sin MathJax).
 * Convierte:
 *   f_s      → f<sub>s</sub>
 *   V_pp     → V<sub>pp</sub>
 *   2^{2n}   → 2<sup>2n</sup>
 *   10^-5    → 10<sup>-5</sup>
 * Es conservador: solo toca guiones bajos/circunflejos, no etiquetas HTML.
 */
export function fmtMath(s) {
  if (s == null) return s;
  return String(s)
    .replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>")
    .replace(/\^(-?[0-9A-Za-z]+)/g, "<sup>$1</sup>")
    .replace(/_\{([^}]+)\}/g, "<sub>$1</sub>")
    .replace(/([A-Za-z])_([A-Za-z0-9]+)/g, "$1<sub>$2</sub>");
}

/** Leyenda de símbolos (contexto comunicaciones / DM–PCM). */
export const SYMBOL_LEGEND = [
  { s: "Δ", d: "tamaño de paso del modulador (voltios)" },
  { s: "f_s", d: "frecuencia de muestreo (muestras/s); en DM = tasa de bits" },
  { s: "f_m", d: "frecuencia del tono / señal (Hz)" },
  { s: "f_B, B", d: "ancho de banda del mensaje (Hz)" },
  { s: "A_m", d: "amplitud pico de la señal (V)" },
  { s: "V_pp", d: "voltaje pico a pico (V)" },
  { s: "SNR", d: "relación señal a ruido (cociente de potencias)" },
  { s: "OSR", d: "sobremuestreo = f_s / (2·B)" },
  { s: "dB", d: "decibeles: 10·log_10(potencia)" },
  { s: "P_e", d: "probabilidad de error de bit" },
  { s: "R_b", d: "tasa de bits (bps)" },
  { s: "n, L", d: "bits por muestra; niveles L = 2^n" },
];

export function renderSymbolLegend(open = false) {
  return `<details class="symbol-legend"${open ? " open" : ""}>
    <summary>📖 Leyenda de símbolos</summary>
    <table class="legend-table"><tbody>
      ${SYMBOL_LEGEND.map(
        (x) => `<tr><td class="sym"><code>${fmtMath(x.s)}</code></td><td>${fmtMath(x.d)}</td></tr>`
      ).join("")}
    </tbody></table>
  </details>`;
}
