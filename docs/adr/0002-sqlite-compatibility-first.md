# ADR 0002: SQLite Compatibility-First Persistence

## Context
El legacy ya venia con SQLite y con seed_data.sql como base obligatoria.

En este sprint el objetivo principal era mejorar arquitectura y contratos, no cambiar toda la persistencia de golpe.

## Options Considered
1. Migrar inmediatamente a PostgreSQL + migraciones completas.
2. Mantener SQLite para compatibilidad, con inicializacion automatica desde seed.
3. Crear capa dual SQLite/PostgreSQL en el mismo sprint.

## Decision
Se eligio la opcion 2.

Se mantuvo SQLite en esta fase y se encapsulo el acceso en repositorios para que luego sea mas simple migrar a PostgreSQL.

## Consequences
- Corto plazo: el proyecto levanta facil en maquina limpia.
- Corto plazo: se reduce riesgo de romper datos o comportamiento heredado.
- Largo plazo: para pasar a PostgreSQL se necesita un ADR nuevo y plan de migraciones.
- Largo plazo: siguen temporalmente algunas deudas del schema legacy (ejemplo: sales.total guardado como texto).
