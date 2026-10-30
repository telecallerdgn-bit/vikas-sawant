import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Production par Student Admin banata (ya uska password badalta) hai.
 * Email aur password code mein nahi, command se pehle PowerShell mein set karo:
 *
 *   $env:SADMIN_EMAIL="tumhara@email.com"
 *   $env:SADMIN_PASSWORD="ek-majboot-password"
 *   npm run db:prod:student-admin
 */
async function main() {
  const email = process.env.SADMIN_EMAIL?.trim().toLowerCase();
  const plain = process.env.SADMIN_PASSWORD;
  const name = process.env.SADMIN_NAME?.trim() || "Student Admin";

  if (!email || !plain) {
    throw new Error("SADMIN_EMAIL aur SADMIN_PASSWORD pehle set karo.");
  }
  if (plain.length < 10) {
    throw new Error("Password kam se kam 10 akshar ka rakho.");
  }

  const passwordHash = await bcrypt.hash(plain, 10);

  await prisma.studentAdmin.upsert({
    where: { email },
    update: { passwordHash, name, isActive: true },
    create: { name, email, passwordHash },
  });

  console.log(`Student admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());