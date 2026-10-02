import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/authOptions";
import ChangePasswordForm from "@/app/components/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/change-password");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <ChangePasswordForm />
    </main>
  );
}