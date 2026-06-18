# Informe UX — Simulación estudiante sin Excel (M1 + M2)

**Fecha:** 18 jun 2026  
**Método:** Lectura de `INSPECTOR.md`, `curriculum.json`, `app.js`, `cellLegend.js`, `formulaGrid.js` + recorrido paso a paso como estudiante en móvil, sin Excel ni PDFs abiertos.

## Recorrido simulado (resumen)

**M1:** Home muestra jerga avanzada (Vaf/VAN) antes de tiempo → paso fórmula con tips humanos + leyenda ✅ → grid depreciación con tap-to-ref (descubrible solo si lee el hint).

**M2:** Concepto cadena FCE + leyenda ✅ → grid con 5 fórmulas; D5 oculta pero en fórmula esperada; tip de VAN prematuro.

## Qué se corrigió (antes de este informe)

- **Tips humanos:** `{ human, excel }` vía `renderHumanTips()` — concepto arriba, Excel debajo
- **Leyendas:** tabla **Qué es → Celda Excel → Valor/fórmula** + archivo fuente
- **Depreciación:** I5 = Capital, L6 = VR, J6/D8 con contexto
- **FCE M2:** leyenda D6–D14 fila por fila
- **Grids:** columna "Qué es" primero, `excelRef` bajo fórmulas, hints por hoja

## Seguimiento post-informe (18 jun 2026)

- Guardado este informe en `docs/UX_REPORT.md`
- **P0-2:** overlay onboarding primer grid (`beg06_grid_onboarded`)
- **P0-3:** convenciones VAN/Vaf colapsadas en home hasta M4
- **P1-1:** tip VAN eliminado de M2 (queda en M4)
- **P1-2:** `objectives` visibles en tarjetas y lección
- **P1-3:** celda D5 visible en grid FCE con nota "0 en año 1"

## Issues restantes

### P0

| # | Problema |
|---|----------|
| P0-1 | M1: PDFs de depreciación no parseados — solo celdas S6, sin teoría |
| P0-2 | Primer grid: tap-to-ref no autoexplicativo (sin onboarding) |
| P0-3 | Home: "Convención del curso" con Vaf/VAN/NPV antes de M4 |

### P1

| # | Problema |
|---|----------|
| P1-1 | M2 tip VAN/Vaf-I prematuro (pertenece a M4) |
| P1-2 | `objectives` del curriculum no se muestran en UI |
| P1-3 | D5 oculta en grid FCE pero en fórmula `=D13-D8+D5` |
| P1-4 | 5 fórmulas seguidas sin orden ni progreso parcial |
| P1-5 | Pasos concept/formula avanzan sin validar comprensión |
| P1-6 | Tablas 3 columnas incómodas en móvil (~360px) |

### P2

| # | Problema |
|---|----------|
| P2-1 | Tildes inconsistentes en UI |
| P2-2 | Validación acepta valor cercano aunque fórmula sea incorrecta |
| P2-3 | Quick links a grids saltan flujo guiado |
| P2-4 | Sin miniatura/layout del Excel real |
| P2-5 | Leyenda M1 duplicada (fórmula + grid) |

## 5 mejoras concretas siguientes

1. **Overlay primer grid** (localStorage): tap celda morada → barra abajo → tap referencias
2. **Paso concept M1** con contenido de PDF Depreciación
3. **Reordenar tips/home:** ocultar convenciones hasta M3; mover tip VAN a M4; mostrar `objectives`
4. **Mostrar D5 en grid FCE** o anotar "D5=0 en periodo 1" en hint
5. **Mini mapa visual Excel** (filas 6–14, columna D) para M2

## Conclusión

Criterios `INSPECTOR.md` para M1/M2: **cumplidos** en tips, leyendas y celdas con nombre. Huecos principales: teoría PDF, onboarding interactivo y ruido pedagógico en home.
