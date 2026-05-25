# Legacy Nexus Refactor - Sprint 1

En este sprint se hizo refacto del proyecto Legacy Nexus.

La idea fue pasar de un backend legacy muy acoplado a una base mas mantenible con TypeScript en backend y frontend, pero sin meter un cambio tan agresivo que rompa todo (por eso se mantuvo SQLite en esta etapa).

## Stack

- Backend: Node + TypeScript + Express
- Frontend: React + TypeScript + Vite
- Persistencia: SQLite (compatibilidad con dataset legacy)
- Validacion runtime: Zod
- Tests: Vitest (backend)

## Estructura del Monorepo

```text
apps/
  api/          # API Node/TS modular por contextos
  web/          # UI React/TS
packages/
  contracts/    # Contratos tipados compartidos
docs/
  adr/          # Architecture Decision Records
JOURNAL.md      # Bitacora cronologica + historial de prompts
```

## Como arrancar en maquina limpia

### Requisitos

- Node.js 20+
- npm 10+

### Instalacion

```bash
npm install
```

### Desarrollo

En una terminal:

```bash
npm run dev:api
```

En otra terminal:

```bash
npm run dev:web
```

### URLs

- API: http://localhost:5001
- Frontend: http://localhost:5173

## Validacion del sistema

Antes de cerrar cambios, se valido con los siguientes comandos:

```bash
npm run typecheck
npm run test
npm run build
```

## Alcance funcional incluido en este sprint

- Auth: login tipado.
- Catalogo: listado y busqueda de productos activos.
- Ventas: creacion de venta y consulta por usuario.
- Reportes: resumen mensual y total por periodo.

## Decisiones tecnicas clave

- Arquitectura modular por bounded contexts (`auth`, `catalog`, `sales`, `reports`) con capas `domain/application/infrastructure/presentation`.
- Dominio desacoplado de framework y SQL directo.
- Contratos compartidos en `packages/contracts`.
- Validacion de input en boundaries HTTP/UI con Zod.
- Compatibilidad-first con SQLite + seed existente sin editar `seed_data.sql`.

## Datos de prueba

Credenciales del dataset legacy:

- admin / 1234
- user / 1234

## Notas

- El legacy Python/Flask original permanece en el repo como referencia historica.
- Este sprint se enfoca en cimientos de arquitectura y dominios prioritarios.
- Modulos como `purchases`, `refunds`, `notifications`, etc., se dejan para siguientes iteraciones.


