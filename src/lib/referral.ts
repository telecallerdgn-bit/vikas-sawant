import { prisma } from "@/lib/prisma";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // O, 0, I, 1 hata diye

export async function generateReferralCode() {
  for (let i = 0; i < 10; i++) {
    let code = "PRT";
    for (let j = 0; j < 5; j++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    const exists = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique referral code");
}