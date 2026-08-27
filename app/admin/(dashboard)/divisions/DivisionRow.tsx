"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteDivision, setPublished } from "./actions";

export type DivisionSummary = {
  id: string;
  slug: string;
  title: string;
  category: "EPCIM" | "SERVICE_OFFERING" | "PROCUREMENT";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  order: number;
  linked: number;
};

const CATEGORY_LABEL: Record<DivisionSummary["category"], string> = {
  EPCIM: "EPCIM",
  SERVICE_OFFERING: "Service offering",
  PROCUREMENT: "Procurement",
};

export default function DivisionRow({
  division,
  canManage,
}: {
  division: DivisionSummary;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const published = division.status === "PUBLISHED";

  function togglePublish() {
    setError(null);
    startTransition(async () => {
      const res = await setPublished(division.id, !published);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Delete "${division.title}" permanently?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteDivision(division.id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <tr className={pending ? "opacity-60" : undefined}>
      <td className="px-4 py-3">
        <Link
          href={`/admin/divisions/${division.id}`}
          className="font-medium text-brand-900 hover:text-accent-600"
        >
          {division.title}
        </Link>
        <p className="mt-0.5 font-mono text-[11px] text-steel-500">/{division.slug}</p>
        {error && (
          <p role="alert" className="mt-1 text-xs font-medium text-accent-700">
            {error}
          </p>
        )}
      </td>

      <td className="px-4 py-3 text-sm text-steel-700">
        {CATEGORY_LABEL[division.category]}
      </td>

      <td className="px-4 py-3 text-sm text-steel-700 tabular-nums">{division.order}</td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            published
              ? "bg-brand-900 text-white"
              : "border border-brand-200 text-steel-600"
          }`}
        >
          {published ? "Published" : "Draft"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          {canManage && (
            <button
              type="button"
              onClick={togglePublish}
              disabled={pending}
              className="text-xs font-semibold text-brand-900 hover:text-accent-600 disabled:opacity-50"
            >
              {published ? "Unpublish" : "Publish"}
            </button>
          )}
          <Link
            href={`/admin/divisions/${division.id}`}
            className="text-xs font-semibold text-brand-900 hover:text-accent-600"
          >
            Edit
          </Link>
          {canManage && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="text-xs font-semibold text-accent-700 hover:text-accent-800 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
