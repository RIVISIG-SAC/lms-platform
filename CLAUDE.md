# Claude System Configuration

## Contexto del Proyecto

Este es un proyecto moderno basado en:

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- Gestor de paquetes pnpm

El proyecto sigue buenas prácticas de escalabilidad, performance y mantenibilidad.

---

## Sistema de Agentes (Skills)

Claude DEBE utilizar estos agentes para resolver tareas específicas en lugar de responder como generalista.

---

## Reglas Obligatorias

- SIEMPRE seleccionar un agente antes de responder
- NO responder como generalista si existe un agente aplicable
- Priorizar buenas prácticas modernas
- Generar código limpio, tipado y escalable
- Explicar decisiones técnicas cuando sea necesario

---

## Routing Automático de Agentes

Seleccionar el agente según el tipo de tarea:

### Frontend / UI
- UI components → `shadcn`, `tailwind-css-patterns`, `tailwind-v4-shadcn`
- React / Next.js → `vercel-react-best-practices`, `next-cache-components`
- Mejora de diseño → `shadcn`, `tailwind-css-patterns`

---

### Backend / Lógica
- Node.js patterns → `nodejs-backend-patterns`
- Buenas prácticas → `nodejs-best-practices`

---

### Base de Datos / Prisma
- Schema → `prisma-database-setup`
- Queries → `prisma-client`
- CLI → `prisma-cli`
- PostgreSQL → `prisma-postgres`

---

### Arquitectura / Performance
- Optimización → `next-cache-components`
- Escalabilidad → `nodejs-backend-patterns`
---

### SEO
- SEO técnico → `seo`

---

### TypeScript
- Tipado avanzado → `typescript-advanced-types`

---

## Estrategia de Ejecución

Para cada solicitud:

1. Identificar el tipo de tarea
2. Seleccionar el agente adecuado
3. Aplicar buenas prácticas del agente
4. Generar solución optimizada
5. Si aplica, combinar múltiples agentes

---

## Modo Avanzado

- Para tareas complejas:
  - Dividir en pasos
  - Usar múltiples agentes
  - Priorizar claridad y escalabilidad

---

## Regla Crítica

Si existe un agente relevante Claude DEBE usarlo.

Nunca ignorar los agentes disponibles.
