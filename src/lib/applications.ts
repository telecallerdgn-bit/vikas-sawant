import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";

/**
 * Creates the partner account once the application is approved AND the fee is paid.
 *
 * Sab kuch ek transaction me hota hai:
 * - beech me kuch fail ho to user nahi banta aur application wapas APPROVED rehti hai
 * - do requests ek saath aayein to sirf ek activation chalti hai
 */
export async function activateIfReady(applicationId: number) {
  // Jaldi bahar nikalne ke liye halka check (asli check transaction ke andar hai)
  const pre = await prisma.partnerApplication.findUnique({
    where: { id: applicationId },
    select: { status: true, feePaid: true, userId: true },
  });
  if (!pre || pre.status !== "APPROVED" || !pre.feePaid || pre.userId) return null;

  // Code pehle bana lete hain, taaki transaction chhoti rahe
  const referralCode = await generateReferralCode();

  return prisma.$transaction(async (tx) => {
    // Application ko "claim" karo: sirf ek request ka count 1 aayega
    const claim = await tx.partnerApplication.updateMany({
      where: { id: applicationId, status: "APPROVED", feePaid: true, userId: null },
      data: { status: "ACTIVE" },
    });
    if (claim.count !== 1) return null; // dusri request pehle pahunch gayi

    const app = await tx.partnerApplication.findUniqueOrThrow({ where: { id: applicationId } });

    const clash = await tx.user.findFirst({
      where: { OR: [{ email: app.email }, { mobile: app.mobile }] },
      select: { id: true },
    });
    // Yahan throw hone par claim bhi rollback ho jata hai (status wapas APPROVED)
    if (clash) throw new Error("A user with this email or mobile already exists");

    const user = await tx.user.create({
      data: {
        name: app.name,
        email: app.email,
        mobile: app.mobile,
        password: app.passwordHash,
        role: "PARTNER",
        referralCode,
        parentId: app.sponsorId,
        districtId: app.districtId,
      },
    });

    await tx.partnerApplication.update({
      where: { id: app.id },
      data: { userId: user.id, passwordHash: "" },
    });

    return user;
  });
}