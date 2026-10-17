import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";

/** Creates the partner account once the application is approved AND the fee is paid. */
export async function activateIfReady(applicationId: number) {
  const app = await prisma.partnerApplication.findUnique({ where: { id: applicationId } });
  if (!app || app.status !== "APPROVED" || !app.feePaid || app.userId) return null;

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email: app.email }, { mobile: app.mobile }] },
  });
  if (clash) throw new Error("A user with this email or mobile already exists");

  const user = await prisma.user.create({
    data: {
      name: app.name,
      email: app.email,
      mobile: app.mobile,
      password: app.passwordHash,
      role: "PARTNER",
      referralCode: await generateReferralCode(),
      parentId: app.sponsorId,
      districtId: app.districtId,
    },
  });

  await prisma.partnerApplication.update({
    where: { id: app.id },
    data: { userId: user.id, status: "ACTIVE", passwordHash: "" },
  });

  return user;
}