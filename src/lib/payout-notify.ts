import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

/** Tells the partner about their payout. Never throws. */
export async function notifyPayout(payoutId: number, event: "approved" | "rejected" | "paid") {
  const p = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: { user: { select: { name: true, email: true, mobile: true } } },
  });
  if (!p) return;

  const amount = inr.format(Number(p.amount));
  const text =
    event === "approved"
      ? `Your withdrawal #${p.id} of ${amount} is approved and will be paid soon.`
      : event === "rejected"
        ? `Your withdrawal #${p.id} of ${amount} was not approved. ${p.note ?? ""}`.trim()
        : `Your withdrawal #${p.id} of ${amount} has been paid. Bank reference (UTR): ${p.utr ?? ""}.`;

  const base = {
    recipientName: p.user.name,
    message: text,
    event: `PAYOUT_${event.toUpperCase()}`,
    refType: "payout",
    refId: p.id,
  };

  await notify({ ...base, channel: "EMAIL", recipient: p.user.email });
  if (event === "paid" && p.user.mobile) {
    await notify({ ...base, channel: "SMS", recipient: p.user.mobile });
  }
}