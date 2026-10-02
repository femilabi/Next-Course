import { Resend } from "resend";
import WelcomeTemplate from "@/emails/WelcomeTemplate";
import { NextResponse } from "next/server";
import { createElement } from "react";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "oderinwalefemi150@gmail.com",
        subject: "Hello from Resend",
        react: createElement(WelcomeTemplate, { name: "Femi", email: "oderinwalefemi150@gmail.com" }),
    });

    return NextResponse.json({ message: "Email sent successfully" });
}