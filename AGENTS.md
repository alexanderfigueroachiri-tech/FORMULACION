# AGENTS.md — Contexto para agentes IA

Este archivo orienta a **Cursor Cloud Agents**, Copilot u otros agentes que continúen el trabajo sin el historial de chat original.

## Cursor Cloud specific instructions

Entorno del VM (Node 22 y Python 3.12 ya vienen instalados; el update script instala `openpyxl` y `xlrd`). Notas no obvias:

- **Servidor / app**: la app es estática (vanilla JS ES modules, sin build step). Servir SIEMPRE por HTTP: `cd app && python3 -m http.server 8080`. Usar `python3` (no existe el alias `python` en el VM, a diferencia del README). Abrir páginas con `file://` rompe los módulos ES y el `fetch` de `data/curriculum.json`.
- **Tests**: `node --test tests/financial.test.mjs` desde la raíz. No requiere instalar dependencias (usa el test runner nativo de Node) y valida el motor financiero contra valores S6/S7/S8.
- **Lint / build**: no hay configuración de lint (no hay `package.json` ni ESLint) ni paso de build. No inventar comandos de lint/build.
- **Scripts de datos** (`scripts/analyze_workbooks.py`, `scripts/extract_excel_formulas.py`): solo necesarios para regenerar datos desde `BASE/`; requieren `openpyxl` + `xlrd`. **Ojo**: al correrlos reescriben archivos versionados (`data/curriculum.json`, `data/workbook_analysis.json`, `data/excel_formulas_exact.json`). Si solo verificas que corren, restaura con `git checkout -- data/`. Recuerda copiar `data/curriculum.json` → `app/data/curriculum.json` si cambias el curriculum de verdad.

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
| Git remoto | ✅ `origin` → github.com/alexanderfigueroachiri-tech/FORMULACION |
| GitHub Pages | ✅ https://alexanderfigueroachiri-tech.github.io/FORMULACION/ |
| Fórmulas desbloqueables | ✅ `app/js/skills.js` + localStorage |
| Tablita 2 cols (Concepto \| Valor) | ✅ M1/M2 en `formulaGrid.js` |
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

1. **Parsear PDFs Depreciación** → enriquecer M1 con contenido real (no solo celdas S6)
2. **Agregar worksheets S7** (eólico, telecom rural) desde `S7 Ejercicios...xlsx`
3. **Modo examen** — timer 2h, preguntas del `.docx`
4. **Extender tablita 2×N** a M4/M5 y casos Word (6 escenarios del docx)
5. **Tests** — unit tests para `engine.js` (NPV/IRR vs Excel known values)
6. ~~CI/GitHub Pages~~ — hecho (`.github/workflows/pages.yml`, rama `main`)

## Brief para agente (usuario abre Cursor desde el móvil)

Copia esto al iniciar chat si no hay historial:

---

**Proyecto:** PWA BEG06 — Formulación y Evaluación de Proyectos (UNI).  
**Repo:** https://github.com/alexanderfigueroachiri-tech/FORMULACION  
**App en producción:** https://alexanderfigueroachiri-tech.github.io/FORMULACION/

**Usuario:** Alexander, examen BEG06 próximo. Estudia desde **teléfono** (PWA) y tunea desde **laptop + Cursor**. No quiere jerga Excel prematura — tips en español con **concepto + fórmula**, celdas solo en práctica opcional.

**Stack:** vanilla JS en `app/`, sin npm. Curriculum en `data/curriculum.json` → **siempre copiar a** `app/data/curriculum.json` antes de push. Deploy automático: push a `main` → GitHub Actions → Pages.

**Progreso del usuario:** localStorage `beg06_progress_v2` (pasos) y fórmulas en `progress.unlockedSkills`. **No sincroniza** entre dispositivos.

**Rama de trabajo:** `main` = producción. Crear `dev` para experimentos; merge a `main` cuando esté listo.

**Archivos que más tocarás:** `data/curriculum.json`, `app/js/formulaGrid.js`, `app/js/cellLegend.js`, `app/js/skills.js`, `app/js/app.js`.

**Reglas UX (INSPECTOR.md):** ningún tip solo con `D6+D7+D8` sin explicar conceptos. Validar contra Excel en `BASE/` (S6, S7, S8).

**Preguntar al usuario:** módulos completados, si el examen es parcial/final, qué escenario del Word practicar.

---

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
1. ¿Qué módulos ya dominó? (localStorage `beg06_progress_v2`)
2. ¿El examen es parcial o final?
3. ¿Qué escenario del Word quiere practicar?

---

*Última actualización por agente: junio 2026*
