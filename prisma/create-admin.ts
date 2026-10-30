import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Production par Super Admin banata (ya uska password badalta) hai.
 * Email aur password code mein nahi, command se pehle PowerShell mein set karo:
 *
 *   $env:ADMIN_EMAIL="tumhara@email.com"
 *   $env:ADMIN_PASSWORD="ek-majboot-password"
 *   npm run db:prod:admin
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const plain = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Super Admin";

  if (!email || !plain) {
    throw new Error("ADMIN_EMAIL aur ADMIN_PASSWORD pehle set karo.");
  }
  if (plain.length < 10) {
    throw new Error("Password kam se kam 10 akshar ka rakho.");
  }

  const password = await bcrypt.hash(plain, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password, role: "ADMIN", name },
    create: { name, email, password, role: "ADMIN" },
  });

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());