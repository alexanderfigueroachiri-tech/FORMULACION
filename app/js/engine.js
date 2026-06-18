/** @deprecated Use excelModel.js — re-exports for compatibilidad */
export {
  excelPMT as pmt,
  excelNPV as npvFutureOnly,
  excelVAN,
  excelVafFromFlows,
  excelIRR as irr,
  excelDepLineal as linearDepreciation,
  buildAmortizationTable as amortizationTable,
  round,
  closeEnough,
} from "./excelModel.js";

import { excelVAN } from "./excelModel.js";

/** VAN completo incluyendo P0 */
export function npv(rate, flows) {
  return excelVAN(rate, flows);
}
