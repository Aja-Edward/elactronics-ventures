"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, destroySession, verifyCredentials } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);

  // One message for every failure mode — wrong password, unknown email, or a
  // deactivated account. Distinguishing them tells an attacker which emails
  // are real.
  if (!user) {
    return { error: "Incorrect email or password." };
  }

  const headerList = await headers();
  await createSession(user.id, {
    userAgent: headerList.get("user-agent"),
    ipAddress:
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });

  // redirect() throws internally, so it must sit outside any try/catch.
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
