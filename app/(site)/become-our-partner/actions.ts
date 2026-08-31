"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import {
  detectBot,
  getRequestMeta,
  isRateLimited,
  RATE_LIMIT_MESSAGE,
} from "@/lib/forms";

const PartnerSchema = z.object({
  companyName: z.string().trim().min(2, "Please enter your company name."),
  contactName: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  partnerType: z.string().trim().max(80).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little about what you manufacture or supply.")
    .max(5000),
});

export type PartnerState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitPartnerApplication(
  _prev: PartnerState,
  formData: FormData,
): Promise<PartnerState> {
  // Silently accept and discard obvious bot traffic. Returning success means a
  // scraper cannot tune its way past the check by watching for an error.
  if (detectBot(formData)) return { ok: true };

  const parsed = PartnerSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    partnerType: formData.get("partnerType"),
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
    await db.partnerApplication.create({
      data: {
        companyName: parsed.data.companyName,
        contactName: parsed.data.contactName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        country: parsed.data.country || null,
        partnerType: parsed.data.partnerType || null,
        message: parsed.data.message,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });
  } catch {
    // Never lose an approach to a silent failure — tell them it did not send
    // so they can use the email address instead.
    return {
      error:
        "Something went wrong sending that. Please try again, or email us directly.",
    };
  }

  return { ok: true };
}
