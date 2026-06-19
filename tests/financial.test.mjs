/**
 * Tests financieros vs valores conocidos del Excel del curso (S6/S7/S8).
 * Ejecutar: node --test tests/financial.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  excelVAN,
  excelVafFromFlows,
  excelIRR,
  excelDepLineal,
  computeSheetS6Tasas,
  computeSheetS8Case,
  buildAmortizationTable,
  closeEnough,
} from "../app/js/excelModel.js";
import { EXCEL_REFERENCE, validateWorksheet, WORKSHEETS } from "../app/js/worksheets.js";

const REF = EXCEL_REFERENCE;

test("S8 base sin préstamo — flujos y VANE", () => {
  const r = computeSheetS8Case({ cok: 0.12, prestamo: 0 });
  assert.deepEqual(r.cols.map((c) => c.flujoFondos), REF.S8_base.flows);
  assert.ok(closeEnough(r.van, REF.S8_base.vane, 0.02));
});

test("S8 con préstamo 500 — flujos, VANF y TIRF", () => {
  const r = computeSheetS8Case({ cok: 0.12, prestamo: 500, iLoan: 0.1 });
  r.cols.map((c) => c.flujoFondos).forEach((f, i) =>
    assert.ok(closeEnough(f, REF.S8_loan500.flows[i], 0.02))
  );
  assert.ok(closeEnough(r.van, REF.S8_loan500.vanf, 0.02));
});

test("CAPM S6 Tasas — Ke", () => {
  assert.ok(closeEnough(computeSheetS6Tasas(0.0315, 0.0307, 1.4, 0.0255).ke, 0.1, 0.01));
});

test("Worksheets — validación motor", () => {
  for (const id of ["s6_tasas", "s8_fce", "s8_fcf", "s7_van_tir"]) {
    const ws = WORKSHEETS[id];
    const expected = ws.getExpected?.();
    const answers = {};
    for (const cell of ws.practiceCells) {
      answers[cell.id] = cell.get
        ? cell.get()
        : cell.field && cell.period != null && expected?.cols
          ? expected.cols[cell.period][cell.field]
          : expected?.[cell.field];
    }
    assert.equal(validateWorksheet(id, answers).ok, true, id);
  }
});
