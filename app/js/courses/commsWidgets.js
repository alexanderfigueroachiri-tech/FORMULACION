/**
 * Widgets interactivos para "Sistemas de Comunicaciones 2".
 * Ejercicios canónicos estándar (sin material del curso todavía):
 *   - parity:  bit de paridad par/impar
 *   - hamming: Hamming(7,4) codificar y corregir 1 error (síndrome)
 *
 * Cada widget es una fábrica: (step) => { mount(container, {progress}) -> { validate() } }
 * La instancia pinta su propio recuadro de validación y validate() devuelve boolean.
 */

function bits(str) {
  return String(str)
    .replace(/[^01]/g, "")
    .split("")
    .map((c) => +c);
}

function ones(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function paintBox(container, ok, html) {
  const box = container.querySelector(".widget-validation");
  if (box) {
    box.className = "widget-validation validation-msg " + (ok ? "ok" : "err");
    box.innerHTML = html;
  }
}

/* ------------------------------------------------------------------ */
/* Paridad par / impar                                                 */
/* ------------------------------------------------------------------ */

function parityWidget(step) {
  const data = bits(step.data ?? "1011001");
  const scheme = step.scheme === "odd" ? "odd" : "even";
  const schemeLabel = scheme === "odd" ? "impar" : "par";

  return {
    mount(container) {
      let parity = 0;

      function expectedParity() {
        const d = ones(data) % 2;
        return scheme === "odd" ? 1 - d : d;
      }

      function render() {
        const total = ones(data) + parity;
        container.innerHTML = `
          <div class="comms-widget">
            <p class="widget-hint">💡 ${
              step.hint ||
              `Ajusta el bit de paridad para que el total de unos sea <strong>${schemeLabel}</strong>.`
            }</p>
            <div class="bit-row">
              <span class="bit-group-label">Datos</span>
              ${data.map((b) => `<span class="bit-cell bit-fixed">${b}</span>`).join("")}
              <span class="bit-sep">→</span>
              <span class="bit-group-label">Paridad</span>
              <button type="button" class="bit-cell bit-toggle ${parity ? "on" : ""}" id="parity-bit">${parity}</button>
            </div>
            <p class="widget-meta">Unos en datos: <strong>${ones(data)}</strong> · Total con paridad: <strong>${total}</strong> (${total % 2 === 0 ? "par" : "impar"})</p>
            <div class="widget-validation validation-msg" role="status"></div>
          </div>`;
        container.querySelector("#parity-bit").onclick = () => {
          parity = parity ? 0 : 1;
          render();
        };
      }

      render();

      return {
        validate() {
          const exp = expectedParity();
          const ok = parity === exp;
          paintBox(
            container,
            ok,
            ok
              ? `✓ Correcto. Paridad ${schemeLabel}: el bit es <code>${exp}</code> (total de unos ${scheme === "odd" ? "impar" : "par"}).`
              : `El bit de paridad debería ser <code>${exp}</code> para que el total de unos sea <strong>${schemeLabel}</strong>. Toca el bit de paridad para cambiarlo.`
          );
          return ok;
        },
      };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Hamming(7,4)                                                        */
/* Posiciones (1-based): 1=p1 2=p2 3=d1 4=p4 5=d2 6=d3 7=d4            */
/* p1 cubre 1,3,5,7 · p2 cubre 2,3,6,7 · p4 cubre 4,5,6,7 (paridad par)*/
/* ------------------------------------------------------------------ */

const P1 = [1, 3, 5, 7];
const P2 = [2, 3, 6, 7];
const P4 = [4, 5, 6, 7];

function parityOf(word1, positions) {
  // word1: array indexado 1..7 (word1[0] sin usar)
  return positions.reduce((a, p) => a + word1[p], 0) % 2;
}

function hammingWidget(step) {
  const mode = step.mode === "correct" ? "correct" : "encode";

  if (mode === "encode") {
    const d = bits(step.data ?? "1011"); // d1..d4
    return {
      mount(container) {
        // word indexado 1..7; paridades editables empiezan en 0
        const word = [0, 0, 0, d[0], 0, d[1], d[2], d[3]];

        function render() {
          const labels = ["", "p1", "p2", "d1", "p4", "d2", "d3", "d4"];
          const cells = [];
          for (let i = 1; i <= 7; i++) {
            const isParity = i === 1 || i === 2 || i === 4;
            cells.push(
              isParity
                ? `<button type="button" class="bit-cell bit-toggle ${word[i] ? "on" : ""}" data-p="${i}">
                     <small>${labels[i]}</small>${word[i]}</button>`
                : `<span class="bit-cell bit-fixed"><small>${labels[i]}</small>${word[i]}</span>`
            );
          }
          container.innerHTML = `
            <div class="comms-widget">
              <p class="widget-hint">💡 ${
                step.hint ||
                "Calcula los bits de paridad (p1, p2, p4) con paridad par sobre las posiciones que cubren. Toca cada p para ajustarlo."
              }</p>
              <div class="bit-row hamming-row">${cells.join("")}</div>
              <ul class="cover-list">
                <li><code>p1</code> cubre posiciones 1,3,5,7</li>
                <li><code>p2</code> cubre posiciones 2,3,6,7</li>
                <li><code>p4</code> cubre posiciones 4,5,6,7</li>
              </ul>
              <div class="widget-validation validation-msg" role="status"></div>
            </div>`;
          container.querySelectorAll("[data-p]").forEach((btn) => {
            btn.onclick = () => {
              const i = +btn.dataset.p;
              word[i] = word[i] ? 0 : 1;
              render();
            };
          });
        }

        render();

        return {
          validate() {
            // paridad par esperada, calculada solo con los bits de datos que cubre cada p:
            const e1 = (word[3] + word[5] + word[7]) % 2;
            const e2 = (word[3] + word[6] + word[7]) % 2;
            const e4 = (word[5] + word[6] + word[7]) % 2;
            const ok = word[1] === e1 && word[2] === e2 && word[4] === e4;
            const cw = [1, 2, 3, 4, 5, 6, 7].map((i) => word[i]).join("");
            paintBox(
              container,
              ok,
              ok
                ? `✓ Palabra código correcta: <code>${cw}</code> (p1=${e1}, p2=${e2}, p4=${e4}).`
                : `Revisa las paridades pares. Correctas: p1=<code>${e1}</code>, p2=<code>${e2}</code>, p4=<code>${e4}</code>.`
            );
            return ok;
          },
        };
      },
    };
  }

  // mode === "correct"
  const recv = bits(step.received ?? "0110111"); // 7 bits, 1 error
  return {
    mount(container) {
      const word = [0, ...recv]; // 1..7

      function syndrome() {
        const s1 = parityOf(word, P1);
        const s2 = parityOf(word, P2);
        const s4 = parityOf(word, P4);
        return { s1, s2, s4, pos: s4 * 4 + s2 * 2 + s1 };
      }

      function render() {
        const labels = ["", "p1", "p2", "d1", "p4", "d2", "d3", "d4"];
        const cells = [];
        for (let i = 1; i <= 7; i++) {
          cells.push(
            `<button type="button" class="bit-cell bit-toggle ${word[i] ? "on" : ""}" data-i="${i}">
               <small>${labels[i]} · ${i}</small>${word[i]}</button>`
          );
        }
        container.innerHTML = `
          <div class="comms-widget">
            <p class="widget-hint">💡 ${
              step.hint ||
              "La palabra recibida tiene 1 bit erróneo. Calcula el síndrome y toca el bit equivocado para corregirlo."
            }</p>
            <div class="bit-row hamming-row">${cells.join("")}</div>
            <div class="widget-validation validation-msg" role="status"></div>
          </div>`;
        container.querySelectorAll("[data-i]").forEach((btn) => {
          btn.onclick = () => {
            const i = +btn.dataset.i;
            word[i] = word[i] ? 0 : 1;
            render();
          };
        });
      }

      render();

      return {
        validate() {
          const s = syndrome();
          const ok = s.pos === 0;
          const cw = [1, 2, 3, 4, 5, 6, 7].map((i) => word[i]).join("");
          paintBox(
            container,
            ok,
            ok
              ? `✓ Síndrome 000 → palabra válida corregida: <code>${cw}</code>.`
              : `Síndrome = ${s.s4}${s.s2}${s.s1} (binario) → error en la <strong>posición ${s.pos}</strong>. Toca ese bit para corregirlo.`
          );
          return ok;
        },
      };
    },
  };
}

export const COMMS_WIDGETS = {
  parity: parityWidget,
  hamming: hammingWidget,
};
