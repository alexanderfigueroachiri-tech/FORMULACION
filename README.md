# BEG06 — Formulación y Evaluación de Proyectos

App de aprendizaje progresivo para el curso **BEG06** (UNI). Practica flujos de caja, depreciación, CAPM, VAN/TIR y financiamiento como en los Excel del curso, desde el navegador o el teléfono (PWA).

## Inicio rápido

```bash
# Opción 1: abrir directamente (algunos navegadores bloquean módulos ES)
# Usar un servidor local:

cd app
python -m http.server 8080
# Abrir http://localhost:8080 en PC o teléfono (misma red WiFi)
```

En el **teléfono**: abre la URL → menú del navegador → **“Añadir a pantalla de inicio”** (instala la PWA offline).

## Estructura del repo

```
formulacion/
├── BASE/                    # Material del curso (PDF, PPT, Excel) — NO commitear si es pesado
├── app/                     # PWA de aprendizaje (servir esta carpeta)
│   ├── index.html
│   ├── js/                  # engine, worksheets, app
│   ├── css/
│   └── data/curriculum.json # Ruta de 7 módulos (~4h)
├── data/
│   ├── curriculum.json      # Fuente del curriculum
│   └── workbook_analysis.json  # Análisis de fórmulas Excel
├── scripts/
│   ├── analyze_workbooks.py # Regenera curriculum + análisis
│   └── extract_materials.py # Inventario de BASE/
├── AGENTS.md                # Contexto para agentes IA (Cursor Cloud, etc.)
└── README.md
```

## Metodología pedagógica

1. **Concepto** — teoría mínima alineada a Cap. V–VII
2. **Tip del coach** — consejos tipo profesor
3. **Práctica Excel** — hojas interactivas con validación
4. **Validación** — celdas verificadas contra lógica de S6/S7/S8

### Módulos (7, ~4 horas)

| # | Tema | Fuente |
|---|------|--------|
| M1 | Depreciación | Cap. V PDF |
| M2 | FCE | S6, Cap. VI |
| M3 | CAPM + riesgo país | S6 hoja Tasas |
| M4 | VAN / TIR | S7, Cap. VII |
| M5 | Financiamiento + amortización | S8 |
| M6 | Escenarios | S8, Aplicaciones |
| M7 | Integrador examen | docx + solucionario PC |

## Análisis Excel

Los worksheets en `app/js/worksheets.js` replican cadenas de celdas validadas:

- **FCE**: `UAII = Ing - Gastos - Dep` → `Imp = UAII × 30%` → `FF = Neto + Dep`
- **Amortización**: `Cuota = PMT(i,n,-P)` → `Interés = Saldo × i` → `Amort = Cuota - Int`
- **VAN**: flujos S8 `[-1240, 435, 575, 580]` con COK 12%
- **CAPM**: `Ke = Rf + β(Rm-Rf) + RiesgoPaís` (valores hoja Tasas S6)

Regenerar análisis:

```bash
python scripts/analyze_workbooks.py
```

## Estado actual (jun 2026)

| Qué | Estado |
|-----|--------|
| App local | ✅ Lista en `app/` |
| Git commit | ⚠️ Aún sin primer commit en tu PC |
| GitHub remoto | ⚠️ Repo `FORMULACION` no publicado (404) |
| Nube / URL pública | ❌ No — hay que hacer push + activar Pages |

## Cómo usar **ahora mismo** desde el móvil (sin nube)

1. En la PC, abre terminal en el proyecto:
   ```bash
   cd app
   python -m http.server 8080
   ```
2. Averigua la IP local de la PC (ej. `192.168.1.50`).
3. En el móvil (misma WiFi), abre: `http://192.168.1.50:8080`
4. Menú del navegador → **Añadir a pantalla de inicio** (PWA offline).

> El progreso y fórmulas desbloqueadas quedan en **localStorage del navegador** de ese dispositivo — no se sincronizan solos entre PC y móvil hasta que haya cuenta/nube.

## Publicar en la nube (una vez)

```bash
git add .
git commit -m "feat: PWA BEG06 con curriculum, grids y fórmulas desbloqueables"
git branch -M main
git remote add origin https://github.com/alexanderfigueroachiri-tech/FORMULACION.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Build and deployment → GitHub Actions**.  
La URL quedará tipo: `https://alexanderfigueroachiri-tech.github.io/FORMULACION/`

El workflow `.github/workflows/pages.yml` ya está preparado (publica la carpeta `app/`).

## Despliegue (GitHub Pages / Netlify)

- **GitHub Pages**: push a `main` + activar Pages con GitHub Actions (ver arriba)
- **Netlify**: publish directory = `app`

## Git

```bash
git init
git add .
git commit -m "feat: PWA de aprendizaje BEG06 con curriculum y worksheets"
git remote add origin <tu-repo>
git push -u origin main
```

## Pendiente / mejoras

- [ ] Extraer texto de PDFs Depreciación I/II al curriculum
- [ ] Más ejercicios de S7 (eólico, telecom) como worksheets
- [ ] Modo examen con temporizador
- [ ] Icono PWA 192×192 en `app/icons/`
- [ ] Parsear fórmulas de `.xls` S8 con herramienta que lea BIFF

## Licencia

Material académico UNI — uso personal de estudio.
