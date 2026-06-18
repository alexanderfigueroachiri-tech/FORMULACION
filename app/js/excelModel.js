/**
 * Motor idéntico a los Excel del curso (S6, S7, S8).
 * Cada función documenta la celda/fórmula Excel equivalente.
 */

export function round(n, decimals = 2) {
  if (n == null || Number.isNaN(n)) return 0;
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** Excel: =-PMT(tasa, nper, pv) */
export function excelPMT(rate, nper, pv) {
  if (rate === 0) return -pv / nper;
  const f = (1 + rate) ** nper;
  return (-pv * rate * f) / (f - 1);
}

/** Excel: =NPV(tasa, P1:Pn) — NO incluye periodo 0 */
export function excelNPV(rate, flowsFromP1) {
  return flowsFromP1.reduce(
    (acc, cf, i) => acc + cf / (1 + rate) ** (i + 1),
    0
  );
}

/** S7/Eólico/S8: VAN = Vaf + P0  →  =+B26+B24  /  =+C17+C16 */
export function excelVAN(rate, allFlows) {
  const p0 = allFlows[0] ?? 0;
  const vaf = excelNPV(rate, allFlows.slice(1));
  return round(vaf + p0);
}

/** Alias usado en hojas S6 */
export function excelVafFromFlows(rate, allFlows) {
  return round(excelNPV(rate, allFlows.slice(1)));
}

/** S6 FCE: Vaf = D16+E16+F16 con =D14/(1+k), =E14/(1+k)^2... */
export function excelVafManualDiscount(rate, flowsFromP1) {
  const total = flowsFromP1.reduce(
    (acc, cf, i) => acc + cf / (1 + rate) ** (i + 1),
    0
  );
  return round(total);
}

/** S6 FCE: Vaf-I = C16+C14 */
export function excelVafMenosI(vafTotal, flowP0) {
  return round(vafTotal + flowP0);
}

/** S6 FCE: rentabilidad = C17/-C14 (usa flujo P0) */
export function excelRentabilidad(van, flowP0) {
  if (!flowP0) return 0;
  return round(van / -flowP0, 4);
}

/** Excel: =IRR(rango) */
export function excelIRR(flows, guess = 0.1) {
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    let npvVal = 0;
    let dnpv = 0;
    for (let t = 0; t < flows.length; t++) {
      const d = (1 + rate) ** t;
      npvVal += flows[t] / d;
      if (t > 0) dnpv -= (t * flows[t]) / (1 + rate) ** (t + 1);
    }
    if (Math.abs(dnpv) < 1e-12) break;
    const next = rate - npvVal / dnpv;
    if (Math.abs(next - rate) < 1e-9) return next;
    rate = next;
  }
  return rate;
}

/** S6 FCE: Dep = (I5-40)/3  →  =(Capital-VR)/vida */
export function excelDepLineal(capital, vr, vida) {
  return round((capital - vr) / vida);
}

/** S6 FCE impuesto: =-0.3*D11 (siempre, sin IF) */
export function excelImpuestoFCE(uai) {
  return round(-0.3 * uai);
}

/** S6 FCEF impuesto: =IF(D13<=0,0,-D13*0.3) */
export function excelImpuestoFCEF(uai) {
  if (uai <= 0) return 0;
  return round(-0.3 * uai);
}

/** S8/S7 estilo: impuesto positivo en celda, UN = UAI - imp */
export function excelImpuestoS8(uai) {
  if (uai <= 0) return 0;
  return round(0.3 * uai);
}

/**
 * Hoja S6 FCE — réplica exacta filas 5-18
 * Dep en fila 8 negativa: D8 = -J6
 * f = UN - D8 + Inversion_col  (=+D13-D8+D5)
 */
export function computeSheetS6FCE({
  k = 0.12,
  inversion = -1240,
  vr = 40,
  capital = 1240,
  ingresos = [0, 0, 0],
  egresos = [-100, -200, -200],
  periods = 3,
}) {
  const depAnual = excelDepLineal(capital, vr, periods);
  const cols = [];

  for (let p = 0; p <= periods; p++) {
    const invP = p === 0 ? inversion : p === periods ? vr : 0;
    const ing = p === 0 ? 0 : ingresos[p - 1] ?? 0;
    const egr = p === 0 ? 0 : egresos[p - 1] ?? 0;
    const depRow = p === 0 ? 0 : -depAnual; // fila 8 negativa

    const uaii = round(ing + egr + depRow); // =+D6+D7+D8
    const interes = 0; // fila 10
    const uai = round(uaii + interes); // =+D9+D10
    const imp = p === 0 ? 0 : excelImpuestoFCE(uai); // =-0.3*D11
    const un = round(uai + imp); // =+D11+D12
    const f = round(un - depRow + invP); // =+D13-D8+D5

    cols.push({
      periodo: p,
      inversion: invP,
      ingresos: ing,
      egresos: egr,
      depreciacion: depRow,
      uaii,
      intereses: interes,
      uai,
      impuesto: imp,
      un,
      f,
      formulas: {
        uaii: "=+D6+D7+D8",
        uai: "=+D9+D10",
        impuesto: "=-0.3*D11",
        un: "=+D11+D12",
        f: "=+D13-D8+D5",
      },
    });
  }

  const flowsP1 = cols.slice(1).map((c) => c.f);
  const vafParts = flowsP1.map((cf, i) => round(cf / (1 + k) ** (i + 1)));
  const vafTotal = round(vafParts.reduce((a, b) => a + b, 0)); // =+D16+E16+F16
  const van = excelVafMenosI(vafTotal, cols[0].f); // Vaf-I = C16+C14
  const rent = excelRentabilidad(van, cols[0].f);

  return {
    source: "S6 Flujo basico FCE y FCF.xlsx → hoja FCE",
    k,
    depAnual,
    cols,
    vafTotal,
    van,
    vanLabel: "Vaf-I",
    rent,
    vafFormula: "=+D16+E16+F16",
    vanFormula: "=+C16+C14",
    vafDiscountFormula: "=D14/(1+C2)",
  };
}

/**
 * Hoja S8 Financ — caso base sin préstamo (columna A-E)
 * Impuesto sobre UAI positivo; flujo = Neto + Dep + Inversión periodo
 */
export function computeSheetS8Case({
  cok = 0.12,
  iLoan = 0.1,
  inversion = -1240,
  vr = 40,
  prestamo = 0,
  ingresos = [600, 900, 800],
  gastos = [150, 250, 200],
  dep = 400,
  periods = 3,
}) {
  const cuota =
    prestamo > 0 ? round(excelPMT(iLoan, periods, prestamo)) : 0;
  let saldo = prestamo;
  const amortRows = [];

  for (let p = 1; p <= periods; p++) {
    const interes = round(saldo * iLoan);
    const amort = prestamo > 0 ? round(cuota - interes) : 0;
    saldo = round(saldo - amort);
    amortRows.push({ periodo: p, saldoIni: round(saldo + amort), interes, amort, cuota, saldoFin: Math.max(0, saldo) });
  }

  const cols = [];
  for (let p = 0; p <= periods; p++) {
    const invP = p === 0 ? inversion : p === periods ? vr : 0;
    const ing = p === 0 ? 0 : ingresos[p - 1];
    const gas = p === 0 ? 0 : gastos[p - 1];
    const depP = p === 0 ? 0 : dep;
    const uaii = round(ing - gas - depP);
    const intereses = p === 0 ? 0 : prestamo > 0 ? amortRows[p - 1].interes : 0;
    const uai = round(uaii - intereses);
    const imp = excelImpuestoS8(uai);
    const neto = round(uai - imp);
    // S8 fila Prestamo: P0=+monto, P1..n=-cuota
    let prestamoCol = 0;
    if (p === 0) prestamoCol = prestamo;
    else if (prestamo > 0) prestamoCol = -amortRows[p - 1].cuota;

    const flujoFondos = round(neto + depP + invP + prestamoCol);

    cols.push({
      periodo: p,
      inversion: invP,
      prestamoCol,
      ingresos: ing,
      gastos: gas,
      dep: depP,
      uaii,
      intereses,
      uai,
      impuestos: imp,
      neto,
      flujoFondos,
    });
  }

  const allFlows = cols.map((c) => c.flujoFondos);
  const vaf = excelVafFromFlows(cok, allFlows);
  const van = excelVAN(cok, allFlows);
  const tir = excelIRR(allFlows);
  const rent = excelRentabilidad(van, allFlows[0]);

  return {
    source: "S8 Ejerc icios financiamiento.xls → hoja Financ",
    cok,
    prestamo,
    cuota,
    amortRows,
    cols,
    vaf,
    van,
    vanLabel: prestamo > 0 ? "VANF" : "VANE",
    tir,
    tirLabel: prestamo > 0 ? "TIRF" : "TIRE",
    rent,
    formulas: {
      vaf: `=NPV(${cok * 100}%, flujos P1:Pn)`,
      van: "= Vaf + Flujo_P0",
      cuota: "=-PMT(i, n, Prestamo)",
      interes: "= Saldo × i",
      amort: "= Cuota - Interes",
      uaii: "= Ing - Gastos - Dep",
      uai: "= UAII - Intereses",
      impuestos: "= IF(UAI<=0,0,UAI*30%)",
      neto: "= UAI - Impuestos",
      flujo: "= Neto + Dep + Prestamo_col + Inversion_col",
    },
  };
}

/** S7 Nuevo o usado: Vaf=NPV, VAN=Vaf+P0, VAE=-PMT */
export function computeSheetS7Indicators(rate, flowsP1, flowP0, pmtYears) {
  const vaf = round(excelNPV(rate, flowsP1));
  const van = round(vaf + flowP0);
  const vae = pmtYears ? round(excelPMT(rate, pmtYears, van)) : null;
  return {
    source: "S7 → Nuevo o usado",
    vaf,
    van,
    vae,
    formulas: {
      vaf: `=NPV(${rate * 100}%, D16:G16)`,
      van: "=+C17+C16",
      vae: `=-PMT(${rate * 100}%, ${pmtYears}, C18)`,
    },
  };
}

/** S7 Eólico: Vaf=NPV(C10,C24:V24), VAN=+B26+B24, TIR=IRR */
export function computeSheetS7Eolico(rate, allFlows) {
  const vaf = excelVafFromFlows(rate, allFlows);
  const van = excelVAN(rate, allFlows);
  const tir = round(excelIRR(allFlows), 4);
  return {
    source: "S7 → Eolico",
    vaf,
    van,
    tir,
    formulas: {
      vaf: "=NPV(C10,C24:V24)",
      van: "=+B26+B24",
      tir: "=IRR(B24:V24)",
    },
  };
}

/** S6 Tasas: Ke referenciada en FCE C2 = Tasas!D8 */
export function computeSheetS6Tasas(rf, rmRf, beta, riesgoPais = 0) {
  const ke = round(rf + beta * rmRf + riesgoPais, 4);
  return {
    source: "S6 → Tasas",
    ke,
    formula: "=Rf + Beta*(Rm-Rf) + RiesgoPais",
    cellRef: "D8",
  };
}

export function closeEnough(a, b, tolerance = 1.5) {
  if (a == null || b == null || Number.isNaN(a) || Number.isNaN(b)) return false;
  return Math.abs(a - b) <= tolerance;
}

// Re-exports for amortization table (S8 filas 48-52)
export function buildAmortizationTable(principal, rate, periods) {
  const cuota = round(-excelPMT(rate, periods, principal));
  const rows = [];
  let saldo = principal;
  for (let p = 1; p <= periods; p++) {
    const interes = round(saldo * rate);
    const amort = round(cuota - interes);
    saldo = round(saldo - amort);
    rows.push({
      periodo: p,
      capital: round(saldo + amort),
      amortizac: amort,
      interes,
      cuota,
      saldoFin: Math.max(0, saldo),
    });
  }
  return { cuota, rows, formula: "=-PMT(i, n, Prestamo)" };
}
