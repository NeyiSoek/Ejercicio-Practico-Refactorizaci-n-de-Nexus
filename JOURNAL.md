# JOURNAL

## 2026-05-24 16:30
- Me puse a revisar el codigo legacy para entender por donde empezar.
- Archivos que revise primero: app.py, logic, db.py y seed_data.sql.
- Cosas que vi de entrada: SQL armado con string, fechas mezcladas en distintos formatos, mucho estado global y todo muy acoplado.
- Decidi empezar solo con modulos clave para no romper todo de golpe: auth, catalog, sales y reports.

## 2026-05-24 16:50
- Arme estructura de monorepo con workspaces: apps/api, apps/web y packages/contracts.
- Mantuve SQLite y el seed tal cual, no le movi a eso.
- Lo hice asi porque queria que corriera en limpio sin pelearme con una migracion de DB.

## 2026-05-24 17:20
- Levante API en Node + TS separando por modulos (cada uno con su capa).
- Meti validaciones con Zod para no recibir payloads raros.
- Tambien deje tipos compartidos para front y back.
- Me tope con lo de LEGACY_A que antes dependia de trigger SQL. Lo pase al dominio de ventas para que quede claro en codigo y no escondido en DB.

## 2026-05-24 17:50
- Ya con API andando, hice el front en React + TS.
- Use estado con useReducer y useState segun el caso.
- Agregue validacion de formularios y estados de carga/error/vacio para que no se vea incompleto.
- Pantallas en alcance: login, catalogo, ventas y reportes.
- De accesibilidad al menos deje lo basico: labels, aria-live y foco visible.

## 2026-05-24 18:20
- Hice tests en API para login y calculo de precios (descuentos + IVA).
- Corri validaciones generales: npm run typecheck, npm run test y npm run build.
- Todo quedo pasando.

## 2026-05-24 19:00
- Cierre de docs: README y 3 ADRs.
- Se aclaro el nombre oficial del entregable: JOURNAL.md.
- Se dejo README alineado con ese nombre para evitar confusion en revision.

## Prompt History (historial aproximado de trabajo)
1. Necesito migrar este proyecto legacy a fullstack typescript sin romper el seed, por donde empiezo?
2. Dame una estructura de monorepo simple con apps/api y apps/web
3. Como separo capas domain application infrastructure presentation en node ts?
4. Ayudame a mapear este app.py viejo a modulos auth catalog sales reports
5. Me esta marcando warning por moduleResolution node10 deprecado en tsconfig, como puedo arreglar esto?
6. Me da error de rootDir con tests fuera de src en TypeScript, como puedo arreglar esto?
7. No me encuentra @legacy-nexus/contracts desde la api notas algo que me haga falta configurar en package y tsconfig?
8. Dame ejemplos de validaciones con zod para login y create sale
9. Como haria un test con Vitest para el calculo de descuentos por volumen + iva?
10. Como manejo loading error empty state en react sin usar librerias extras?
11. Que tan basica puede ser la accesibilidad minima para una prueba tecnica rapida?
