// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/prisma/client";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters") // bcrypt ignores bytes past 72
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, hashedPassword },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: unknown) {
  if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }
  console.error("Register error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
}