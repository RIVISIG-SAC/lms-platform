import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

/**
 * Neon puede cerrar una conexión del pool que el cliente todavía cree viva
 * (compute suspendido, idle timeout, event loop bloqueado en dev). La consulta
 * que la toma falla con "Connection terminated unexpectedly" aunque la base
 * esté bien, así que se reintenta una vez con una conexión nueva.
 *
 * Solo lecturas: una escritura cortada a mitad pudo haberse aplicado, y
 * repetirla podría duplicar un cobro o una inscripción.
 */
const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

const TRANSIENT_CONNECTION_ERROR =
  /Connection terminated|connection is closed|Client has encountered a connection error|ECONNRESET|socket hang up|P1001|P1017/i;

export function isTransientConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: unknown }).code;
  return TRANSIENT_CONNECTION_ERROR.test(`${typeof code === "string" ? code : ""} ${error.message}`);
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL must be set");
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    name: "retry-transient-reads",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          try {
            return await query(args);
          } catch (error) {
            if (!READ_OPERATIONS.has(operation) || !isTransientConnectionError(error)) throw error;
            console.warn(`[prisma] conexión cortada en ${model}.${operation}, reintentando una vez`);
            return query(args);
          }
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
