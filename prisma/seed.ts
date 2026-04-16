import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Admin1234!", 12);
  const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cursospro.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@cursospro.com",
      passwordHash,
      role: "ADMIN",
      passwordExpiresAt,
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
    },
  });

  console.log("Seed completado:");
  console.log("  Admin:", admin.email, "/ password: Admin1234!");
  console.log("  Student:", student.email, "/ password: Student1234!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
