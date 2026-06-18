/** Fórmulas que se desbloquean al validar bien un ejercicio (progreso en localStorage). */
export const FORMULA_SKILLS = [
  {
    id: "dep_lineal",
    name: "Depreciación lineal",
    formula: "Dep anual = (Capital − VR) ÷ Vida útil",
    unlockOn: { gridId: "depreciacion_s6" },
    module: 1,
  },
  {
    id: "dep_fce_sign",
    name: "Dep en flujo (negativa)",
    formula: "Dep en utilidad = − Dep anual",
    unlockOn: { gridId: "depreciacion_s6" },
    module: 1,
  },
  {
    id: "uaii",
    name: "UAII",
    formula: "UAII = Ingresos + Egresos + Depreciación",
    unlockOn: { gridId: "fce_cadena_s6" },
    module: 2,
  },
  {
    id: "impuesto_30",
    name: "Impuesto 30%",
    formula: "Impuesto = −0,30 × UAI",
    unlockOn: { gridId: "fce_cadena_s6" },
    module: 2,
  },
  {
    id: "flujo_fce",
    name: "Flujo de fondos",
    formula: "Flujo = Utilidad neta − Dep + Inv. del periodo",
    unlockOn: { gridId: "fce_cadena_s6" },
    module: 2,
  },
  {
    id: "vaf",
    name: "Vaf",
    formula: "Vaf = NPV(tasa, flujos P1…Pn)",
    unlockOn: { gridId: "van_s7" },
    module: 4,
  },
  {
    id: "van",
    name: "VAN",
    formula: "VAN = Vaf + Flujo periodo 0",
    unlockOn: { gridId: "van_s7" },
    module: 4,
  },
  {
    id: "pmt",
    name: "Cuota PMT",
    formula: "Cuota = PMT(tasa, plazo, préstamo)",
    unlockOn: { gridId: "s8_amort_pmt" },
    module: 5,
  },
  {
    id: "interes_prestamo",
    name: "Interés del préstamo",
    formula: "Interés = Saldo × tasa",
    unlockOn: { gridId: "s8_amort_pmt" },
    module: 5,
  },
];

const SHEET_SKILLS = FORMULA_SKILLS.reduce((acc, s) => {
  const gid = s.unlockOn.gridId;
  if (!acc[gid]) acc[gid] = [];
  acc[gid].push(s.id);
  return acc;
}, {});

export function getUnlockedSkills(progress) {
  return progress?.unlockedSkills || [];
}

export function unlockSkillsForSheet(sheetId, progress) {
  const ids = SHEET_SKILLS[sheetId] || [];
  if (!ids.length) return [];
  const have = new Set(getUnlockedSkills(progress));
  const added = ids.filter((id) => !have.has(id));
  if (!added.length) return [];
  progress.unlockedSkills = [...have, ...added];
  return added;
}

export function renderSkillsPanelHtml(progress) {
  const unlocked = new Set(getUnlockedSkills(progress));
  const cards = FORMULA_SKILLS.map((s) => {
    const on = unlocked.has(s.id);
    return `<li class="skill-card ${on ? "unlocked" : "locked"}">
      <span class="skill-badge">${on ? "✓" : "M" + s.module}</span>
      <div>
        <strong>${s.name}</strong>
        <em>${on ? s.formula : "Completa el módulo " + s.module + " para desbloquear"}</em>
      </div>
    </li>`;
  }).join("");
  const n = unlocked.size;
  return `
    <section class="skills-panel">
      <h3>Tus fórmulas (${n}/${FORMULA_SKILLS.length})</h3>
      <p class="skills-hint">Cada hoja que validas bien desbloquea fórmulas para repasarlas después.</p>
      <ul class="skills-list">${cards}</ul>
    </section>`;
}

export function renderUnlockedChipsHtml(progress) {
  const unlocked = FORMULA_SKILLS.filter((s) => getUnlockedSkills(progress).includes(s.id));
  if (!unlocked.length) return "";
  return `<div class="skill-chips" id="skill-chips">
    <span class="chips-label">Ya dominas — toca para pegar en la barra:</span>
    ${unlocked
      .map(
        (s) =>
          `<button type="button" class="skill-chip" data-formula="${s.formula.replace(/"/g, "&quot;")}" title="${s.formula}">${s.name}</button>`
      )
      .join("")}
  </div>`;
}
