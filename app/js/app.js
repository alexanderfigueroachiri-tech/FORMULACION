/**
 * Shell genérico multi-curso.
 * - Muestra un selector de cursos (tarjetas).
 * - Al elegir un curso carga su "adaptador" (courses/registry.js) y su curriculum.
 * - Renderiza módulos/pasos de forma genérica y delega la práctica interactiva
 *   y las leyendas al adaptador del curso activo.
 */
import { COURSE_LIST, loadCourseAdapter } from "./courses/registry.js";

const LAST_COURSE_KEY = "eduapp_last_course";

let course = null; // adaptador del curso activo
let curriculum = null;
let state = { moduleIndex: 0, stepIndex: 0, progress: emptyProgress(), gridInstance: null };

function emptyProgress() {
  return { completedSteps: [], unlockedSkills: [] };
}

function main() {
  return document.getElementById("main");
}

async function init() {
  renderCourseSelector();
  document.getElementById("btn-home").onclick = () => renderCourseSelector();
}

/* ------------------------------------------------------------------ */
/* Selector de cursos                                                  */
/* ------------------------------------------------------------------ */

function renderCourseSelector() {
  course = null;
  curriculum = null;
  state.gridInstance = null;
  main().innerHTML = `
    <header class="hero">
      <p class="eyebrow">Plataforma de estudio</p>
      <h1>Elige tu curso</h1>
      <p class="subtitle">Aprende paso a paso con práctica interactiva. Tu progreso se guarda por curso en este dispositivo.</p>
    </header>
    <section class="course-list">
      ${COURSE_LIST.map(
        (c) => `
        <article class="course-card" data-course="${c.id}">
          <div class="course-icon">${c.icon || "📘"}</div>
          <div class="course-body">
            <span class="course-tag">${c.tag || ""}</span>
            <h2>${c.title}</h2>
            <p>${c.subtitle || ""}</p>
          </div>
          <button class="btn-start" data-open="${c.id}">Entrar →</button>
        </article>`
      ).join("")}
    </section>`;

  main()
    .querySelectorAll("[data-open]")
    .forEach((b) => {
      b.onclick = () => openCourse(b.dataset.open);
    });
}

async function openCourse(courseId) {
  main().innerHTML = `<p class="loading">Cargando curso…</p>`;
  try {
    course = await loadCourseAdapter(courseId);
    curriculum = await (await fetch(course.curriculumUrl)).json();
  } catch (err) {
    main().innerHTML = `<p class="validation-msg err">No se pudo cargar el curso (${courseId}). ${err.message}</p>
      <button class="btn-secondary" id="back-sel">← Volver</button>`;
    document.getElementById("back-sel").onclick = renderCourseSelector;
    return;
  }
  localStorage.setItem(LAST_COURSE_KEY, courseId);
  state = { moduleIndex: 0, stepIndex: 0, progress: loadProgress(), gridInstance: null };
  renderHome();
}

/* ------------------------------------------------------------------ */
/* Progreso (por curso)                                                */
/* ------------------------------------------------------------------ */

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(course.storageKey)) || {};
    return { completedSteps: p.completedSteps || [], unlockedSkills: p.unlockedSkills || [] };
  } catch {
    return emptyProgress();
  }
}

function saveProgress() {
  localStorage.setItem(course.storageKey, JSON.stringify(state.progress));
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

/* ------------------------------------------------------------------ */
/* Home del curso                                                      */
/* ------------------------------------------------------------------ */

function renderHome() {
  const pct = totalProgress();
  const heroTitle = curriculum.tagline || course.hero?.title || "Aprende paso a paso";
  const heroSub = curriculum.subtitle || course.hero?.subtitle || "";
  main().innerHTML = `
    <header class="hero">
      <button class="link course-switch" id="switch-course">← Cambiar curso</button>
      <p class="eyebrow">${curriculum.course}</p>
      <h1>${heroTitle}</h1>
      ${heroSub ? `<p class="subtitle">${heroSub}</p>` : ""}
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <p class="progress-text">${pct}%${curriculum.estimated_hours ? ` · ~${curriculum.estimated_hours}h` : ""}</p>
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
            <p class="meta">${mod.duration_min ? `${mod.duration_min} min · ` : ""}${done}/${mod.steps.length}</p>
          </div>
          <button class="btn-start" data-start="${i}">Continuar →</button>
        </article>`;
        })
        .join("")}
    </section>
    ${course.renderHomeExtras ? course.renderHomeExtras(state.progress) : ""}`;

  document.getElementById("switch-course").onclick = renderCourseSelector;
  main()
    .querySelectorAll("[data-start]")
    .forEach((b) => {
      b.onclick = () => {
        const mi = +b.dataset.start;
        const mod = curriculum.modules[mi];
        state.moduleIndex = mi;
        const first = mod.steps.findIndex((_, si) => !isStepDone(mi, si));
        state.stepIndex = first >= 0 ? first : 0;
        renderStep();
      };
    });

  if (course.wireHomeExtras) {
    course.wireHomeExtras(main(), { showStandalone, progress: state.progress });
  }
}

/* ------------------------------------------------------------------ */
/* Render de tips y pasos genéricos                                    */
/* ------------------------------------------------------------------ */

function renderTips(tips) {
  if (course.renderTips) return course.renderTips(tips);
  if (!tips?.length) return "";
  return `<aside class="coach-tips human-tips">${tips
    .map((t) => {
      const tip = typeof t === "string" ? { human: t } : t;
      const ref = tip.formula || tip.excel;
      const refHtml = ref
        ? `<span class="tip-formula">${tip.formula ? "Fórmula" : "Excel"}: <em>${ref}</em></span>`
        : "";
      return `<p>💡 ${tip.human}${refHtml ? `<br/>${refHtml}` : ""}</p>`;
    })
    .join("")}</aside>`;
}

function renderConcept(step) {
  let body = `<div class="concept-card"><h3>${step.title}</h3><p>${step.body}</p></div>`;
  if (step.legendId && course.renderLegend) body += course.renderLegend(step.legendId);
  return body;
}

function renderFormula(step) {
  let body = `<div class="formula-card"><h3>${step.title}</h3>
    <div class="formula-math">${step.formula}</div>
    ${step.excel_note ? `<p class="formula-note">${step.excel_note}</p>` : ""}
    ${
      step.excel_equiv
        ? `<details class="excel-ref-optional"><summary>Si practicas en el Excel del curso</summary><code>${step.excel_equiv}</code></details>`
        : ""
    }</div>`;
  if (step.legendId && course.renderLegend) body += course.renderLegend(step.legendId);
  return body;
}

function renderStep() {
  const mod = curriculum.modules[state.moduleIndex];
  const step = mod.steps[state.stepIndex];
  const mountFn = course.getInteractive ? course.getInteractive(step) : null;

  let body = "";
  if (mountFn) body = `<div id="grid-mount"></div>`;
  else if (step.type === "concept") body = renderConcept(step);
  else if (step.type === "formula") body = renderFormula(step);

  main().innerHTML = `
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
      ${renderTips(mod.tips)}
      ${body}
      <footer class="lesson-footer">
        <button id="prev-step" class="btn-secondary" ${state.stepIndex === 0 ? "disabled" : ""}>Anterior</button>
        <button id="next-step" class="btn-primary">${course.nextLabel || "Validar y continuar"}</button>
      </footer>
    </article>`;

  document.getElementById("back-modules").onclick = renderHome;
  document.getElementById("prev-step").onclick = () => {
    if (state.stepIndex > 0) {
      state.stepIndex--;
      renderStep();
    }
  };
  document.getElementById("next-step").onclick = () => onNext(step, mod, mountFn);

  state.gridInstance = null;
  if (mountFn && document.getElementById("grid-mount")) {
    state.gridInstance = mountFn(document.getElementById("grid-mount"), {
      progress: state.progress,
    });
  }
}

function showStandalone(title, mountFn) {
  main().innerHTML = `
    <nav class="breadcrumb"><button id="back-home" class="link">← Inicio del curso</button></nav>
    <h1>${title}</h1>
    <div id="grid-mount"></div>
    <footer class="lesson-footer"><button id="grid-validate" class="btn-primary">Validar</button></footer>`;
  document.getElementById("back-home").onclick = renderHome;
  const inst = mountFn(document.getElementById("grid-mount"), { progress: state.progress });
  state.gridInstance = inst;
  document.getElementById("grid-validate").onclick = () => inst?.validate();
}

function onNext(step, mod, mountFn) {
  if (mountFn) {
    const inst = state.gridInstance;
    if (!inst || !inst.validate()) return;
    const extra = inst.afterValidate?.(state.progress);
    if (extra?.addedHtml) {
      saveProgress();
      const box = document.getElementById(extra.boxId || "grid-validation");
      if (box) box.innerHTML += extra.addedHtml;
    }
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
    main().innerHTML = `<div class="complete-card"><h1>¡Módulos completados!</h1>
      <p>Terminaste «${curriculum.course}». Repasa cuando quieras.</p>
      <button class="btn-primary" id="done-home">Inicio del curso</button>
      <button class="btn-secondary" id="done-courses">Otros cursos</button></div>`;
    document.getElementById("done-home").onclick = renderHome;
    document.getElementById("done-courses").onclick = renderCourseSelector;
  }
}

init();
