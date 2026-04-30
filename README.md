# LMS Platform

Plataforma de gestión de aprendizaje (Learning Management System) construída con tecnologías modernas. Permite la creación y gestión de cursos, inscripciones de estudiantes, seguimiento de progreso, exámenes, emisión de certificados y pagos integrados.

---

## Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-------------|---------|
| Framework | Next.js | 16.2.4 |
| Lenguaje | TypeScript | 5.x |
| Base de datos | PostgreSQL (Neon) | - |
| ORM | Prisma | 7.7.0 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS | 4 |
| Componentes | shadcn/ui | 4.3.0 |
| Autenticación | JWT (jose) | 6.2.2 |
| Pagos | Culqi | - |
| Email | Resend | 6.12.0 |
| PDF | @react-pdf/renderer | 4.5.1 |
| Validación | Zod | 4.3.6 |

---

## Arquitectura

La aplicación sigue la arquitectura del **Next.js App Router** con las siguientes características:

- **Server Actions**: Manejo de mutaciones de datos del lado del servidor
- **Route Groups**: Organización de rutas por funcionalidad
  - `(dashboard)` - Áreas autenticadas (student, instructor, admin)
  - `(public)` - Páginas públicas
  - `(auth)` - Autenticación
  - `api` - Endpoints de API

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                        │
├─────────────┬─────────────┬─────────────┬────────────────┤
│  (dashboard)│   (public)  │    (auth)   │     api/       │
│  - student  │  - cursos   │  - login    │  - payments    │
│  - instructor│  - about   │  - registro │  - certificates│
│  - admin    │  - servicios│             │                │
└─────────────┴─────────────┴─────────────┴────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Prisma     │
                    │  PostgreSQL │
                    └─────────────┘
```

---

## Primeros Pasos

### Requisitos Previos

- Node.js 20+
- pnpm (recomendado) o npm/yarn
- Cuenta de Neon para PostgreSQL
- Cuenta de Culqi para pagos
- Cuenta de Resend para emails

### Instalación

```bash
# Clonar el repositorio
git clone <repositorio>
cd lms-platform

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
```

### Configuración

Editar `.env.local` con las credenciales:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT
JWT_SECRET="tu-clave-segura-de-32-caracteres"

# Culqi
CULQI_PUBLIC_KEY="pk_test_..."
CULQI_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CULQI_PUBLIC_KEY="pk_test_..."
```

### Base de Datos

```bash
# Generar cliente Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Poblar datos iniciales (opcional)
pnpm db:seed
```

### Iniciar Desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Estructura del Proyecto

```
lms-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Dashboard autenticado
│   │   ├── admin/         # Panel de administración
│   │   ├── instructor/    # Panel de instructor
│   │   └── student/       # Panel de estudiante
│   ├── (public)/          # Páginas públicas
│   ├── api/               # API routes
│   └── actions/           # Server Actions
├── components/            # Componentes React
│   ├── ui/                # Componentes shadcn/ui
│   └── student/           # Componentes específicos
├── lib/                   # Utilidades
│   ├── validations/       # Schemas Zod
│   ├── auth.ts            # Lógica de autenticación
│   ├── email.ts           # Envío de emails
│   └── culqi.ts           # Integración de pagos
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos iniciales
└── .agents/skills/        # Agentes de IA
```

---

## Características Principales

###👥 Gestión de Usuarios
- Roles: Estudiante, Instructor, Administrador
- Autenticación con JWT
- Verificación de email
- Perfiles personalizables

###📚 Gestión de Cursos
- Módulos y capítulos organizados
- Videos Vimeo embebidos
- Recursos por capítulo
- Niveles: Principiante, Intermedio, Avanzado

###📝 Inscripciones
- Catálogo de cursos
- Progreso de estudiantes
- Estados: Pendiente, Pagado, Completado, Expirado

###📊 Exámenes
- preguntas de opción múltiple
- Múltiples intentos
- Calificación automática

###🏆 Certificados
- Generación automática al completar curso
- Descarga en PDF
- Verificación por código único

###💳 Pagos
- Integración con Culqi
- Pago de cursos
- Pago de certificados

---

## Estándares de Código

El proyecto sigue estas reglas obligatorias:

- **TypeScript**: Tipado estricto, sin `any`
- **Server Actions**: Mutaciones de datos en el servidor
- **Zod**: Validación de formularios
- **shadcn/ui**: Componentes UI accesibles
- **Naming**: camelCase para variables, PascalCase para componentes

### Sistema de Agentes (Skills)

El proyecto utiliza agentes especializados en `.agents/skills`. Antes de responder, Claude DEBE seleccionar el agente más especializado disponible:

| Tarea | Agente |
|-------|--------|
| Componentes UI | `shadcn`, `tailwind-css-patterns` |
| Next.js/React | `next-best-practices`, `next-cache-components` |
| Backend | `nodejs-backend-patterns` |
| Base de datos | `prisma-client`, `prisma-cli` |
| TypeScript | `typescript-advanced-types` |
| SEO | `seo` |

**Ejemplo de uso**:
```
@prisma-client crea una query optimizada
@shadcn crea un componente modal accesible
```

---

## Scripts Disponibles

```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Construir para producción
pnpm start        # Iniciar servidor de producción
pnpm lint         # Verificar código
pnpm db:seed      # Poblar base de datos
pnpm db:studio    # Abrir Prisma Studio
```

---

## Contribuir

1. Crear branch desde `main`: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar siguiendo los estándares del proyecto
3. Usar los agentes especializados para tareas específicas
4. Commitear cambios con mensajes descriptivos
5. Crear Pull Request

### Documentación de Referencia

- [AGENTS.md](./AGENTS.md) - Lista de agentes disponibles
- [CLAUDE.md](./CLAUDE.md) - Configuración del sistema Claude

---

## Licencia

Privado - Todos los derechos reservados