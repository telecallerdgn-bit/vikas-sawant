import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const districts = [
  { code: "PTA", name: "Patiala" },
  { code: "MOH", name: "SAS Nagar (Mohali)" },
  { code: "LDH", name: "Ludhiana" },
  { code: "ASR", name: "Amritsar" },
  { code: "JAL", name: "Jalandhar" },
  { code: "BTI", name: "Bathinda" },
];

async function main() {
  for (const d of districts) {
    await prisma.district.upsert({
      where: { name: d.name },
      update: { code: d.code },
      create: d,
    });
  }
  console.log("Districts ready");
}

main().finally(() => prisma.$disconnect());