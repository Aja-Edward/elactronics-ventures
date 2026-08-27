"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteCertification, setPublished } from "./actions";

export type CertSummary = {
  id: string;
  name: string;
  issuer: string | null;
  reference: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  order: number;
  expiresAt: string | null;
  expired: boolean;
  logoUrl: string | null;
};

export default function CertificationRow({
  cert,
  canManage,
}: {
  cert: CertSummary;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const published = cert.status === "PUBLISHED";

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = await setPublished(cert.id, !published);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Delete "${cert.name}"? The image stays in the media library.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCertification(cert.id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <tr className={pending ? "opacity-60" : undefined}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-brand-100 bg-surface">
            {cert.logoUrl ? (
              <Image src={cert.logoUrl} alt="" fill sizes="56px" className="object-contain p-0.5" />
            ) : null}
          </span>
          <div className="min-w-0">
            <Link
              href={`/admin/certifications/${cert.id}`}
              className="font-medium text-brand-900 hover:text-accent-600"
            >
              {cert.name}
            </Link>
            <p className="mt-0.5 text-[11px] text-steel-500">
              {[cert.issuer, cert.reference].filter(Boolean).join(" · ") || "—"}
            </p>
            {error && <p role="alert" className="mt-1 text-xs font-medium text-accent-700">{error}</p>}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-steel-700 tabular-nums">
        {cert.expiresAt ?? "—"}
        {cert.expired && (
          <span className="ml-2 rounded bg-accent-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent-700">
            Expired
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-sm text-steel-700 tabular-nums">{cert.order}</td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            published ? "bg-brand-900 text-white" : "border border-brand-200 text-steel-600"
          }`}
        >
          {published ? "Published" : "Draft"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          {canManage && (
            <button type="button" onClick={toggle} disabled={pending}
              className="text-xs font-semibold text-brand-900 hover:text-accent-600 disabled:opacity-50">
              {published ? "Unpublish" : "Publish"}
            </button>
          )}
          <Link href={`/admin/certifications/${cert.id}`} className="text-xs font-semibold text-brand-900 hover:text-accent-600">
            Edit
          </Link>
          {canManage && (
            <button type="button" onClick={remove} disabled={pending}
              className="text-xs font-semibold text-accent-700 hover:text-accent-800 disabled:opacity-50">
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
