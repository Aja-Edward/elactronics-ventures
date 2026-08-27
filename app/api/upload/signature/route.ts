import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { isCloudinaryConfigured, isMediaFolder, signUpload } from "@/lib/cloudinary";

/**
 * Issues a short-lived signature so an authenticated admin's browser can
 * upload directly to Cloudinary.
 *
 * The signature commits the destination folder, so a client cannot rewrite it
 * to land files somewhere else in this shared account.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { folder?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const folder = body.folder ?? "general";
  if (!isMediaFolder(folder)) {
    return NextResponse.json(
      { error: "Unknown upload folder." },
      { status: 400 },
    );
  }

  return NextResponse.json(signUpload(folder));
}
