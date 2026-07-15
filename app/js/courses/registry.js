/**
 * Registro de cursos de la plataforma.
 * Cada curso se carga bajo demanda (dynamic import) y expone un "adaptador"
 * como export default con la forma descrita en app.js (contrato de curso).
 */
export const COURSE_LIST = [
  {
    id: "beg06",
    title: "BEG06 — Formulación y Evaluación de Proyectos",
    subtitle: "Flujos de caja, CAPM, VAN/TIR y financiamiento como en Excel.",
    tag: "Finanzas · Excel",
    icon: "📊",
    load: () => import("./beg06.js"),
  },
  {
    id: "comms2",
    title: "Sistemas de Comunicaciones 2",
    subtitle: "Señales digitales, bits, bytes, códigos y detección/corrección de errores.",
    tag: "Comunicaciones · Digital",
    icon: "📡",
    load: () => import("./comms2.js"),
  },
  {
    id: "examEE530",
    title: "Exámenes EE530 · paso a paso",
    subtitle: "Resuelve preguntas de examen en modo tarjetas, con pistas bajo demanda que escalan hasta la solución.",
    tag: "Examen · Guiado",
    icon: "📝",
    load: () => import("./examEE530.js"),
  },
];

export function getCourseMeta(id) {
  return COURSE_LIST.find((c) => c.id === id) || null;
}

export async function loadCourseAdapter(id) {
  const meta = getCourseMeta(id);
  if (!meta) throw new Error(`Curso desconocido: ${id}`);
  const mod = await meta.load();
  return { ...mod.default, meta };
}
