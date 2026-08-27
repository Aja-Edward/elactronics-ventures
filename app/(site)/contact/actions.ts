"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import {
  detectBot,
  getRequestMeta,
  isRateLimited,
  RATE_LIMIT_MESSAGE,
} from "@/lib/forms";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please tell us a little more.").max(5000),
});

export type ContactState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Silently accept and discard obvious bot traffic. Returning success means a
  // scraper cannot tune its way past the check by watching for an error.
  if (detectBot(formData)) return { ok: true };

  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }

  const meta = await getRequestMeta();

  if (await isRateLimited(meta.ipAddress)) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    await db.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });
  } catch {
    // Never lose an enquiry to a silent failure — tell them it did not send so
    // they can use the phone number instead.
    return {
      error: "Something went wrong sending that. Please try again, or call us directly.",
    };
  }

  return { ok: true };
}
