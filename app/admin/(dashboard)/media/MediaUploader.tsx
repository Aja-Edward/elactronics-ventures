"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { recordUpload } from "./actions";

const FOLDERS = [
  "general",
  "hero",
  "divisions",
  "equipment",
  "projects",
  "team",
  "clients",
  "certifications",
  "news",
  "gallery",
] as const;

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"];

type Status = { kind: "idle" } | { kind: "busy"; label: string } | { kind: "error"; message: string };

export default function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState<(typeof FOLDERS)[number]>("general");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function upload(files: FileList) {
    const list = Array.from(files);

    // Validate before touching the network, so the failure is immediate and
    // explains itself rather than surfacing as a Cloudinary error code.
    for (const file of list) {
      if (!ACCEPTED.includes(file.type)) {
        setStatus({ kind: "error", message: `${file.name}: only JPEG, PNG, WebP, AVIF or PDF.` });
        return;
      }
      if (file.size > MAX_BYTES) {
        setStatus({
          kind: "error",
          message: `${file.name} is ${(file.size / 1048576).toFixed(1)}MB — the limit is 10MB.`,
        });
        return;
      }
    }

    try {
      for (const [index, file] of list.entries()) {
        setStatus({ kind: "busy", label: `Uploading ${index + 1} of ${list.length}…` });

        const sigRes = await fetch("/api/upload/signature", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ folder }),
        });
        if (!sigRes.ok) {
          const { error } = await sigRes.json().catch(() => ({ error: "" }));
          throw new Error(error || "Could not authorise the upload.");
        }
        const sig = await sigRes.json();

        const form = new FormData();
        form.append("file", file);
        form.append("api_key", sig.apiKey);
        form.append("timestamp", String(sig.timestamp));
        form.append("signature", sig.signature);
        form.append("folder", sig.folder);

        const upRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
          { method: "POST", body: form },
        );
        if (!upRes.ok) {
          const detail = await upRes.json().catch(() => null);
          throw new Error(detail?.error?.message ?? "Cloudinary rejected the upload.");
        }
        const asset = await upRes.json();

        const recorded = await recordUpload({
          publicId: asset.public_id,
          url: asset.url,
          secureUrl: asset.secure_url,
          resourceType: asset.resource_type === "video" ? "VIDEO" : asset.format === "pdf" ? "DOCUMENT" : "IMAGE",
          format: asset.format ?? null,
          width: asset.width ?? null,
          height: asset.height ?? null,
          bytes: asset.bytes ?? null,
          folder: sig.folder,
        });

        if (!recorded.ok) throw new Error(recorded.error);
      }

      setStatus({ kind: "idle" });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  }

  const busy = status.kind === "busy";

  return (
    <div className="rounded-lg border border-brand-100 bg-white p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="folder"
            className="block text-xs font-semibold uppercase tracking-wide text-steel-600"
          >
            Folder
          </label>
          <select
            id="folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value as (typeof FOLDERS)[number])}
            disabled={busy}
            className="rounded border border-brand-200 px-3 py-2 text-sm text-brand-950 outline-none focus:border-brand-900"
          >
            {FOLDERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="files"
            className="block text-xs font-semibold uppercase tracking-wide text-steel-600"
          >
            Files
          </label>
          <input
            id="files"
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(",")}
            disabled={busy}
            onChange={(e) => e.target.files?.length && upload(e.target.files)}
            className="block text-sm text-steel-700 file:mr-3 file:rounded file:border-0 file:bg-brand-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-800 disabled:opacity-60"
          />
        </div>

        {busy && (
          <p className="pb-2 text-sm font-medium text-brand-900">{status.label}</p>
        )}
      </div>

      {status.kind === "error" && (
        <p
          role="alert"
          className="mt-3 rounded border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-800"
        >
          {status.message}
        </p>
      )}

      <p className="mt-3 text-xs text-steel-500">
        JPEG, PNG, WebP, AVIF or PDF, up to 10MB. Files upload straight to
        Cloudinary under <code>elatronics/</code> — they never pass through this
        server.
      </p>
    </div>
  );
}
