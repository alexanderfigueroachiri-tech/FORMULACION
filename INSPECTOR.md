# Inspector de UX — instrucciones para agentes

## Propósito

Este rol existe porque la app debe ser **entendible sin tener el Excel abierto al lado**. Un agente inspector simula a un estudiante confundido y reporta qué no se entiende.

## ¿Necesitas worktree o rama git?

**No es obligatorio.** Opciones:

| Opción | Cuándo usarla |
|--------|----------------|
| **Mismo repo, mismo chat** | Inspector lee código + curriculum + prueba en navegador |
| **Nueva conversación + `INSPECTOR.md`** | Agente cloud sin historial; lee este archivo y `AGENTS.md` |
| **Rama `inspector/feedback`** | Solo si quieres commits de informes sin mezclar con `main` |
| **Git worktree** | Solo si dos agentes editan archivos distintos en paralelo |

Recomendación: **misma rama, agente en modo lectura** que devuelve informe en markdown. Tú o otro agente aplica fixes.

## Cómo lanzar el inspector (Cursor)

Prompt sugerido:

```
Lee INSPECTOR.md y AGENTS.md. Abre app/ en navegador (python -m http.server 8080).
Recorre M1 y M2 como estudiante sin Excel. Reporta:
- Pantallas donde solo hay celdas (D6) sin concepto en español
- Tips crípticos
- Pasos que no se pueden completar en móvil
- Prioridad P0/P1/P2
No modifiques código; solo informe en docs/UX_REPORT.md
```

## Criterios de aprobación UX

1. **Ningún tip** debe mostrar solo `D6+D7+D8` sin decir "Ingresos + Egresos + Dep".
2. **Cada celda** en hoja interactiva tiene columna "Qué es" antes de "Celda Excel".
3. **Leyenda visible** antes de practicar (tabla concepto → celda → valor).
4. **Archivo fuente** citado (`S6 → hoja FCE`).
5. Fórmula Excel va **debajo** del concepto, no al revés.

## Archivos a revisar

- `data/curriculum.json` — tips y steps
- `app/js/cellLegend.js` — mapas de celdas
- `app/js/formulaGrid.js` — hojas interactivas
- `app/js/app.js` — render de lecciones

## Historial de hallazgos (actualizar)

| Fecha | Hallazgo | Estado |
|-------|----------|--------|
| 2025-06 | Tips mostraban UAII = D6+D7+D8 sin explicar qué es D6 | Corregido: tips humanos + leyenda |
| 2025-06 | Depreciación mostraba I5 y 40 sin contexto | Corregido: Capital (I5), VR (L6) |

## Próxima revisión

- [ ] Módulo S8 flujo completo con leyenda fila por fila
- [ ] Modo "ver miniatura del Excel" (screenshot o tabla visual)
