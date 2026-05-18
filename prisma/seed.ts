import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL must be set");

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const COURSE_TITLE = "Fundamentos ISO 9001:2015 - Sistemas de Gestión de la Calidad";
const DAYS_180_MS = 180 * 24 * 60 * 60 * 1000;
const DAYS_90_MS = 90 * 24 * 60 * 60 * 1000;

async function seedUsers() {
  const passwordExpiresAt = new Date(Date.now() + DAYS_90_MS);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cursospro.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@cursospro.com",
      passwordHash: await bcrypt.hash("Admin1234!", 12),
      role: "ADMIN",
      passwordExpiresAt,
      emailVerified: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "estudiante@cursospro.com" },
    update: {},
    create: {
      name: "Juan Pérez",
      email: "estudiante@cursospro.com",
      passwordHash: await bcrypt.hash("Student1234!", 12),
      role: "STUDENT",
      passwordExpiresAt,
      emailVerified: true,
    },
  });

  return { admin, student };
}

async function seedCourse() {
  const existing = await prisma.course.findFirst({ where: { title: COURSE_TITLE } });
  if (existing) {
    await prisma.course.delete({ where: { id: existing.id } });
  }

  return prisma.course.create({
    data: {
      title: COURSE_TITLE,
      description:
        "Programa formativo orientado a profesionales responsables de implementar, auditar y mantener Sistemas de Gestión de la Calidad conforme a la norma ISO 9001:2015. Incluye marco normativo, enfoque basado en procesos y auditoría interna.",
      price: "450.00",
      category: "Sistemas de Gestión",
      level: "INTERMEDIATE",
      durationHours: 24,
      published: true,
      thumbnailUrl: null,
      modules: {
        create: [
          {
            title: "Módulo 1 — Marco normativo y contexto de la organización",
            order: 1,
            chapters: {
              create: [
                {
                  title: "Introducción a la familia ISO 9000",
                  order: 1,
                  content:
                    "Visión general de las normas ISO 9000, 9001 y 9004. Evolución histórica y propósito de la estandarización en calidad.",
                  vimeoVideoId: "000000001",
                },
                {
                  title: "Contexto de la organización y partes interesadas",
                  order: 2,
                  content:
                    "Análisis de cláusula 4: comprensión del contexto, necesidades y expectativas de las partes interesadas.",
                  vimeoVideoId: "000000002",
                },
              ],
            },
          },
          {
            title: "Módulo 2 — Enfoque basado en procesos y liderazgo",
            order: 2,
            chapters: {
              create: [
                {
                  title: "Liderazgo y compromiso de la alta dirección",
                  order: 1,
                  content:
                    "Cláusula 5: responsabilidades de la alta dirección, política de calidad y asignación de roles.",
                  vimeoVideoId: "000000003",
                },
                {
                  title: "Enfoque basado en procesos y pensamiento basado en riesgos",
                  order: 2,
                  content:
                    "Identificación, interacción y control de procesos. Determinación de riesgos y oportunidades.",
                  vimeoVideoId: "000000004",
                },
              ],
            },
          },
          {
            title: "Módulo 3 — Evaluación del desempeño y auditoría interna",
            order: 3,
            chapters: {
              create: [
                {
                  title: "Seguimiento, medición, análisis y evaluación",
                  order: 1,
                  content:
                    "Cláusula 9.1: indicadores, satisfacción del cliente y análisis de datos para la toma de decisiones.",
                  vimeoVideoId: "000000005",
                },
                {
                  title: "Auditoría interna y revisión por la dirección",
                  order: 2,
                  content:
                    "Planificación, ejecución e informe de auditorías internas. Entradas y salidas de la revisión por la dirección.",
                  vimeoVideoId: "000000006",
                },
              ],
            },
          },
        ],
      },
      questions: {
        create: [
          {
            order: 1,
            text: "¿Cuál es el propósito principal de la norma ISO 9001:2015?",
            options: {
              create: [
                { text: "Establecer requisitos financieros obligatorios.", isCorrect: false },
                {
                  text: "Especificar requisitos para un Sistema de Gestión de la Calidad.",
                  isCorrect: true,
                },
                { text: "Definir estándares de seguridad industrial.", isCorrect: false },
                { text: "Regular la contratación de personal.", isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            text: "¿Qué cláusula aborda el contexto de la organización?",
            options: {
              create: [
                { text: "Cláusula 4", isCorrect: true },
                { text: "Cláusula 6", isCorrect: false },
                { text: "Cláusula 8", isCorrect: false },
                { text: "Cláusula 10", isCorrect: false },
              ],
            },
          },
          {
            order: 3,
            text: "El enfoque basado en procesos implica principalmente:",
            options: {
              create: [
                { text: "Documentar todas las tareas del personal operativo.", isCorrect: false },
                {
                  text: "Gestionar actividades interrelacionadas como un sistema coherente.",
                  isCorrect: true,
                },
                { text: "Reducir el número de procedimientos internos.", isCorrect: false },
                { text: "Eliminar controles redundantes en producción.", isCorrect: false },
              ],
            },
          },
          {
            order: 4,
            text: "¿Cuál es una entrada típica a la revisión por la dirección?",
            options: {
              create: [
                { text: "El presupuesto de marketing anual.", isCorrect: false },
                { text: "Los resultados de auditorías internas.", isCorrect: true },
                { text: "La lista de proveedores potenciales.", isCorrect: false },
                { text: "Los contratos laborales vigentes.", isCorrect: false },
              ],
            },
          },
          {
            order: 5,
            text: "El pensamiento basado en riesgos busca:",
            options: {
              create: [
                { text: "Evitar toda forma de cambio organizacional.", isCorrect: false },
                { text: "Sustituir por completo las acciones correctivas.", isCorrect: false },
                {
                  text: "Determinar riesgos y oportunidades para lograr resultados previstos.",
                  isCorrect: true,
                },
                { text: "Trasladar la responsabilidad a los auditores externos.", isCorrect: false },
              ],
            },
          },
        ],
      },
      faqs: {
        create: [
          {
            order: 0,
            question: "¿El certificado tiene validez internacional?",
            answer:
              "Sí. El certificado se emite con un código verificable único y está alineado a estándares ISO y referencias internacionales reconocidas por consultoras y organizaciones de auditoría.",
          },
          {
            order: 1,
            question: "¿Cuánto tiempo tengo para completar el curso?",
            answer:
              "Tienes 180 días de acceso desde el momento de la inscripción. Puedes avanzar a tu propio ritmo y retomar las clases cuando quieras dentro de ese periodo.",
          },
          {
            order: 2,
            question: "¿Cómo se obtiene el certificado?",
            answer:
              "Debes completar todos los módulos y aprobar la evaluación final. Tienes hasta 2 intentos para mantener la seriedad del proceso. Una vez aprobado, el certificado se genera automáticamente con tu nombre y un código de verificación único.",
          },
          {
            order: 3,
            question: "¿Qué métodos de pago aceptan?",
            answer:
              "Aceptamos pago con tarjeta de crédito o débito mediante una pasarela segura (Culqi). El cobro es único — no hay suscripciones ni renovaciones automáticas.",
          },
          {
            order: 4,
            question: "¿Puedo acceder desde el celular o tablet?",
            answer:
              "Sí. La plataforma es 100% responsive y funciona en navegadores modernos desde computadora, tablet o smartphone. Tu progreso se sincroniza automáticamente entre dispositivos.",
          },
        ],
      },
    },
  });
}

async function enrollStudent(userId: string, courseId: string) {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + DAYS_180_MS);

  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {
      status: "PAID",
      startDate,
      endDate,
      progressPercentage: 0,
    },
    create: {
      userId,
      courseId,
      status: "PAID",
      startDate,
      endDate,
      progressPercentage: 0,
    },
  });
}

async function main() {
  const { admin, student } = await seedUsers();
  const course = await seedCourse();
  const enrollment = await enrollStudent(student.id, course.id);

  console.log("Seed completado:");
  console.log("  Admin:", admin.email, "/ password: Admin1234!");
  console.log("  Student:", student.email, "/ password: Student1234!");
  console.log("  Curso:", course.title, `(id: ${course.id})`);
  console.log(
    "  Matrícula:",
    enrollment.id,
    `— válida hasta ${enrollment.endDate.toISOString().slice(0, 10)}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
