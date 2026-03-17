import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default users - CHANGE THESE PASSWORDS
  const password1 = await hash("changeme123", 12);
  const password2 = await hash("changeme123", 12);

  await prisma.user.upsert({
    where: { email: "boss@pipeline.ai" },
    update: {},
    create: {
      email: "boss@pipeline.ai",
      name: "Boss",
      passwordHash: password1,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "partner@pipeline.ai" },
    update: {},
    create: {
      email: "partner@pipeline.ai",
      name: "Partner",
      passwordHash: password2,
      role: "admin",
    },
  });

  console.log("✅ Seeded 2 users");
  console.log("   boss@pipeline.ai / changeme123");
  console.log("   partner@pipeline.ai / changeme123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
