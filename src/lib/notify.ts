import type { NotificationChannel, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Messages me use hone wali cheezein ek jagah, badalna aasan rahe
const BRAND = "vikas-sawant";
const PARTNER_FEE = "₹2,999";

type Input = {
  channel: NotificationChannel;
  recipientName: string;
  recipient: string;
  message: string;
  event: string;
  refType?: string;
  refId?: number;
};

/** Sends one message through the configured provider. Throws on failure. */
async function deliver(channel: NotificationChannel, recipient: string, message: string) {
  const mode = process.env.NOTIFY_MODE ?? "dev";

  if (mode === "dev") {
    console.log(`[notify:dev] ${channel} -> ${recipient}: ${message}`);
    return { provider: "dev" };
  }

  if (mode === "webhook") {
    const url = process.env.NOTIFY_WEBHOOK_URL;
    if (!url) throw new Error("NOTIFY_WEBHOOK_URL is not set");

    const to = channel === "EMAIL" || !/^\d{10}$/.test(recipient) ? recipient : `+91${recipient}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.NOTIFY_WEBHOOK_TOKEN) {
      headers.Authorization = `Bearer ${process.env.NOTIFY_WEBHOOK_TOKEN}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ channel: channel.toLowerCase(), to, message }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Provider responded with ${res.status}`);
    return { provider: "webhook" };
  }

  throw new Error(`Unknown NOTIFY_MODE "${mode}"`);
}

async function attempt(id: number) {
  const n = await prisma.notification.findUnique({ where: { id } });
  if (!n) return;

  let provider: string;
  try {
    ({ provider } = await deliver(n.channel, n.recipient, n.message));
  } catch (e) {
    await prisma.notification.update({
      where: { id },
      data: {
        status: "FAILED",
        error: (e instanceof Error ? e.message : "Unknown error").slice(0, 500),
        attempts: { increment: 1 },
      },
    });
    return;
  }

  // Message ja chuka hai. Ab database update fail ho to use FAILED mat banao,
  // warna Resend dabane par wahi message dobara chala jayega.
  try {
    await prisma.notification.update({
      where: { id },
      data: { status: "SENT", provider, error: null, sentAt: new Date(), attempts: { increment: 1 } },
    });
  } catch (e) {
    console.error("[notify] message was sent but the log could not be updated", id, e);
  }
}

/** Logs and sends a message. Never throws, so it can never break the main action. */
export async function notify(input: Input) {
  try {
    const row = await prisma.notification.create({ data: input });
    await attempt(row.id);
  } catch (e) {
    console.error("[notify] could not log notification", e);
  }
}

/**
 * Sirf FAILED message dobara bhejta hai.
 * Double click ya do admin ek saath dabayein to bhi message sirf ek baar jata hai.
 * Return: true agar bheja gaya, false agar message FAILED nahi tha ya kisi aur ne le liya.
 */
export async function retryNotification(id: number) {
  const claim = await prisma.notification.updateMany({
    where: { id, status: "FAILED" },
    data: { status: "QUEUED" },
  });
  if (claim.count !== 1) return false;

  await attempt(id);
  return true;
}

/* ---------------- Shipments ---------------- */

export async function notifyShipment(shipmentId: number, status: ShipmentStatus) {
  const s = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      order: {
        include: { student: true, course: { select: { name: true } } },
      },
    },
  });
  if (!s) return;

  const { student, course } = s.order;
  const awb = s.awb ?? "";
  const courier = s.courier ?? "the courier";

  const plan: Partial<Record<ShipmentStatus, { channel: NotificationChannel; text: string }>> = {
    LABEL_GENERATED: {
      channel: "SMS",
      text: `Your ${course.name} books are packed. ${courier} AWB ${awb}.`,
    },
    DISPATCHED: { channel: "WHATSAPP", text: `Book parcel ${awb}: picked up by ${courier}.` },
    OUT_FOR_DELIVERY: { channel: "WHATSAPP", text: `Book parcel ${awb} is out for delivery today.` },
    DELIVERED: { channel: "WHATSAPP", text: `Book parcel ${awb} has been delivered. Happy learning!` },
    DELIVERY_FAILED: {
      channel: "SMS",
      text: `Delivery attempt for parcel ${awb} failed. We will contact you shortly.`,
    },
    RETURNED: {
      channel: "SMS",
      text: `Parcel ${awb} is being returned to us. Please contact support to arrange a re-send.`,
    },
  };

  const item = plan[status];
  if (!item) return; // Packed and In transit send nothing

  await notify({
    channel: item.channel,
    recipientName: student.name,
    recipient: student.mobile,
    message: item.text,
    event: `SHIPMENT_${status}`,
    refType: "shipment",
    refId: shipmentId,
  });
}

/* ---------------- Partner applications ---------------- */

export type AppEvent = "submitted" | "more_info" | "approved" | "rejected" | "fee_paid" | "activated";

// Note khali ho to message adhura ("...: ") na rahe
const withNote = (text: string, note?: string | null) => {
  const n = note?.trim();
  return n ? `${text} ${n}` : text;
};

export async function notifyApplication(applicationId: number, event: AppEvent) {
  const app = await prisma.partnerApplication.findUnique({
    where: { id: applicationId },
    include: { user: { select: { referralCode: true } } },
  });
  if (!app) return;

  const send = (channel: NotificationChannel, recipient: string, message: string) =>
    notify({
      channel,
      recipientName: app.name,
      recipient,
      message,
      event: `APPLICATION_${event.toUpperCase()}`,
      refType: "application",
      refId: applicationId,
    });

  switch (event) {
    case "submitted":
      await send("EMAIL", app.email, `Hi ${app.name}, we received your partner application. We will review it shortly.`);
      break;

    case "more_info":
      await send("EMAIL", app.email, withNote("We need more information for your partner application:", app.note));
      break;

    case "rejected":
      await send("EMAIL", app.email, withNote("Your partner application was not approved.", app.note));
      break;

    case "approved":
      if (app.feePaid) return; // the activation message follows instead
      await send(
        "EMAIL",
        app.email,
        `Your partner application is approved. Pay the ${PARTNER_FEE} registration & training fee to activate your account.`
      );
      break;

    case "fee_paid":
      // Application pehle se approved ya active ho to activation ka message aayega, ye nahi
      if (app.status === "APPROVED" || app.status === "ACTIVE") return;
      await send(
        "EMAIL",
        app.email,
        "We received your registration & training fee. Your account activates once your application is approved."
      );
      break;

    case "activated": {
      const code = app.user?.referralCode ?? "";
      await send(
        "EMAIL",
        app.email,
        `Welcome aboard! Your partner account is active. Your referral code is ${code}.`
      );
      await send("SMS", app.mobile, `${BRAND}: your partner account is active. Referral code ${code}.`);
      break;
    }
  }
}