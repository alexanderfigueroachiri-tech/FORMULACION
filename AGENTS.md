# AGENTS.md — Contexto para agentes IA

Este archivo orienta a **Cursor Cloud Agents**, Copilot u otros agentes que continúen el trabajo sin el historial de chat original.

## Objetivo del proyecto

Ayudar al usuario a **aprobar el examen de BEG06** (Formulación y Evaluación de Proyectos, UNI) mediante:

- Aprendizaje progresivo de ~4 horas en módulos
- Práctica tipo Excel en el navegador/móvil
- Validación de cálculos contra los archivos reales del curso en `BASE/`

## Estado actual (actualizar al avanzar)

| Componente | Estado |
|------------|--------|
| PWA en `app/` | ✅ Funcional — 7 módulos, grids interactivos (M3 CAPM corregido) |
| Análisis Excel | ✅ `data/workbook_analysis.json` |
| Curriculum | ✅ `data/curriculum.json` + copia en `app/data/` |
| GitHub + Pages | ✅ Repo `FORMULACION` publicado y desplegado |
| PDF Depreciación I/II | ⚠️ En BASE pero no parseados al curriculum |
| PPT Cap VI/VII | ⚠️ No parseados (error python-pptx en algunos) |
| S8 `.xls` fórmulas | ⚠️ Solo valores leídos; lógica replicada manualmente (cuota S8 corregida jun 2026) |

## Archivos clave — leer primero

1. `README.md` — cómo correr y desplegar
2. `data/curriculum.json` — ruta pedagógica completa
3. `app/js/excelModel.js` — **motor idéntico a Excel** (S6 FCE, S8, S7 VAN)
4. `app/js/worksheets.js` — hojas de práctica con fórmulas literales
5. `app/data/excel_formulas_exact.json` — fórmulas extraídas de BASE/
6. `BASE/` — material fuente del profesor

## Cómo ejecutar localmente

```bash
cd app && python -m http.server 8080
```

Requiere servir por HTTP (módulos ES + fetch de curriculum.json).

## Convenciones de código

- **Frontend**: vanilla JS ES modules, sin build step (npm no disponible en entorno original)
- **Scripts Python**: Python 3.10+ con `openpyxl`, `xlrd`, `python-pptx`, `python-docx`
- **Ruta Python en Windows del usuario**: `C:\Users\alexd\AppData\Local\Programs\Python\Python310\python.exe`
- No commitear secretos; `BASE/` puede ser grande — considerar `.gitignore` selectivo

## Lógica financiera validada (no cambiar sin revisar Excel)

### Flujo económico (S8 sin préstamo)
```
Ingresos - Gastos - Dep = UAII
Impuestos = max(0, UAII) × 0.30
Neto = UAII - Impuestos
Flujo fondos = Neto + Depreciación
Inversión P0 = -1240, VR P3 = +40
```

### Flujo financiero (S8 con préstamo 500, i=10%)
```
P0: Flujo = -1240 + 500 = -740
Intereses = Saldo × 0.10
UAI = UAII - Intereses
(misma cadena impuestos y FF, más cuotas de préstamo en flujo)
VANF ≈ 62.35, TIRF ≈ 16.5% (valores S8)
```

### VAN en Excel vs JS
Excel `=NPV(tasa, P1:Pn)` **no incluye P0**. En JS `npv()` sí incluye flows[0]. Documentar al usuario.

### CAPM (S6 hoja Tasas)
```
Ke = Rf + Beta × (Rm-Rf) + RiesgoPaís
Rf=0.0315, Rm-Rf=0.0307, Beta=1.4 (ejemplo)
```

## Tareas prioritarias para el siguiente agente

1. **Parsear PDFs Depreciación** → enriquecer M1 con contenido real
2. **Agregar worksheets S7** (eólico, telecom rural) desde `S7 Ejercicios...xlsx`
3. **Modo examen** — timer 2h, preguntas del `.docx`
4. **Icono PWA** — generar `app/icons/icon-192.png`
5. **CI/GitHub Pages** — workflow que publique `app/`
6. **Tests** — unit tests para `engine.js` (NPV/IRR vs Excel known values)

## Regenerar datos desde Excel

```bash
python scripts/analyze_workbooks.py   # → data/workbook_analysis.json + curriculum.json
python scripts/extract_materials.py   # → materials_report.json (inventario completo)
```

Después copiar curriculum a app:
```bash
cp data/curriculum.json app/data/curriculum.json
```

## Usuario

- Estudia BEG06, examen próximo
- Quiere aprender desde PC y **teléfono**
- Material en español, enfoque Excel práctico
- Curso: UNI, Facultad de Ingeniería Eléctrica y Electrónica

## Preguntas frecuentes del dominio

- **VANE vs VANF**: económico (sin efecto financiamiento en flujo) vs financiero (con deuda)
- **Degravamen**: no aparece en BASE actual; no implementado
- **Regla 5%**: si VAN de alternativas difieren <5%, equivalentes (docx examen)

## Contacto con el usuario

Si falta contexto, preguntar:
1. ¿Qué módulos ya dominó? (progress en localStorage `beg06_progress_v1`)
2. ¿El examen es parcial o final?
3. ¿URL del repo remoto para push?

---

*Última actualización por agente: junio 2026*
