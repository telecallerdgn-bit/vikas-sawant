import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const roles = ["STUDENT", "PARTNER", "DISTRICT_ADMIN", "SUB_SUPER", "FINANCE", "PACKING", "ADMIN"] as const;

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional(),
  password: z.string().min(8),
  role: z.enum(roles),
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// Create a new user
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const { name, email, mobile, password, role } = parsed.data;

  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
  }

  if (mobile) {
    const mobileExists = await prisma.user.findUnique({ where: { mobile } });
    if (mobileExists) {
      return NextResponse.json({ error: "This mobile number is already registered" }, { status: 409 });
    }
  }

  const user = await prisma.user.create({
    data: { name, email, mobile, role, password: await bcrypt.hash(password, 10) },
    select: userSelect,
  });

  return NextResponse.json(user, { status: 201 });
}

// List all users
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });

  return NextResponse.json(users);
}