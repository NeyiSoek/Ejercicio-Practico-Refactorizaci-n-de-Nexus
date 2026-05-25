# ADR 0003: Shared Contracts + Runtime Validation

## Context
En el legacy, frontend y backend se hablaban con objetos sin contrato claro.

Eso hacia facil meter regresiones cuando se cambiaba un campo y nadie se daba cuenta hasta runtime.

## Options Considered
1. Contratos no compartidos, cada app define tipos por separado.
2. OpenAPI codegen completo desde el sprint 1.
3. Paquete compartido de contratos TypeScript + validacion runtime con Zod en boundaries HTTP.

## Decision
Se adopto la opcion 3.

Se dejo packages/contracts como fuente de tipos compartidos y se agrego validacion con Zod en entradas de API y formularios principales.

## Consequences
- Corto plazo: menos diferencias entre lo que espera el backend y lo que manda el frontend.
- Corto plazo: errores de input se detectan antes y con mensajes mas claros.
- Largo plazo: deja camino para migrar despues a OpenAPI si se necesita.
- Largo plazo: si aparecen clientes externos, hay que versionar contratos con mas control.
