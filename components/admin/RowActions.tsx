"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Result = { error?: string };

/**
 * Publish / edit / delete controls shared by every admin list.
 *
 * The mutations are passed in rather than imported, so each entity keeps its
 * own Server Actions — which is what enforces per-entity permissions and cache
 * tags — while the interaction, pending state and error surface stay identical
 * across the admin.
 */
export default function RowActions({
  editHref,
  published,
  canManage,
  onTogglePublish,
  onDelete,
  confirmMessage,
}: {
  editHref: string;
  published: boolean;
  canManage: boolean;
  onTogglePublish: (publish: boolean) => Promise<Result>;
  onDelete: () => Promise<Result>;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<Result>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        {canManage && (
          <button
            type="button"
            onClick={() => run(() => onTogglePublish(!published))}
            disabled={pending}
            className="text-xs font-semibold text-brand-900 hover:text-accent-600 disabled:opacity-50"
          >
            {published ? "Unpublish" : "Publish"}
          </button>
        )}
        <Link href={editHref} className="text-xs font-semibold text-brand-900 hover:text-accent-600">
          Edit
        </Link>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(confirmMessage)) run(onDelete);
            }}
            disabled={pending}
            className="text-xs font-semibold text-accent-700 hover:text-accent-800 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs font-medium text-accent-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        published ? "bg-brand-900 text-white" : "border border-brand-200 text-steel-600"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
