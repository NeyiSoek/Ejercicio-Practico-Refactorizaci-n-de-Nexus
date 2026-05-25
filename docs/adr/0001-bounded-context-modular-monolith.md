# ADR 0001: Modular Monolith with Bounded Contexts

## Context
El proyecto legacy sufria de una mezcla de: rutas HTTP, SQL, logica de negocio y estado global por lo tanto se necesita refactorizar
para poder trabajar de manera mas manejable la aplicación.

## Options Considered
1. Seguir con Flask y solo hacer limpieza incremental.
2. Ir directo a microservicios (auth, catalog, sales, reports).
3. Pasar a monolito modular en TypeScript por contextos y capas internas.

## Decision
Se eligio la opcion 3.

Se implemento un monolito modular en Node + TypeScript, separado por contextos (auth, catalog, sales, reports) y por capas (domain, application, infrastructure, presentation).

## Consequences
- Corto plazo: mucho menos riesgo que romper todo con microservicios desde ya.
- Corto plazo: mejora mantenimiento porque cada modulo tiene limites mas claros.
- Corto plazo: seguimos con un solo proceso y una sola base de datos.
- Largo plazo: se vuelve mas facil separar modulos a servicios si luego hace falta.
