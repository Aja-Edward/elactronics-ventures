"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import {
  detectBot,
  getRequestMeta,
  isRateLimited,
  RATE_LIMIT_MESSAGE,
} from "@/lib/forms";

const QuoteSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name."),
  company: z.string().trim().min(2, "Please enter your company."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(6, "Please enter a phone number we can reach you on."),
  serviceInterest: z.string().trim().max(160).optional().or(z.literal("")),
  projectLocation: z.string().trim().max(160).optional().or(z.literal("")),
  projectType: z.string().trim().max(160).optional().or(z.literal("")),
  timeline: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please describe the scope.").max(5000),
});

export type QuoteState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitQuote(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  if (detectBot(formData)) return { ok: true };

  const parsed = QuoteSchema.safeParse(Object.fromEntries(formData));

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

  const d = parsed.data;

  try {
    await db.quoteRequest.create({
      data: {
        fullName: d.fullName,
        company: d.company,
        email: d.email,
        phone: d.phone,
        serviceInterest: d.serviceInterest || null,
        projectLocation: d.projectLocation || null,
        projectType: d.projectType || null,
        timeline: d.timeline || null,
        message: d.message,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });
  } catch {
    return {
      error: "Something went wrong sending that. Please try again, or call us directly.",
    };
  }

  return { ok: true };
}
