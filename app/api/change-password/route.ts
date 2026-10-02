import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/client";
import { changePasswordSchema } from "@/app/lib/validation";
import authOptions from "@/app/api/auth/authOptions";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
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

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Google-only accounts have no password to change
    if (!user.hashedPassword) {
      return NextResponse.json(
        { error: "This account signs in with Google and has no password" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: [{ field: "currentPassword", message: "Current password is incorrect" }],
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    return NextResponse.json({ message: "Password updated" }, { status: 200 });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}