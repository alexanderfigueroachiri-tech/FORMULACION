/**
 * Evaluador de fórmulas tipo Excel con referencias a celdas (A1, I5, D11…).
 * Soporta: + - * / ^ (), IF(cond,a,b), SUM(A1:A3), NPV/VNA(tasa,A1:A3)
 */

const CELL_RE = /\b([A-Z]+\d+)\b/gi;
const NUM_RE = /^-?\d+(\.\d+)?$/;

function colToIndex(col) {
  let n = 0;
  for (const c of col.toUpperCase()) n = n * 26 + (c.charCodeAt(0) - 64);
  return n;
}

function parseCellId(id) {
  const m = /^([A-Z]+)(\d+)$/i.exec(id.trim());
  if (!m) return null;
  return { col: colToIndex(m[1]), row: parseInt(m[2], 10) };
}

function expandRange(start, end, getCell) {
  const a = parseCellId(start);
  const b = parseCellId(end);
  if (!a || !b) return [];
  const out = [];
  const r0 = Math.min(a.row, b.row);
  const r1 = Math.max(a.row, b.row);
  const c0 = Math.min(a.col, b.col);
  const c1 = Math.max(a.col, b.col);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const id = indexToCol(c) + r;
      if (getCell(id)) out.push(id);
    }
  }
  return out;
}

function indexToCol(n) {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function getCellValue(cells, id, stack = new Set()) {
  const key = id.toUpperCase();
  const cell = cells[key];
  if (!cell) return NaN;
  if (stack.has(id.toUpperCase())) return NaN;
  if (cell.computed != null && cell.formulaRaw) return cell.computed;
  if (cell.formulaRaw) {
    stack.add(id.toUpperCase());
    const v = evaluateFormula(cell.formulaRaw, cells, stack);
    stack.delete(id.toUpperCase());
    return v;
  }
  const n = parseFloat(cell.value);
  return Number.isNaN(n) ? 0 : n;
}

function replaceCellRefs(expr, cells, stack) {
  return expr.replace(CELL_RE, (_, ref) => {
    const v = getCellValue(cells, ref, stack);
    return Number.isNaN(v) ? "0" : `(${v})`;
  });
}

function evaluateFormula(raw, cells, stack = new Set()) {
  if (!raw || !String(raw).trim()) return NaN;
  let expr = String(raw).trim();
  if (expr.startsWith("=")) expr = expr.slice(1);
  if (expr.startsWith("+")) expr = expr.slice(1);

  // IF(cond, a, b)
  expr = expr.replace(/IF\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\)/gi, (_, cond, a, b) => {
    const cv = evalSimple(replaceCellRefs(cond.trim(), cells, stack));
    const av = evalSimple(replaceCellRefs(a.trim(), cells, stack));
    const bv = evalSimple(replaceCellRefs(b.trim(), cells, stack));
    return cv ? av : bv;
  });

  // NPV / VNA (Excel inglés / español) — solo flujos futuros, sin periodo 0
  const npvPattern =
    /(NPV|VNA)\s*\(\s*([^,]+)\s*,\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)/gi;
  expr = expr.replace(npvPattern, (_, _fn, rate, s, e) => {
    const r = evalSimple(replaceCellRefs(rate.trim(), cells, stack));
    const ids = expandRange(s, e, (id) => cells[id.toUpperCase()]);
    let sum = 0;
    ids.forEach((id, i) => {
      const cf = getCellValue(cells, id, stack);
      sum += cf / (1 + r) ** (i + 1);
    });
    return sum;
  });

  // SUM(range)
  expr = expr.replace(/SUM\s*\(\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)/gi, (_, s, e) => {
    const ids = expandRange(s, e, (id) => cells[id.toUpperCase()]);
    return ids.reduce((a, id) => a + getCellValue(cells, id, stack), 0);
  });

  // PMT / PAGO (Excel inglés / español)
  expr = expr.replace(/(PMT|PAGO)\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\)/gi, (_, _fn, rate, n, pv) => {
    const r = evalSimple(replaceCellRefs(rate.trim(), cells, stack));
    const nper = evalSimple(replaceCellRefs(n.trim(), cells, stack));
    const p = evalSimple(replaceCellRefs(pv.trim(), cells, stack));
    if (r === 0) return -p / nper;
    const f = (1 + r) ** nper;
    return (-p * r * f) / (f - 1);
  });

  expr = replaceCellRefs(expr, cells, stack);
  return evalSimple(expr);
}

function evalSimple(expr) {
  if (NUM_RE.test(expr.trim())) return parseFloat(expr);
  // eslint-disable-next-line no-new-func
  try {
    const fn = new Function(`"use strict"; return (${expr});`);
    const v = fn();
    return typeof v === "number" && Number.isFinite(v) ? v : NaN;
  } catch {
    return NaN;
  }
}

export function recalcAll(cells) {
  Object.values(cells).forEach((c) => {
    if (c.formulaRaw) c.computed = null;
  });
  Object.entries(cells).forEach(([id, c]) => {
    if (c.formulaRaw) {
      c.computed = evaluateFormula(c.formulaRaw, cells);
    }
  });
}

export function round2(n) {
  if (n == null || Number.isNaN(n)) return "";
  return Math.round(n * 100) / 100;
}

export function formulasMatch(a, b) {
  const norm = (s) =>
    String(s || "")
      .trim()
      .toUpperCase()
      .replace(/\s/g, "")
      .replace(/^=/, "")
      .replace(/VNA\(/g, "NPV(")
      .replace(/PAGO\(/g, "PMT(");
  return norm(a) === norm(b);
}

export function closeEnough(a, b, tol = 1.5) {
  return Math.abs(a - b) <= tol;
}
